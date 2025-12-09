import React, { useState } from 'react';
import { Transaction } from '../types';
import { FileText, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, Hash, User, Info } from 'lucide-react';

interface TransactionLogProps {
  transactions: Transaction[];
}

export const TransactionLog: React.FC<TransactionLogProps> = ({ transactions }) => {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  if (transactions.length === 0) return null;

  const toggleExpand = (hash: string) => {
    setExpandedTx(expandedTx === hash ? null : hash);
  };

  return (
    <div className="mt-8 border border-dark-700 rounded-xl bg-dark-900 overflow-hidden shadow-lg">
      <div className="flex items-center px-4 py-3 bg-dark-800 border-b border-dark-700">
        <FileText size={18} className="text-brand-500 mr-2" />
        <span className="font-semibold text-slate-200">Blockchain Verification Log</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm text-slate-400">
          <thead className="bg-dark-800/50 uppercase font-medium border-b border-dark-700">
            <tr>
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3">Tx Hash</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Block</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/50">
            {transactions.slice().reverse().map((tx) => (
              <React.Fragment key={tx.hash}>
                <tr 
                  onClick={() => toggleExpand(tx.hash)}
                  className={`cursor-pointer transition-colors ${
                    expandedTx === tx.hash ? 'bg-dark-800/80' : 'hover:bg-dark-800/30'
                  }`}
                  title="Click to view full transaction details"
                >
                  <td className="px-4 py-3 text-slate-600">
                    {expandedTx === tx.hash ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </td>
                  <td className="px-4 py-3 font-mono text-brand-400">
                    {tx.hash.substring(0, 10)}...
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      tx.method === 'Vote' ? 'bg-brand-900/30 text-brand-300 border-brand-800' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {tx.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{tx.blockNumber}</td>
                  <td className="px-4 py-3 font-mono">
                    {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {tx.status === 'Success' ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : tx.status === 'Failed' ? (
                        <XCircle size={14} className="text-red-500" />
                      ) : (
                        <Clock size={14} className="text-amber-500 animate-pulse" />
                      )}
                      <span className={
                        tx.status === 'Success' ? 'text-green-400' : 
                        tx.status === 'Failed' ? 'text-red-400' : 'text-amber-400'
                      }>
                        {tx.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
                {expandedTx === tx.hash && (
                  <tr className="bg-dark-800/50 animate-fade-in">
                    <td colSpan={7} className="px-4 py-4 border-b border-dark-700/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-3">
                           <div className="flex items-center gap-2 text-slate-300">
                             <Hash size={14} className="text-slate-500" />
                             <span className="font-semibold text-slate-500 w-20">Full Hash:</span>
                             <span className="font-mono text-slate-300 select-all bg-dark-900 px-2 py-1 rounded border border-dark-700">{tx.hash}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-300">
                             <User size={14} className="text-slate-500" />
                             <span className="font-semibold text-slate-500 w-20">From:</span>
                             <span className="font-mono text-slate-300 select-all bg-dark-900 px-2 py-1 rounded border border-dark-700">{tx.from}</span>
                           </div>
                        </div>
                        <div className="space-y-3">
                            {tx.details && (
                                <div className="flex items-start gap-2 text-slate-300">
                                    <Info size={14} className="text-slate-500 mt-0.5" />
                                    <span className="font-semibold text-slate-500 w-16">Details:</span>
                                    <span className={`font-mono px-2 py-1 rounded border border-dark-700 bg-dark-900 ${
                                        tx.status === 'Failed' ? 'text-red-400 border-red-900/30' : 'text-slate-300'
                                    }`}>
                                        {tx.details}
                                    </span>
                                </div>
                            )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};