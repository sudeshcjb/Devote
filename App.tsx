import React, { useState, useEffect } from 'react';
import { WalletState, Candidate, Transaction } from './types';
import { INITIAL_CANDIDATES } from './constants';
import { connectWalletMock, castVoteMock, getCandidatesMock, resetElectionMock, checkHasVoted, getMerkleRootMock, tamperVoteDataMock, addCandidateMock, getSignatureForVote, verifySignatureMock } from './services/mockBlockchain';
import { analyzeElection } from './services/geminiService';
import { CandidateCard } from './components/CandidateCard';
import { ResultsChart } from './components/ResultsChart';
import { SolidityViewer } from './components/SolidityViewer';
import { Button } from './components/Button';
import { AdminPanel } from './components/AdminPanel';
import { TransactionLog } from './components/TransactionLog';
import { MerkleVerifier } from './components/MerkleVerifier';
import { LayoutDashboard, Wallet, RefreshCw, Cpu, ArrowUpDown, LogOut, ShieldCheck, GitMerge } from 'lucide-react';

const App: React.FC = () => {
  // Application State
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [wallet, setWallet] = useState<WalletState>({ isConnected: false, address: null, hasVoted: false });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVoting, setIsVoting] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Simulation State
  const [electionEndDate, setElectionEndDate] = useState<number>(Date.now() + (48 * 60 * 60 * 1000));
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [sortBy, setSortBy] = useState<'votes' | 'name' | 'party'>('votes');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentBlock, setCurrentBlock] = useState<number>(1205641);
  
  // Merkle State
  const [merkleRoot, setMerkleRoot] = useState<string>("0x00000000");
  const [verifyTx, setVerifyTx] = useState<Transaction | null>(null);

  useEffect(() => {
    // Initial data load simulation
    const interval = setInterval(async () => {
      const updated = await getCandidatesMock();
      setCandidates(updated);
      
      const root = await getMerkleRootMock();
      setMerkleRoot(root);

      // Sync wallet voted state in case admin reset happened
      if (wallet.isConnected && wallet.address) {
          const hasVotedOnChain = await checkHasVoted(wallet.address);
          setWallet(prev => ({ ...prev, hasVoted: hasVotedOnChain }));
      }
    }, 5000); // Poll every 5s

    // Time left timer for dashboard
    const timer = setInterval(() => {
      const diff = electionEndDate - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ended");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        setTimeLeft(`${hours}h`);
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [electionEndDate, wallet.address, wallet.isConnected]);

  // Initial time calc
  useEffect(() => {
    const diff = electionEndDate - Date.now();
    setTimeLeft(diff <= 0 ? "Ended" : `${Math.floor(diff / (1000 * 60 * 60))}h`);
  }, [electionEndDate]);

  const addTransaction = (method: string, from: string, status: 'Success' | 'Failed', details?: string, proofData?: any, signatureData?: { signature: string, signedMessage: string }) => {
      const newTx: Transaction = {
          hash: "0x" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          method,
          from,
          status,
          timestamp: Date.now(),
          blockNumber: currentBlock + 1,
          details,
          proofData,
          signature: signatureData?.signature,
          signedMessage: signatureData?.signedMessage
      };
      setTransactions(prev => [...prev, newTx]);
      setCurrentBlock(prev => prev + 1);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const walletState = await connectWalletMock();
      setWallet(walletState);
      showNotification("Wallet connected successfully!", "success");
      addTransaction("ConnectWallet", walletState.address!, "Success");
    } catch (error) {
      showNotification("Failed to connect wallet.", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
      if (wallet.address) {
        addTransaction("Disconnect", wallet.address, "Success");
      }
      setWallet({ isConnected: false, address: null, hasVoted: false });
      showNotification("Wallet disconnected.", "success");
  };

  const handleVote = async (candidateId: number) => {
    if (!wallet.isConnected) {
      showNotification("Please connect your wallet first.", "error");
      return;
    }
    
    // Front-end validation (can be bypassed to test contract)
    if (wallet.hasVoted) {
      showNotification("Frontend check: Already voted.", "error");
      return;
    }

    if (Date.now() > electionEndDate) {
        showNotification("Frontend check: Election ended.", "error");
        return;
    }

    setIsVoting(candidateId);
    try {
      const { txHash, proof } = await castVoteMock(candidateId, wallet.address!);
      const { signature, signedMessage } = getSignatureForVote(wallet.address!, candidateId);

      const updatedCandidates = await getCandidatesMock();
      setCandidates(updatedCandidates);
      setWallet(prev => ({ ...prev, hasVoted: true }));
      setMerkleRoot(proof.root); // Immediate update
      
      showNotification("Vote cast successfully on-chain!", "success");
      
      // Add to audit log
      addTransaction("Vote", wallet.address!, "Success", `Candidate ID: ${candidateId}`, proof, { signature, signedMessage });

      setAiAnalysis(""); 
    } catch (error: any) {
      showNotification(error.message || "Vote failed.", "error");
      addTransaction("Vote", wallet.address!, "Failed", error.message);
    } finally {
      setIsVoting(null);
    }
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await analyzeElection(candidates);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const handleVerifySignature = async (address: string, message: string, signature: string) => {
      showNotification("Verifying Signature...", "success");
      const isValid = await verifySignatureMock(address, message, signature);
      if (isValid) {
          showNotification("Signature VALID. Identity confirmed.", "success");
      } else {
          showNotification("Signature INVALID. Potential forgery.", "error");
      }
  };

  // --- Admin / Validation Handlers ---

  const handleAdminReset = async () => {
      setIsVoting(999); // Global loading state
      await resetElectionMock();
      setCandidates(await getCandidatesMock());
      setMerkleRoot("0x00000000");
      if (wallet.isConnected) {
          setWallet(prev => ({ ...prev, hasVoted: false }));
      }
      setTransactions([]);
      addTransaction("AdminReset", "0xAdmin...Host", "Success");
      showNotification("Election reset. All votes cleared.", "success");
      setIsVoting(null);
  };

  const handleTimeTravel = (hours: number) => {
      if (hours < 0) {
          // End election immediately
          setElectionEndDate(Date.now() - 1000);
          addTransaction("AdminEndElection", "0xAdmin...Host", "Success");
          showNotification("Election forcefully ended.", "success");
      } else {
          // Restart/Extend
          setElectionEndDate(Date.now() + (hours * 60 * 60 * 1000));
          addTransaction("AdminExtendPeriod", "0xAdmin...Host", "Success");
          showNotification(`Election extended by ${hours} hours.`, "success");
      }
  };

  const handleForceError = async (type: 'double' | 'invalid') => {
      if (!wallet.isConnected) {
          showNotification("Connect wallet to run validation tests.", "error");
          return;
      }

      setIsVoting(999); // Loading
      try {
          if (type === 'double') {
              // Simulate trying to vote again by bypassing frontend check
              await castVoteMock(1, wallet.address!);
              // If it succeeds (it shouldn't if we voted), do nothing, but if we haven't voted, vote 1
              await castVoteMock(1, wallet.address!); // The SECOND one should fail
          } else if (type === 'invalid') {
              await castVoteMock(99, wallet.address!); // Invalid ID
          }
      } catch (error: any) {
          showNotification(`Contract Reverted: ${error.message}`, "error");
          addTransaction(type === 'double' ? 'DoubleVoteAttack' : 'InvalidCandidate', wallet.address!, "Failed", error.message);
      } finally {
          setIsVoting(null);
      }
  };

  const handleTamper = async () => {
     setIsVoting(999);
     try {
       await tamperVoteDataMock();
       showNotification("Warning: Database votes modified directly! Merkle Root unchanged.", "error");
       setCandidates(await getCandidatesMock()); // Refresh UI to show fake votes
       addTransaction("DB_Tamper_Attack", "0xUnknown", "Success", "Modified Vote Count");
     } finally {
       setIsVoting(null);
     }
  };

  const handleAddCandidate = async (name: string, party: string, manifesto: string, imageUrl?: string) => {
    try {
      const txHash = await addCandidateMock(name, party, manifesto, imageUrl);
      setCandidates(await getCandidatesMock());
      showNotification("New candidate added successfully!", "success");
      
      const newTx: Transaction = {
        hash: txHash,
        method: "AddCandidate",
        from: "0xAdmin...Host",
        status: "Success",
        timestamp: Date.now(),
        blockNumber: currentBlock + 1,
        details: `Added ${name}`
      };
      setTransactions(prev => [...prev, newTx]);
      setCurrentBlock(prev => prev + 1);
    } catch (error) {
      showNotification("Failed to add candidate.", "error");
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    switch (sortBy) {
      case 'votes': return b.votes - a.votes;
      case 'name': return a.name.localeCompare(b.name);
      case 'party': return a.party.localeCompare(b.party);
      default: return 0;
    }
  });

  const totalVotes = candidates.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <div className="min-h-screen bg-dark-900 text-slate-200 pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 p-2 rounded-lg shadow-lg shadow-brand-900/20">
                <LayoutDashboard size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Vote<span className="text-brand-500">Chain</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              {wallet.isConnected ? (
                <div className="flex items-center gap-3 animate-fade-in">
                    <div className="hidden md:flex flex-col items-end mr-1">
                        <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">Connected</span>
                        <span className="text-xs text-slate-400">Ethereum Mainnet</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-dark-800/80 border border-brand-500/30 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.1)] hover:border-brand-500/50 transition-all duration-300">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        </div>
                        <span className="font-mono text-sm font-medium text-slate-200">
                            {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                        </span>
                    </div>
                    <Button variant="ghost" className="!p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20" onClick={handleDisconnect} title="Disconnect">
                        <LogOut size={18} />
                    </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleConnect} 
                  isLoading={isConnecting}
                  variant="primary"
                  className="rounded-full px-6 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-shadow duration-300"
                >
                  {!isConnecting && <Wallet size={18} className="mr-2" />}
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-xl border animate-fade-in-down ${
            notification.type === 'success' ? 'bg-green-900/90 border-green-700 text-green-100' : 'bg-red-900/90 border-red-700 text-red-100'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Admin / Validation Panel */}
        <AdminPanel 
            onTimeTravel={handleTimeTravel}
            onReset={handleAdminReset}
            onForceError={handleForceError}
            onTamper={handleTamper}
            onAddCandidate={handleAddCandidate}
            electionStatus={timeLeft === 'Ended' ? 'ended' : 'active'}
            isLoading={isVoting !== null && isVoting === 999}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column: Stats & Analysis */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-1">Election Status</h2>
              <p className="text-slate-400 text-sm mb-6">Contract: 0x71C...9A21</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-dark-900/50 p-4 rounded-lg border border-dark-700/50">
                  <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Votes</div>
                  <div className="text-2xl font-bold text-white">{totalVotes}</div>
                </div>
                <div className="bg-dark-900/50 p-4 rounded-lg border border-dark-700/50">
                   <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Time Left</div>
                   <div className={`text-2xl font-bold ${timeLeft === 'Ended' ? 'text-red-400' : 'text-white'}`}>{timeLeft}</div>
                </div>
              </div>

              {/* Merkle Root Display */}
              <div className="bg-dark-900/50 p-4 rounded-lg border border-dark-700/50 mb-6">
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-2">
                      <GitMerge size={14} /> State Root Hash
                  </div>
                  <div className="font-mono text-xs text-brand-400 break-all bg-dark-900 p-2 rounded border border-dark-700">
                      {merkleRoot}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck size={10} className="text-green-500" />
                      Cryptographically secured via Merkle Tree
                  </div>
              </div>

              <div className="pt-4 border-t border-dark-700">
                <div className="flex items-center justify-between mb-3">
                   <h3 className="text-sm font-semibold text-brand-400 flex items-center gap-2">
                     <Cpu size={16} /> AI Analyst
                   </h3>
                   <Button 
                     variant="ghost" 
                     className="!p-1 h-auto text-xs"
                     onClick={handleAnalysis}
                     isLoading={isAnalyzing}
                   >
                     <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
                   </Button>
                </div>
                
                <div className="bg-dark-900 p-4 rounded-lg min-h-[100px] text-sm text-slate-300 leading-relaxed border border-dark-700/50 relative">
                  {aiAnalysis ? (
                    <div className="animate-fade-in">{aiAnalysis}</div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 italic text-xs">
                      Click refresh for AI insights...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ResultsChart candidates={sortedCandidates} />
          </div>

          {/* Right Column: Candidates */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-white">Candidates</h2>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {!wallet.isConnected && (
                  <span className="text-sm text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 hidden sm:inline-block">
                    ⚠ Connect wallet to vote
                  </span>
                )}
                
                <div className="relative w-full sm:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-dark-800 border border-dark-700 text-slate-300 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 pr-8 transition-colors cursor-pointer hover:bg-dark-700"
                  >
                    <option value="votes">Sort by Votes</option>
                    <option value="name">Sort by Name</option>
                    <option value="party">Sort by Party</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <ArrowUpDown size={14} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedCandidates.map((candidate) => (
                <CandidateCard 
                  key={candidate.id}
                  candidate={candidate}
                  onVote={handleVote}
                  onVerifySignature={wallet.hasVoted && wallet.isConnected ? (msg, sig) => handleVerifySignature(wallet.address!, msg, sig) : undefined}
                  isVoting={isVoting === candidate.id}
                  isConnected={wallet.isConnected}
                  hasVoted={wallet.hasVoted}
                  totalVotes={totalVotes}
                  electionEndDate={electionEndDate}
                />
              ))}
            </div>

            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Transaction History</h2>
                    {transactions.length > 0 && (
                        <span className="text-xs text-slate-500 italic">Click a Vote transaction to verify proof</span>
                    )}
                </div>
                <TransactionLog 
                  transactions={transactions} 
                  onVerifySignature={handleVerifySignature}
                />
            </div>
            
            <SolidityViewer />
          </div>
        </div>

        {/* Merkle Verifier Modal */}
        {verifyTx && (
            <MerkleVerifier 
                transaction={verifyTx} 
                currentRoot={merkleRoot} 
                onClose={() => setVerifyTx(null)} 
            />
        )}

      </main>
    </div>
  );
};

export default App;