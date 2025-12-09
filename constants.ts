import { Candidate } from './types';

export const SOLIDITY_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;
    uint public candidatesCount;
    address public admin;
    
    // Election duration config
    uint public startDate;
    uint public endDate;

    event VoteCast(address indexed voter, uint indexed candidateId);
    event ElectionPeriodSet(uint startDate, uint endDate);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    modifier onlyDuringElection() {
        require(startDate > 0 && endDate > 0, "Election period not defined");
        require(block.timestamp >= startDate, "Election has not started yet");
        require(block.timestamp <= endDate, "Election has ended");
        _;
    }

    constructor(string[] memory _candidateNames) {
        admin = msg.sender;
        for (uint i = 0; i < _candidateNames.length; i++) {
            addCandidate(_candidateNames[i]);
        }
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function setElectionPeriod(uint _startDate, uint _endDate) public onlyAdmin {
        require(_endDate > _startDate, "End date must be after start date");
        startDate = _startDate;
        endDate = _endDate;
        emit ElectionPeriodSet(_startDate, _endDate);
    }

    function vote(uint _candidateId) public onlyDuringElection {
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    function getVotes(uint _candidateId) public view returns (uint) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");
        return candidates[_candidateId].voteCount;
    }
}`;

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 1,
    name: "Alice Ledger",
    party: "Decentralized Future",
    votes: 42,
    imageUrl: "https://picsum.photos/200/200?random=1",
    manifesto: "Empowering the community through transparent governance and zero-knowledge proofs for all."
  },
  {
    id: 2,
    name: "Bob Block",
    party: "Scalability Alliance",
    votes: 38,
    imageUrl: "https://picsum.photos/200/200?random=2",
    manifesto: "Focusing on layer-2 solutions to bring mass adoption and low gas fees to the ecosystem."
  },
  {
    id: 3,
    name: "Charlie Chain",
    party: "Security First",
    votes: 15,
    imageUrl: "https://picsum.photos/200/200?random=3",
    manifesto: "Rigorous auditing standards and formal verification to ensure our funds are SAFU."
  }
];

// Set election end date to 48 hours from now for simulation
export const MOCK_ELECTION_END_DATE = Date.now() + (48 * 60 * 60 * 1000);