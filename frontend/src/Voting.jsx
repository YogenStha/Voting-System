import React, { useState, useEffect } from "react";
import { Vote, Users } from 'lucide-react';

// --- Simplified UI Components ---
const Button = ({ children, onClick, variant, size, className, ...props }) => {
  let baseClasses = "px-4 py-2 rounded-md transition-colors";
  if (variant === "destructive") {
    baseClasses += " bg-red-600 text-white hover:bg-red-700";
  } else if (className && className.includes("bg-green-600")) {
    baseClasses += " bg-green-600 text-white hover:bg-green-700";
  } else {
    baseClasses += " bg-blue-600 text-white hover:bg-blue-700";
  }
  if (size === "lg") {
    baseClasses += " px-8 py-3 text-lg";
  }
  return (
    <button onClick={onClick} className={`${baseClasses} ${className || ""}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow-md ${className || ""}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className }) => (
  <div className={`p-6 pb-4 ${className || ""}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className }) => (
  <h2 className={`text-xl font-bold text-gray-900 ${className || ""}`}>
    {children}
  </h2>
);

const CardDescription = ({ children, className }) => (
  <p className={`text-gray-600 ${className || ""}`}>
    {children}
  </p>
);

const CardContent = ({ children, className }) => (
  <div className={`p-6 pt-0 ${className || ""}`}>
    {children}
  </div>
);

const Label = ({ htmlFor, children, className }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-2 ${className || ""}`}>
    {children}
  </label>
);

const RadioGroup = ({ value, onValueChange, children, className }) => (
  <div className={`space-y-2 ${className || ""}`} role="radiogroup" value={value} onChange={(e) => onValueChange(e.target.value)}>
    {children}
  </div>
);

const RadioGroupItem = ({ value, id, ...props }) => (
  <input
    type="radio"
    id={id}
    value={value}
    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
    {...props}
  />
);

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className || ""}`}>
    {children}
  </span>
);

// Mock initial data
const initialElections = [
  {
    id: 1,
    name: "Student Council Election 2024",
    startTime: new Date(Date.now() + 6000), // 1 minute from now
    endTime: new Date(Date.now() + 300000), // 5 minutes from now
    status: "upcoming", // upcoming, active, completed
    isResultPublished: false,
  },
];

const initialCandidates = [
  { id: 1, name: "John Doe", position: "President", electionId: 1, votes: 0 },
  { id: 2, name: "Jane Smith", position: "President", electionId: 1, votes: 0 },
  { id: 3, name: "Mike Johnson", position: "Vice President", electionId: 1, votes: 0 },
  { id: 4, name: "Sarah Wilson", position: "Vice President", electionId: 1, votes: 0 },
  { id: 5, name: "Tom Brown", position: "Secretary", electionId: 1, votes: 0 },
  { id: 6, name: "Lisa Davis", position: "Secretary", electionId: 1, votes: 0 },
];

// Default voter (no login required)
const defaultVoter = { id: "voter123", name: "Demo Voter" };

const VoterDashboard = ({
  elections,
  candidates,
  votes,
  onVote,
  currentVoter,
}) => {
  const [selectedVotes, setSelectedVotes] = useState({});
  const [timeRemaining, setTimeRemaining] = useState("");

  const activeElection = elections.find((e) => e.status === "active");
  const completedElections = elections.filter((e) => e.status === "completed" && e.isResultPublished);

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    if (diff <= 0) return "Election Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (activeElection) {
      const timer = setInterval(() => {
        setTimeRemaining(getTimeRemaining(activeElection.endTime));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeElection]);

  const getVoterVotesForElection = (electionId) => {
    return votes.filter((vote) => vote.voterId === currentVoter?.id && vote.electionId === electionId);
  };

  const handleVoteSelection = (position, candidateId) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [position]: candidateId,
    }));
  };

  const submitVotes = () => {
    if (activeElection && currentVoter && Object.keys(selectedVotes).length > 0) {
      Object.entries(selectedVotes).forEach(([position, candidateId]) => {
        onVote(currentVoter.id, candidateId, activeElection.id, position);
      });
      setSelectedVotes({});
      alert("Votes submitted successfully!");
    }
  };

  const groupCandidatesByPosition = (electionId) => {
    const electionCandidates = candidates.filter((c) => c.electionId === electionId);
    const grouped = {};
    electionCandidates.forEach((candidate) => {
      if (!grouped[candidate.position]) {
        grouped[candidate.position] = [];
      }
      grouped[candidate.position].push(candidate);
    });
    return grouped;
  };

  const getVotingStatus = (electionId) => {
    const voterVotes = getVoterVotesForElection(electionId);
    const positions = Object.keys(groupCandidatesByPosition(electionId));
    const votedPositions = voterVotes.map((vote) => vote.position);
    return {
      hasVotedAny: voterVotes.length > 0,
      votedPositions,
      totalPositions: positions.length,
      remainingPositions: positions.filter((pos) => !votedPositions.includes(pos)),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Voter Dashboard</h1>
              <p className="text-gray-600">
                Welcome, {currentVoter.name} (ID: {currentVoter.id})
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Election */}
        {activeElection && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{activeElection.name}</CardTitle>
                  <CardDescription>Active Election</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-red-600">{timeRemaining}</div>
                  <p className="text-sm text-gray-600">Time Remaining</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const votingStatus = getVotingStatus(activeElection.id);
                if (votingStatus.hasVotedAny) {
                  return (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <Vote className="h-5 w-5 text-green-400 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-green-800">
                              You have voted in {votingStatus.votedPositions.length} out of {votingStatus.totalPositions} positions
                            </h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>Your votes:</p>
                              <ul className="list-disc list-inside mt-1">
                                {getVoterVotesForElection(activeElection.id).map((vote) => {
                                  const candidate = candidates.find((c) => c.id === vote.candidateId);
                                  return (
                                    <li key={vote.id}>
                                      {vote.position}: {candidate?.name}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Show remaining positions to vote */}
                      {votingStatus.remainingPositions.length > 0 && (
                        <div className="space-y-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                              You can still vote for: {votingStatus.remainingPositions.join(", ")}
                            </p>
                          </div>
                          {votingStatus.remainingPositions.map((position) => {
                            const positionCandidates = groupCandidatesByPosition(activeElection.id)[position];
                            return (
                              <Card key={position}>
                                <CardHeader>
                                  <CardTitle className="text-lg">{position}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <RadioGroup
                                    value={selectedVotes[position]?.toString() || ""}
                                    onValueChange={(value) => handleVoteSelection(position, parseInt(value))}
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {positionCandidates.map((candidate) => (
                                        <div key={candidate.id} className="flex items-center space-x-2 border rounded-lg p-4">
                                          <RadioGroupItem value={candidate.id.toString()} id={`${position}-${candidate.id}`} />
                                          <Label htmlFor={`${position}-${candidate.id}`} className="flex-1 cursor-pointer">
                                            <div>
                                              <p className="font-medium">{candidate.name}</p>
                                              <p className="text-sm text-gray-500">{candidate.position}</p>
                                            </div>
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </RadioGroup>
                                </CardContent>
                              </Card>
                            );
                          })}
                          {Object.keys(selectedVotes).length > 0 && (
                            <div className="flex justify-center">
                              <Button onClick={submitVotes} size="lg" className="bg-green-600 hover:bg-green-700">
                                Submit Additional Votes
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-6">
                      {Object.entries(groupCandidatesByPosition(activeElection.id)).map(([position, positionCandidates]) => (
                        <Card key={position}>
                          <CardHeader>
                            <CardTitle className="text-lg">{position}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <RadioGroup
                              value={selectedVotes[position]?.toString() || ""}
                              onValueChange={(value) => handleVoteSelection(position, parseInt(value))}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {positionCandidates.map((candidate) => (
                                  <div key={candidate.id} className="flex items-center space-x-2 border rounded-lg p-4">
                                    <RadioGroupItem value={candidate.id.toString()} id={`${position}-${candidate.id}`} />
                                    <Label htmlFor={`${position}-${candidate.id}`} className="flex-1 cursor-pointer">
                                      <div>
                                        <p className="font-medium">{candidate.name}</p>
                                        <p className="text-sm text-gray-500">{candidate.position}</p>
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </RadioGroup>
                          </CardContent>
                        </Card>
                      ))}
                      {Object.keys(selectedVotes).length > 0 && (
                        <div className="flex justify-center">
                          <Button onClick={submitVotes} size="lg" className="bg-green-600 hover:bg-green-700">
                            Submit Votes
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
            </CardContent>
          </Card>
        )}

        {/* Completed Elections with Published Results */}
        {completedElections.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Election Results</h2>
            {completedElections.map((election) => (
              <Card key={election.id}>
                <CardHeader>
                  <CardTitle>{election.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(groupCandidatesByPosition(election.id)).map(([position, positionCandidates]) => (
                      <div key={position} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-md font-medium text-gray-900 mb-3">{position}</h4>
                        <div className="space-y-2">
                          {positionCandidates
                            .sort((a, b) => b.votes - a.votes)
                            .map((candidate, index) => (
                              <div key={candidate.id} className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {index === 0 && (
                                    <Badge className="bg-yellow-100 text-yellow-800 mr-2">
                                      Winner
                                    </Badge>
                                  )}
                                  <span className="font-medium">{candidate.name}</span>
                                </div>
                                <span className="text-gray-600">{candidate.votes} votes</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!activeElection && completedElections.length === 0 && (
          <div className="text-center py-12">
            <Vote className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active elections</h3>
            <p className="mt-1 text-sm text-gray-500">There are currently no active elections or published results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Voting() {
  const [elections, setElections] = useState(initialElections);
  const [candidates] = useState(initialCandidates);
  const [votes, setVotes] = useState([]);
  const currentVoter = defaultVoter; // No login required, use default voter

  // Update election status based on time
  useEffect(() => {
    const updateElectionStatus = () => {
      const now = new Date();
      setElections((prev) =>
        prev.map((election) => {
          let status = election.status;
          if (now >= election.startTime && now < election.endTime) {
            status = "active";
          } else if (now >= election.endTime) {
            status = "completed";
          } else {
            status = "upcoming";
          }
          return { ...election, status };
        })
      );
    };

    updateElectionStatus();
    const interval = setInterval(updateElectionStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = (voterId, candidateId, electionId, position) => {
    // Remove any existing votes from this voter for this position in this election
    setVotes((prev) =>
      prev.filter(
        (vote) => !(vote.voterId === voterId && vote.electionId === electionId && vote.position === position)
      )
    );

    // Add the new vote
    const newVote = {
      id: Date.now() + Math.random(),
      voterId,
      candidateId,
      electionId,
      position,
      timestamp: new Date(),
    };

    setVotes((prev) => [...prev, newVote]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-blue-600">ChunabE</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="text-sm text-gray-600">Voting System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <VoterDashboard
        elections={elections}
        candidates={candidates}
        votes={votes}
        onVote={handleVote}
        currentVoter={currentVoter}
      />
    </div>
  );
}
