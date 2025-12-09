import React, { useState, useEffect } from 'react';
import { Transaction, MerkleProof } from '../types';
import { simpleHash } from '../services/merkleTree';
import { ShieldCheck, ShieldAlert, GitMerge, ArrowDown, Database, Lock } from 'lucide-react';
import { Button } from './Button';

interface MerkleVerifierProps {
  transaction: Transaction | null;
  currentRoot: string;
  onClose: () => void;
}

export const MerkleVerifier: React.FC<MerkleVerifierProps> = ({ transaction, currentRoot, onClose }) => {
  const [step, setStep] = useState(0);
  const [calculatedRoot, setCalculatedRoot] = useState<string>("");
  const [status, setStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');

  const proof = transaction?.proofData;

  useEffect(() => {
    if (proof) {
      setStep(0);
      setStatus('idle');
      setCalculatedRoot("");
    }
  }, [proof]);

  const verifyProof = () => {
    if (!proof) return;
    setStatus('verifying');
    setStep(0);

    let currentHash = proof.leaf;
    let currentIdx = proof.index;

    const interval = setInterval(() => {
      setStep(prev => {
        const nextStep = prev + 1;
        
        // Processing steps (siblings)
        if (prev < proof.siblings.length) {
          const sibling = proof.siblings[prev];
          const isRight = currentIdx % 2 === 1;
          // Visual simulation of hash combination
          const pair = isRight ? sibling + currentHash : currentHash + sibling; // Simulating order
          // In real merkle tree we'd hash here. For visual consistency with our mock service:
          currentHash = simpleHash(pair); 
          currentIdx = Math.floor(currentIdx / 2);
          return nextStep;
        } 
        
        // Final Step: Compare
        clearInterval(interval);
        setCalculatedRoot(currentHash);
        if (currentHash === currentRoot) {
            setStatus('valid');
        } else {
            setStatus('invalid');
        }
        return prev;
      });
    }, 800);
  };

  if (!transaction || !proof) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-dark-600 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-dark-700 bg-dark-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-brand-900/20 p-2 rounded-lg text-brand-500">
               <GitMerge size={20} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-white">Cryptographic Verification</h3>
               <p className="text-xs text-slate-400 font-mono">Tx: {transaction.hash.substring(0, 16)}...</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">Close</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Input Data */}
              <div className="space-y-4">
                 <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Transaction Data</h4>
                 <div className="bg-dark-900 p-4 rounded-lg border border-dark-700 space-y-3">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Method</span>
                       <span className="text-white font-mono">{transaction.method}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">From</span>
                       <span className="text-brand-400 font-mono text-xs">{transaction.from}</span>
                    </div>
                    <div className="pt-2 border-t border-dark-700">
                       <span className="text-xs text-slate-500 block mb-1">Leaf Hash (Vote ID)</span>
                       <div className="bg-dark-800 p-2 rounded border border-dark-700 text-xs font-mono text-brand-300 break-all">
                          {proof.leaf}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right: Expected State */}
              <div className="space-y-4">
                 <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Blockchain State</h4>
                 <div className="bg-dark-900 p-4 rounded-lg border border-dark-700 space-y-3">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Status</span>
                       <span className="text-green-400 flex items-center gap-1"><ShieldCheck size={14}/> Live</span>
                    </div>
                    <div className="pt-2 border-t border-dark-700">
                       <span className="text-xs text-slate-500 block mb-1">Current Merkle Root</span>
                       <div className="bg-dark-800 p-2 rounded border border-dark-700 text-xs font-mono text-slate-300 break-all border-l-4 border-l-brand-500">
                          {currentRoot}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Visualization Area */}
           <div className="relative pt-4">
              <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-dark-700"></div>
              
              <div className="space-y-6 relative z-10">
                 
                 {/* Step 1: Leaf */}
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-dark-800 transition-colors duration-500 ${step >= 0 ? 'border-brand-500 text-brand-500' : 'border-dark-600 text-slate-600'}`}>
                        <Database size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-300">Vote Data (Leaf)</div>
                        <div className="text-xs font-mono text-slate-500">{proof.leaf}</div>
                    </div>
                 </div>

                 {/* Intermediate Steps */}
                 {proof.siblings.map((sibling, idx) => (
                    <div key={idx} className={`transition-opacity duration-500 ${step > idx ? 'opacity-100' : 'opacity-30'}`}>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dark-600 bg-dark-800 text-slate-400">
                             <Lock size={18} />
                          </div>
                          <div className="flex-1 bg-dark-900/50 p-3 rounded border border-dark-700/50">
                             <div className="flex justify-between mb-1">
                                <span className="text-xs text-slate-500">Combine with Sibling</span>
                                <span className="text-xs font-mono text-slate-600">{sibling}</span>
                             </div>
                             <div className="h-1 bg-dark-800 rounded overflow-hidden">
                                <div className="h-full bg-brand-500 animate-pulse w-full"></div>
                             </div>
                          </div>
                       </div>
                       <div className="ml-6 my-2 text-dark-500">
                           <ArrowDown size={20} />
                       </div>
                    </div>
                 ))}

                 {/* Final Result */}
                 <div className={`transition-all duration-500 ${status === 'verifying' ? 'opacity-50' : status !== 'idle' ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                            status === 'valid' ? 'bg-green-900/20 border-green-500 text-green-500' : 
                            status === 'invalid' ? 'bg-red-900/20 border-red-500 text-red-500' : 
                            'bg-dark-800 border-dark-600 text-slate-600'
                        }`}>
                            {status === 'valid' ? <ShieldCheck size={24} /> : status === 'invalid' ? <ShieldAlert size={24} /> : <GitMerge size={24} />}
                        </div>
                        <div className="flex-1">
                             <div className="text-sm font-semibold text-slate-300">Calculated Root</div>
                             <div className={`text-xs font-mono p-2 rounded border mt-1 transition-colors duration-300 ${
                                 status === 'valid' ? 'bg-green-900/10 border-green-500/30 text-green-400' :
                                 status === 'invalid' ? 'bg-red-900/10 border-red-500/30 text-red-400' :
                                 'bg-dark-900 border-dark-700 text-slate-500'
                             }`}>
                                 {calculatedRoot || "Waiting to verify..."}
                             </div>
                        </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-700 bg-dark-900/80 flex justify-end gap-3">
             {status === 'invalid' && (
                 <div className="mr-auto flex items-center text-red-400 text-sm animate-pulse">
                     <ShieldAlert size={16} className="mr-2" />
                     Root Mismatch! Data Tampering Detected.
                 </div>
             )}
             {status === 'valid' && (
                 <div className="mr-auto flex items-center text-green-400 text-sm">
                     <ShieldCheck size={16} className="mr-2" />
                     Cryptographic Proof Valid.
                 </div>
             )}

             <Button variant="secondary" onClick={onClose} disabled={status === 'verifying'}>Cancel</Button>
             <Button 
                onClick={verifyProof} 
                isLoading={status === 'verifying'} 
                disabled={status === 'valid' || status === 'invalid'}
                className="min-w-[120px]"
             >
                {status === 'idle' ? 'Run Verification' : status === 'verifying' ? 'Calculating...' : 'Verified'}
             </Button>
        </div>

      </div>
    </div>
  );
};