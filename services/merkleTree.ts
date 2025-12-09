// A simple Merkle Tree implementation for demonstration purposes

// Simple mock hash function (in real app, use SHA256)
export const simpleHash = (data: string): string => {
  let hash = 0;
  if (data.length === 0) return "0x00000000";
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive hex string and pad
  return "0x" + (hash >>> 0).toString(16).padStart(8, '0');
};

export class MerkleTree {
  leaves: string[];
  layers: string[][];

  constructor(leaves: string[] = []) {
    this.leaves = leaves;
    this.layers = [];
    this.processTree();
  }

  addLeaf(data: string) {
    const hash = simpleHash(data);
    this.leaves.push(hash);
    this.processTree();
    return hash;
  }

  processTree() {
    this.layers = [this.leaves];
    let currentLayer = this.leaves;

    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left; // Duplicate last if odd
        nextLayer.push(simpleHash(left + right));
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  getRoot(): string {
    if (this.layers.length === 0 || this.layers[this.layers.length - 1].length === 0) {
      return "0x00000000";
    }
    return this.layers[this.layers.length - 1][0];
  }

  getProof(leafIndex: number): string[] {
    const proof: string[] = [];
    let currentIndex = leafIndex;

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRightNode = currentIndex % 2 === 1;
      const pairIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      if (pairIndex < layer.length) {
        proof.push(layer[pairIndex]);
      } else {
        // If odd number of nodes, the last one is paired with itself in this logic
        proof.push(layer[currentIndex]); 
      }
      currentIndex = Math.floor(currentIndex / 2);
    }
    return proof;
  }
  
  // Verify a proof locally
  static verify(leaf: string, proof: string[], root: string): boolean {
    let hash = leaf;
    
    // This is a simplified verification that assumes we know the index path implicitly
    // In a real generic verify, we'd need to know left/right positions.
    // For this demo, we will re-simulate the hashing in the UI component 
    // to show the visual "calculation".
    // This static method is just a placeholder logic.
    
    // Actual verification logic happens in the UI component for visual effect
    return true; 
  }
}