import React, { useEffect, useState } from "react";
import Loader from "./Loader";

function UserCards() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);

  useEffect(() => {
    const handleCandidate = async (e) => {
      // e.preventDefault();
      setLoading(true);
      const response = await fetch("api/candidate-details/", {
        method: "GET"
      });
      const data = await response.json();
      if (response.ok) {
        console.log("candidate details: ", data.candidate_detail);
        setCandidates(data.candidate_detail);
        setLoading(false);
        console.log("candidate image: ", candidates.image);
      } else {
        console.log("error");
      }
    };
    handleCandidate();
    setLoading(false);
  }, []);

  // Group candidates by election
  const electionGroups = candidates.reduce((acc, candidate) => {
    const electionId = candidate.election.id;
    if (!acc[electionId]) {
      acc[electionId] = {
        election: candidate.election,
        candidates: []
      };
    }
    acc[electionId].candidates.push(candidate);
    return acc;
  }, {});

  const elections = Object.values(electionGroups);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleElectionClick = (election) => {
    setSelectedElection(election);
  };

  const handleBackClick = () => {
    setSelectedElection(null);
  };

  if (loading) return <Loader />;

  // If an election is selected, show candidates for that election
  if (selectedElection) {
    const electionCandidates = electionGroups[selectedElection.id].candidates;
    
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button
            onClick={handleBackClick}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            ← Back to Elections
          </button>
          <h2 className="text-2xl font-bold text-center">
            Candidates for {selectedElection.name} Election
          </h2>
          <p className="text-center text-gray-600 mt-2">
            {formatDate(selectedElection.start_date)} - {formatDate(selectedElection.end_date)}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {electionCandidates.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col items-center p-5"
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-full max-w-[180px] h-auto object-cover rounded-lg mb-4"
              />
              
              <h3 className="text-lg font-semibold mb-2">{c.name}</h3>
              
              <p className="text-gray-600 text-sm">
                <strong className="font-medium">Party:</strong> {c.party.party_name}
              </p>
              <p className="text-gray-600 text-sm">
                <strong className="font-medium">Position:</strong> {c.position.position_name}
              </p>
              
              <p className="mt-3 text-gray-700 text-center text-sm">{c.manifesto}</p>
              
              {c.is_verified && (
                <p className="mt-2 text-green-500 font-semibold">✔ Verified</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default view: Show elections
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">Elections</h2>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {elections.map((electionGroup) => {
          const election = electionGroup.election;
          const candidateCount = electionGroup.candidates.length;
          
          return (
            <div
              key={election.id}
              onClick={() => handleElectionClick(election)}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 p-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold mb-3 text-blue-600">
                  {election.name} Election
                </h3>
                
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-1">
                    <strong>Start:</strong> {formatDate(election.start_date)}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <strong>End:</strong> {formatDate(election.end_date)}
                  </p>
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    election.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {election.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-2xl font-bold text-blue-600">{candidateCount}</p>
                  <p className="text-sm text-gray-600">
                    {candidateCount === 1 ? 'Candidate' : 'Candidates'}
                  </p>
                </div>

                <p className="text-blue-500 font-semibold text-sm">
                  Click to view candidates →
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserCards;