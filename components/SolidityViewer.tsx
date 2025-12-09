import React from 'react';
import { SOLIDITY_CONTRACT_CODE } from '../constants';
import { Code, Copy, Check } from 'lucide-react';

export const SolidityViewer: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SOLIDITY_CONTRACT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-12 border border-dark-700 rounded-xl bg-dark-900 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-700">
        <div className="flex items-center gap-2 text-slate-300">
          <Code size={18} className="text-brand-500" />
          <span className="font-mono text-sm font-semibold">Voting.sol</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-xs md:text-sm font-mono text-slate-300 leading-relaxed">
          <code>{SOLIDITY_CONTRACT_CODE}</code>
        </pre>
      </div>
    </div>
  );
};
