import { Candidate, WalletState, MerkleProof } from '../types';
import { INITIAL_CANDIDATES } from '../constants';
import { MerkleTree, simpleHash } from './merkleTree';

// Simulating a delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for the simulation session
let candidatesStore = JSON.parse(JSON.stringify(INITIAL_CANDIDATES));
let votersStore = new Set<string>();

// Cryptographic State
let merkleTree = new MerkleTree();
// Map txHash to Merkle Proof data for verification demo
let txProofs = new Map<string, MerkleProof>();

export const connectWalletMock = async (forceNew: boolean = false): Promise<WalletState> => {
  await delay(600);
  
  // Generate a random mock address
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * 16)];
  }
  
  return {
    isConnected: true,
    address: address,
    hasVoted: votersStore.has(address)
  };
};

export const castVoteMock = async (candidateId: number, voterAddress: string): Promise<{txHash: string, proof: MerkleProof}> => {
  await delay(1500); // Transaction mining simulation
  
  if (votersStore.has(voterAddress)) {
    throw new Error("Double voting detected! Transaction reverted.");
  }
  
  const candidate = candidatesStore.find((c: Candidate) => c.id === candidateId);
  if (!candidate) {
      throw new Error("Invalid Candidate ID.");
  }

  // 1. Update State
  candidatesStore = candidatesStore.map((c: Candidate) => 
    c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
  );
  votersStore.add(voterAddress);
  
  // 2. Cryptographic Commitment
  // Create a unique string for this vote: "Address-Vote-Nonce"
  const voteData = `${voterAddress}-${candidateId}-${Date.now()}`;
  const leafHash = merkleTree.addLeaf(voteData);
  const leafIndex = merkleTree.leaves.length - 1;
  const root = merkleTree.getRoot();
  
  // Generate Mock Transaction Hash
  const txHash = "0x" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // 3. Generate Proof
  const proof: MerkleProof = {
    root: root,
    leaf: leafHash,
    siblings: merkleTree.getProof(leafIndex),
    index: leafIndex
  };
  
  txProofs.set(txHash, proof);

  return { txHash, proof };
};

export const getCandidatesMock = async (): Promise<Candidate[]> => {
  await delay(300);
  return [...candidatesStore];
};

export const resetElectionMock = async (): Promise<void> => {
    await delay(1000);
    candidatesStore = JSON.parse(JSON.stringify(INITIAL_CANDIDATES));
    votersStore.clear();
    merkleTree = new MerkleTree(); // Reset tree
    txProofs.clear();
};

export const checkHasVoted = async (address: string): Promise<boolean> => {
    return votersStore.has(address);
}

export const getMerkleRootMock = async (): Promise<string> => {
    return merkleTree.getRoot();
}

// SIMULATE ATTACK: Tamper with a random vote in the "Database" 
// This changes the vote count but DOES NOT update the Merkle Tree, causing a mismatch.
export const tamperVoteDataMock = async (): Promise<void> => {
    await delay(800);
    // Randomly add votes to a candidate without authorization
    const randomId = Math.floor(Math.random() * 3) + 1;
    candidatesStore = candidatesStore.map((c: Candidate) => 
      c.id === randomId ? { ...c, votes: c.votes + 100 } : c
    );
    // We intentionally DO NOT update the Merkle Tree here.
    // This represents a database breach where raw data is changed but the crypto proof remains valid for the OLD state.
};