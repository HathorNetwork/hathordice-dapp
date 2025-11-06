import { Network } from './config';
import { ContractState, BlueprintInfo, ContractHistory } from '@/types/hathor';

export class HathorCoreAPI {
  private baseUrl: string;

  constructor(network: Network) {
    this.baseUrl = network === 'mainnet' 
      ? 'https://node1.mainnet.hathor.network/v1a'
      : 'https://node1.india-testnet.hathor.network/v1a';
  }

  async getBlueprintInfo(blueprintId: string): Promise<BlueprintInfo> {
    const response = await fetch(`${this.baseUrl}/nc_blueprint/${blueprintId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch blueprint info: ${response.statusText}`);
    }
    return response.json();
  }

  async getContractState(contractId: string): Promise<ContractState> {
    const response = await fetch(`${this.baseUrl}/nc_state/${contractId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch contract state: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      token_uid: data.fields?.token_uid || '00',
      max_bet_amount: data.fields?.max_bet_amount || 0,
      house_edge_basis_points: data.fields?.house_edge_basis_points || 200,
      random_bit_length: data.fields?.random_bit_length || 16,
      available_tokens: data.fields?.available_tokens || 0,
      total_liquidity_provided: data.fields?.total_liquidity_provided || 0,
      liquidity_providers: data.fields?.liquidity_providers || {},
      balances: data.fields?.balances || {},
    };
  }

  async getContractHistory(contractId: string, limit: number = 50): Promise<ContractHistory> {
    const response = await fetch(`${this.baseUrl}/nc_history/${contractId}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch contract history: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      transactions: data.history?.map((tx: any) => ({
        tx_id: tx.hash,
        timestamp: tx.timestamp,
        method: tx.nc_method,
        caller: tx.nc_caller,
        success: !tx.voided,
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
}
