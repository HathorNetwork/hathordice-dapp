'use client';

import { TOKENS } from '@/lib/utils';

interface TokenSelectorProps {
  selectedToken: string;
  onTokenChange: (token: string) => void;
}

export default function TokenSelector({ selectedToken, onTokenChange }: TokenSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-slate-400">Select Token</label>
      <select
        value={selectedToken}
        onChange={(e) => onTokenChange(e.target.value)}
        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {TOKENS.map((token) => (
          <option key={token.value} value={token.value}>
            {token.label}
          </option>
        ))}
      </select>
    </div>
  );
}
