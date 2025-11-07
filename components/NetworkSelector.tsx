'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Network } from '@/lib/config';

interface NetworkSelectorProps {
  value: Network;
  onChange: (network: Network) => void;
  disabled?: boolean;
}

export function NetworkSelector({ value, onChange, disabled }: NetworkSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select network" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="testnet">India Testnet</SelectItem>
        <SelectItem value="mainnet" disabled>
          Mainnet (Coming Soon)
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
