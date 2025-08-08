import React, { useState, useEffect } from "react";
import { Users, CheckCircle } from "lucide-react";

export default function VotingPage() {
  const [elections, setElections] = useState([]);
  const [votes, setVotes] = useState({}); // { electionId: candidateId }

  // Simulate backend fetch
  useEffect(() => {
    const dataFromBackend = [
      {
        id: 1,
        position: "President",
        candidates: [
          { id: 101, name: "John Doe" },
          { id: 102, name: "Jane Smith" }
        ]
      },
      {
        id: 2,
        position: "Vice President",
        candidates: [
          { id: 201, name: "Mike Brown" },
          { id: 202, name: "Sara Wilson" }
        ]
      }
    ];
    setElections(dataFromBackend);
  }, []);

  // Store the clicked candidate for that election only
  const handleVote = (electionId, candidateId) => {
    setVotes(prev => ({
      ...prev,
      [electionId]: candidateId
    }));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Vote for Your Candidates</h1>

      {elections.map(election => (
        <div key={election.id} className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <Users className="h-6 w-6 mr-2 text-indigo-600" />
            {election.position}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {election.candidates.map(candidate => {
              const isSelected = votes[election.id] === candidate.id;
              return (
                <div
                  key={candidate.id}
                  className={`border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                    isSelected
                      ? "shadow-lg border-green-500"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                  onClick={() => handleVote(election.id, candidate.id)}
                >
                  <p className="text-lg font-semibold">{candidate.name}</p>
                  {isSelected && (
                    <div className="flex items-center text-green-600 mt-2">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
