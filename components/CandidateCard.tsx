import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Candidate } from '../types';
import { Button } from './Button';
import { Vote, User, Clock, AlertTriangle, X, ShieldCheck, FileSignature } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onVote: (id: number) => void;
  onVerifySignature?: (message: string, signature: string) => void;
  isVoting: boolean;
  isConnected: boolean;
  hasVoted: boolean;
  totalVotes: number;
  electionEndDate: number;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate, 
  onVote, 
  onVerifySignature,
  isVoting, 
  isConnected,
  hasVoted,
  totalVotes,
  electionEndDate
}) => {
  const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : "0.0";
  const [timeLeft, setTimeLeft] = useState('');
  const [isElectionEnded, setIsElectionEnded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Signature Verification State
  const [showVerify, setShowVerify] = useState(false);
  const [verifyInput, setVerifyInput] = useState({ message: '', signature: '' });

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = electionEndDate - now;
      
      if (diff <= 0) {
        setIsElectionEnded(true);
        setTimeLeft('Ended');
      } else {
        setIsElectionEnded(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [electionEndDate]);

  // Determine button state and label
  let buttonLabel = 'Cast Vote';
  let isButtonDisabled = false;
  let buttonVariant: 'primary' | 'secondary' = 'primary';

  if (isElectionEnded) {
    buttonLabel = 'Election Ended';
    isButtonDisabled = true;
    buttonVariant = 'secondary';
  } else if (hasVoted) {
    buttonLabel = 'Vote Locked';
    isButtonDisabled = true;
    buttonVariant = 'secondary';
  } else if (!isConnected) {
    buttonLabel = 'Connect to Vote';
    isButtonDisabled = true; // User needs to connect via nav first
    buttonVariant = 'secondary';
  }

  const canVote = !isButtonDisabled && !isVoting;

  const handleVoteClick = () => {
      setShowConfirm(true);
  };

  const confirmVote = () => {
      onVote(candidate.id);
      setShowConfirm(false);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onVerifySignature) {
          onVerifySignature(verifyInput.message, verifyInput.signature);
          setShowVerify(false);
          setVerifyInput({ message: '', signature: '' });
      }
  };

  return (
    <>
    <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden hover:border-brand-500/50 transition-colors duration-300 flex flex-col h-full shadow-lg">
      <div className="h-32 bg-gradient-to-br from-brand-900 to-dark-900 relative overflow-hidden group">
         <img 
           src={candidate.imageUrl} 
           alt={candidate.name}
           className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
         />
         <div className="absolute inset-0 bg-black/40" />
         <div className="absolute bottom-4 left-4 right-4">
           <h3 className="text-xl font-bold text-white truncate">{candidate.name}</h3>
           <p className="text-sm text-brand-200">{candidate.party}</p>
         </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-slate-400 text-sm italic leading-relaxed">"{candidate.manifesto}"</p>
        
        <div className="space-y-4">
          <div className="flex items-end justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <User size={14} /> Total Votes
            </span>
            <span className="text-2xl font-bold text-white">{candidate.votes}</span>
          </div>
          
          <div className="w-full bg-dark-900 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-brand-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-brand-500 font-mono">{percentage}%</div>
        </div>

        <div className="mt-4 relative group/tooltip">
          <Button 
            onClick={handleVoteClick} 
            isLoading={isVoting}
            disabled={!canVote}
            className="w-full"
            variant={buttonVariant}
          >
             <Vote size={18} className="mr-2" />
             {buttonLabel}
          </Button>
          
          {/* Tooltip */}
          {!isElectionEnded && !hasVoted && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-dark-900 text-xs text-slate-200 rounded-md shadow-xl border border-dark-700 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center gap-2 whitespace-nowrap z-10">
              <Clock size={12} className="text-brand-500" />
              <span>Ends in: <span className="font-mono font-bold text-white">{timeLeft}</span></span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1.5 border-4 border-transparent border-t-dark-700"></div>
            </div>
          )}

          {hasVoted && onVerifySignature && (
            <button
                onClick={() => setShowVerify(true)}
                className="w-full mt-3 text-xs text-slate-500 hover:text-brand-400 hover:underline decoration-dotted transition-colors flex items-center justify-center gap-1.5 py-1"
            >
                <ShieldCheck size={12} /> Verify My Signature
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Confirmation Modal */}
    {showConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-800 border border-dark-600 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in transform transition-all">
                <div className="p-6 relative">
                    <button 
                        onClick={() => setShowConfirm(false)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4 text-brand-500">
                        <div className="bg-brand-900/30 p-2 rounded-lg">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Confirm Your Vote</h3>
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        You are about to submit your vote to the blockchain. This action is <span className="text-white font-semibold">permanent</span> and cannot be changed.
                    </p>

                    <div className="bg-dark-900/50 rounded-lg p-4 mb-6 border border-dark-700/50 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Candidate</span>
                            <span className="text-base font-bold text-white">{candidate.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Party</span>
                            <span className="text-sm text-brand-400">{candidate.party}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-dark-700/50 pt-3 mt-1">
                            <span className="text-sm text-slate-500 flex items-center gap-2">
                                <Clock size={14} /> Election Ends In
                            </span>
                            <span className="text-sm font-mono text-slate-300">{timeLeft}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowConfirm(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={confirmVote}
                        >
                            Confirm & Vote
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )}

    {/* Verify Signature Modal */}
    {showVerify && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-800 border border-dark-600 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-dark-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileSignature size={18} className="text-brand-500" />
                        Verify Vote Signature
                    </h3>
                    <button 
                        onClick={() => setShowVerify(false)}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleVerifySubmit} className="p-6 space-y-4">
                    <p className="text-slate-400 text-xs mb-4">
                        Enter the message and signature from your transaction log to verify that your vote was signed by your connected wallet address.
                    </p>
                    
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Signed Message</label>
                        <textarea 
                            required
                            rows={2}
                            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                            placeholder="Vote for Candidate X by 0x..."
                            value={verifyInput.message}
                            onChange={(e) => setVerifyInput({...verifyInput, message: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Cryptographic Signature</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                            placeholder="0x..."
                            value={verifyInput.signature}
                            onChange={(e) => setVerifyInput({...verifyInput, signature: e.target.value})}
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowVerify(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                        >
                            Verify Now
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )}
    </>
  );
};