export interface Candidate {
  id: number;
  name: string;
  party: string;
  votes: number;
  imageUrl: string;
  manifesto: string;
}

export interface VoteEvent {
  voter: string;
  candidateId: number;
  timestamp: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  hasVoted: boolean;
}

export interface MerkleProof {
  root: string;
  leaf: string;
  siblings: string[];
  index: number;
}

export interface Transaction {
  hash: string;
  method: string; // 'Vote', 'AdminSetPeriod', 'Connect'
  from: string;
  status: 'Success' | 'Failed' | 'Pending';
  timestamp: number;
  blockNumber: number;
  details?: string;
  proofData?: MerkleProof; // Verification data
  signature?: string;
  signedMessage?: string;
}