export interface ContractState {
  token_uid: string;
  max_bet_amount: number;
  house_edge_basis_points: number;
  random_bit_length: number;
  available_tokens: number;
  total_liquidity_provided: number;
  liquidity_providers: Record<string, number>;
  balances: Record<string, number>;
}

export interface BlueprintInfo {
  id: string;
  name: string;
  public_methods: string[];
  attributes: Record<string, string>;
}

export interface ContractHistory {
  transactions: ContractTransaction[];
  total: number;
}

export interface ContractTransaction {
  tx_id: string;
  timestamp: number;
  method: string;
  caller: string;
  success: boolean;
}

export interface HathorRPCRequest {
  method: string;
  params?: any;
}

export interface HathorRPCResponse<T = any> {
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export interface GetBalanceParams {
  network: string;
  tokens: string[];
  addressIndexes?: number[];
}

export interface GetAddressParams {
  network: string;
  type: 'first_empty' | 'full_path' | 'index' | 'client';
  full_path?: string;
  index?: number;
}

export interface SendNanoContractTxParams {
  method: string;
  blueprint_id?: string;
  nc_id?: string;
  actions: NanoContractAction[];
  args: any[];
  push_tx: boolean;
}

export interface NanoContractAction {
  type: 'deposit' | 'withdrawal';
  amount: string;
  token: string;
  address?: string;
  changeAddress?: string;
}
