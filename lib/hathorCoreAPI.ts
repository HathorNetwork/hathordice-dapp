import { Network } from './config';
import { ContractState, BlueprintInfo, ContractHistory } from '@/types/hathor';

export class HathorCoreAPI {
  private baseUrl: string;

  constructor(network: Network) {
    this.baseUrl = network === 'mainnet' 
      ? 'https://node1.mainnet.hathor.network/v1a'
      : 'https://node1.india.testnet.hathor.network/v1a';
  }

  async getBlueprintInfo(blueprintId: string): Promise<BlueprintInfo> {
    const response = await fetch(`${this.baseUrl}/nc_blueprint/${blueprintId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch blueprint info: ${response.statusText}`);
    }
    return response.json();
  }

  async getContractState(contractId: string): Promise<ContractState> {
    const fields = ['max_bet_amount', 'token_uid', 'house_edge_basis_points', 'random_bit_length', 'available_tokens'];
    const queryString = fields.map(field => `fields[]=${field}`).join('&');
    const response = await fetch(`${this.baseUrl}/nano_contract/state?id=${contractId}&${queryString}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch contract state: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      token_uid: data.fields?.token_uid?.value || '00',
      max_bet_amount: data.fields?.max_bet_amount?.value || 0,
      house_edge_basis_points: data.fields?.house_edge_basis_points?.value || 200,
      random_bit_length: data.fields?.random_bit_length?.value || 16,
      available_tokens: data.fields?.available_tokens?.value || 0,
      total_liquidity_provided: data.fields?.total_liquidity_provided?.value || 0,
    };
  }

  async getContractHistory(contractId: string, limit: number = 50): Promise<ContractHistory> {
    const response = await fetch(`${this.baseUrl}/nano_contract/history?id=${contractId}&count=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch contract history: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      transactions: data.history?.map((tx: any) => ({
        tx_id: tx.hash,
        timestamp: tx.timestamp,
        nc_method: tx.nc_method,
        nc_caller: tx.nc_address,
        first_block: tx.first_block,
        is_voided: tx.is_voided,
      })) || [],
      total: data.history?.length || 0,
    };
  }

  async getTransaction(txId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/transaction?id=${txId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transaction: ${response.statusText}`);
    }
    return response.json();
  }

  async callViewFunction(contractId: string, method: string, args: any[] = [], callerAddress?: string): Promise<any> {
    const body: any = {
      id: contractId,
      method,
      args,
    };

    if (callerAddress) {
      body.caller = callerAddress;
    }

	const queryString = `calls[]=${method}(${args})`;
    const response = await fetch(`${this.baseUrl}/nano_contract/state?id=${contractId}&${queryString}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to call view function: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getMaximumLiquidityRemoval(contractId: string, callerAddress: string): Promise<bigint> {
    const result = await this.callViewFunction(contractId, 'calculate_maximum_liquidity_removal', [], callerAddress);
    // The result should contain the maximum amount that can be removed
    return BigInt(result.result || 0);
  }
}
