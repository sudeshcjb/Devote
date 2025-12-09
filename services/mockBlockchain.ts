import { Candidate, WalletState, MerkleProof } from '../types';
import { INITIAL_CANDIDATES } from '../constants';
import { MerkleTree, simpleHash } from './merkleTree';
// ... existing code ...
import * as crypto from 'crypto'; // Not actually used in browser mock, just for type safety if needed, but we use web crypto or mock

// Simulating a delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for the simulation session
let candidatesStore = JSON.parse(JSON.stringify(INITIAL_CANDIDATES));
let votersStore = new Set<string>();

// Mock Private Key Store for signatures
const privateKeyStore = new Map<string, string>(); // address -> privateKey

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
  
  // Generate a mock private key for this user for signing demo
  const privateKey = "0x" + Array(64).fill(0).map(() => chars[Math.floor(Math.random() * 16)]).join('');
  privateKeyStore.set(address, privateKey);

  return {
    isConnected: true,
    address: address,
    hasVoted: votersStore.has(address)
  };
};

export const addCandidateMock = async (name: string, party: string, manifesto: string, imageUrl?: string): Promise<string> => {
    await delay(1200);
    const newId = candidatesStore.length + 1;
    
    // Use provided URL or fallback to random
    const finalImageUrl = imageUrl || `https://picsum.photos/200/200?random=${newId + 10}`;
    
    const newCandidate: Candidate = {
        id: newId,
        name,
        party,
        manifesto,
        votes: 0,
        imageUrl: finalImageUrl
    };
    
    candidatesStore.push(newCandidate);
    
    // Return mock hash
    return "0x" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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

// Signature Simulation - Implements user request to generate signature using private key
export const getSignatureForVote = (address: string, candidateId: number): { signature: string, signedMessage: string } => {
    // 1. Retrieve the mock private key for this address
    const privKey = privateKeyStore.get(address);
    if (!privKey) return { signature: "0x0", signedMessage: "" };

    // 2. Create the message to sign
    const message = `Vote for Candidate ${candidateId} by ${address}`;
    
    // 3. Simulate ECDSA signature (Hash(message + privateKey) + recoveryParam)
    // In a real app, this would use eth_signTypedData or personal_sign
    const signature = "0x" + simpleHash(message + privKey) + simpleHash(privKey).substring(2); 
    
    return { signature, signedMessage: message };
}

export const verifySignatureMock = async (address: string, message: string, signature: string): Promise<boolean> => {
    await delay(1000);
    const privKey = privateKeyStore.get(address);
    if (!privKey) return false; // In real life, we recover address from signature. Here we cheat for mock.

    const expectedSig = "0x" + simpleHash(message + privKey) + simpleHash(privKey).substring(2);
    return signature === expectedSig;
}