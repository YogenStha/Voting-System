import React, { useState, useEffect } from 'react';
import { Vote, Calendar, Users, CheckCircle, AlertCircle, User, FileText } from 'lucide-react';

const ElectionVotingApp = () => {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [votedElections, setVotedElections] = useState(new Set());

  useEffect(() => {
    fetchElectionData();
  }, []);

  const fetchElectionData = async () => {
    try {
      setLoading(true);

      //  API call to fetch elections and candidates
      const response = await fetch("http://localhost:8000/api/elections/");

      if (!response.ok) {
        throw new Error('Failed to fetch elections');
      }
      const data = await response.json();
      setElections(data.elections);
      setCandidates(data.candidates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getElectionCandidates = (electionId) => {
    return candidates.filter(candidate => candidate.election === electionId);
  };

  const handleVote = (electionId, positionId, candidateId) => {
    console.log('handleVote called:', { electionId, positionId, candidateId });
    setVotes(prev => {
      const newVotes = {
        ...prev,
        [electionId]: {
          ...(prev[electionId] || {}),
          [positionId]: candidateId
        }
      };
      console.log('New votes state:', newVotes);
      return newVotes;
    });
  };

  // Test log to make sure component is working
  console.log('Component rendered, selectedElection:', selectedElection?.name);

  const submitVote = async (electionId) => {
    // Get all positions for this election
    const electionCandidates = getElectionCandidates(electionId);
    const positions = [...new Set(electionCandidates.map(candidate => candidate.position.position_name))];
    
    // Check if votes have been made for all positions
    const electionVotes = votes[electionId] || {};
    const hasVotedForAllPositions = positions.every(positionName => electionVotes[positionName]);
    
    if (!hasVotedForAllPositions) {
      alert('Please select a candidate for each position before voting');
      return;
    }

    try {
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful vote submission
      console.log(`Vote submitted for election ${electionId}:`, electionVotes);

      setVotedElections(prev => new Set([...prev, electionId]));
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (err) {
      alert('Failed to submit vote. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if any votes have been made for the current election
  const hasAnyVotes = (electionId) => {
    const electionVotes = votes[electionId];
    return electionVotes && Object.keys(electionVotes).length > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading elections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Error</h2>
          <p className="text-gray-600 text-center">{error}</p>
          <button
            onClick={fetchElectionData}
            className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-4 transform animate-pulse">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Vote Submitted!</h3>
            <p className="text-gray-600 text-center">Your vote has been recorded successfully.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Vote className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Election Portal</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{candidates.length} Candidates</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Election Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Active Elections
              </h2>
              <div className="space-y-3">
                {elections.map((election) => (
                  <button
                    key={election.id}
                    onClick={() => setSelectedElection(election)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${selectedElection?.id === election.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">{election.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Start: {formatDate(election.start_date)}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      End: {formatDate(election.end_date)}
                    </p>
                    {votedElections.has(election.id) && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Voted
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedElection && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Election Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                  <h2 className="text-3xl font-bold mb-4">{selectedElection.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
                    <div>
                      <p className="text-sm opacity-90">Start Date</p>
                      <p className="text-lg font-semibold">{formatDate(selectedElection.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90">End Date</p>
                      <p className="text-lg font-semibold">{formatDate(selectedElection.end_date)}</p>
                    </div>
                  </div>
                </div>

                {/* Candidates */}
                <div className="p-8">
                  {Object.entries(
                    getElectionCandidates(selectedElection.id).reduce((acc, candidate) => {
                      const position = candidate.position.position_name;
                      if (!acc[position]) acc[position] = [];
                      acc[position].push(candidate);
                      return acc;
                    }, {})
                  ).map(([positionName, candidates]) => (
                    <div key={positionName} className="mb-10">
                      <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                        <Users className="h-6 w-6 mr-2 text-indigo-600" />
                        {positionName}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {candidates.map((candidate, index) => {
                          // Debug the candidate structure
                          console.log('Candidate object:', candidate);
                          
                          // Since there's no id field, we'll use the candidate name + position as unique identifier
                          // And use position_name as position identifier
                          const candidateKey = `${candidate.name}_${candidate.position.position_name}`;
                          const positionKey = candidate.position.position_name;
                          
                          // Check if this specific candidate is selected for their position
                          const electionVotes = votes[selectedElection.id];
                          const positionVote = electionVotes?.[positionKey];
                          const isSelected = positionVote !== undefined && positionVote === candidateKey;

                          return (
                            <div
                              key={`${candidate.name}_${index}`}
                              className={`border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer transform hover:scale-105 ${isSelected
                                  ? 'border-green-500 bg-green-50 shadow-lg'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                              onClick={() => {
                                console.log('Card clicked!', { 
                                  electionId: selectedElection.id, 
                                  positionKey: positionKey, 
                                  candidateKey: candidateKey 
                                });
                                handleVote(selectedElection.id, positionKey, candidateKey);
                              }}
                            >
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  {candidate.image ? (
                                    <img
                                      src={candidate.image}
                                      alt={candidate.name}
                                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                      <User className="h-10 w-10 text-white" />
                                    </div>
                                  )}
                                  {candidate.is_verified && (
                                    <CheckCircle className="h-5 w-5 text-blue-500 -mt-2 ml-16" />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <h4 className="text-xl font-bold text-gray-800 mb-2">{candidate.name}</h4>

                                  <div className="mb-3">
                                    <p className="text-sm text-gray-600 mb-1">Party: {candidate.party.party_name}</p>
                                    <p className="text-sm text-gray-600 mb-1">Position: {candidate.position.position_name}</p>
                                  </div>

                                  <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center space-x-2">
                                      {candidate.is_verified && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Verified
                                        </span>
                                      )}
                                    </div>

                                    {isSelected && (
                                      <div className="flex items-center text-green-600">
                                        <CheckCircle className="h-5 w-5 mr-1" />
                                        <span className="text-sm font-medium">Selected</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Vote Button */}
                  <div className="border-t pt-6">
                    <button
                      onClick={() => submitVote(selectedElection.id)}
                      disabled={!hasAnyVotes(selectedElection.id) || votedElections.has(selectedElection.id)}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${votedElections.has(selectedElection.id)
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : hasAnyVotes(selectedElection.id)
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {votedElections.has(selectedElection.id) ? (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Vote Submitted
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Vote className="h-5 w-5 mr-2" />
                          {hasAnyVotes(selectedElection.id) ? 'Submit Vote' : 'Select Candidates'}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!selectedElection && elections.length === 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No Active Elections</h3>
                <p className="text-gray-500">There are currently no active elections available.</p>
              </div>
            )}

            {!selectedElection && elections.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">Select an Election</h3>
                <p className="text-gray-500">Choose an election from the sidebar to view candidates and cast your vote.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionVotingApp;