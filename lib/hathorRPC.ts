import { HathorRPCRequest, HathorRPCResponse, GetBalanceParams, GetAddressParams, SendNanoContractTxParams } from '@/types/hathor';

export class HathorRPCService {
  private useMock: boolean;

  constructor(useMock: boolean = false) {
    this.useMock = useMock;
  }

  async request<T = any>(method: string, params?: any): Promise<T> {
    if (this.useMock) {
      return this.mockRequest<T>(method, params);
    }

    if (typeof window === 'undefined' || !(window as any).hathorRpc) {
      throw new Error('Hathor RPC not available. Please connect a wallet.');
    }

    const rpc = (window as any).hathorRpc;
    const response: HathorRPCResponse<T> = await rpc.request({ method, params });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result as T;
  }

  async getConnectedNetwork(): Promise<{ network: string; genesisHash: string }> {
    return this.request('htr_getConnectedNetwork');
  }

  async getBalance(params: GetBalanceParams): Promise<any[]> {
    return this.request('htr_getBalance', params);
  }

  async getAddress(params: GetAddressParams): Promise<{ address: string; index: number; addressPath: string }> {
    return this.request('htr_getAddress', params);
  }

  async sendNanoContractTx(params: SendNanoContractTxParams): Promise<any> {
    return this.request('htr_sendNanoContractTx', params);
  }

  private async mockRequest<T>(method: string, params?: any): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (method) {
      case 'htr_getConnectedNetwork':
        return { network: 'india-testnet', genesisHash: '0x123...' } as T;

      case 'htr_getBalance':
        return [{
          token: { id: '00', name: 'Hathor', symbol: 'HTR' },
          balance: { unlocked: 1250.50, locked: 0 },
          tokenAuthorities: { unlocked: { mint: false, melt: false }, locked: { mint: false, melt: false } },
          transactions: 42,
          lockExpires: null,
        }] as T;

      case 'htr_getAddress':
        return { address: 'WYBwT3xLpDnHNtYZiU52oanupVeDKhAvNp', index: 0, addressPath: "m/44'/280'/0'/0/0" } as T;

      case 'htr_sendNanoContractTx':
        return {
          hash: '0xabc123...',
          success: true,
          timestamp: Date.now(),
        } as T;

      default:
        throw new Error(`Mock not implemented for method: ${method}`);
    }
  }
}
