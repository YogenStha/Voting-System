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
      
      // Simulate API delay
      const response = await fetch("http://localhost:8000/api/elections/");
      const data = await response.json();
      // Dummy data matching your backend structure
      const dummyData = {
        elections: [
          {
            id: 1,
            name: "Presidential Election 2024",
            start_date: "2024-11-01",
            end_date: "2024-11-30",
            is_active: true
          },
          {
            id: 2,
            name: "Senate Election 2024",
            start_date: "2024-10-15",
            end_date: "2024-12-15",
            is_active: true
          },
          {
            id: 3,
            name: "Governor Election 2024",
            start_date: "2024-09-01",
            end_date: "2024-11-15",
            is_active: true
          }
        ],
        candidates: [
          // Presidential Election Candidates
          {
            id: 1,
            name: "Sarah Johnson",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
            manifesto: "Building a stronger economy through innovation, creating jobs, and investing in renewable energy. My vision includes universal healthcare, education reform, and strengthening our democratic institutions for a better future.",
            party: {
              party_name: "Progressive Party",
              party_symbol: "🌟"
            },
            position: {
              position_name: "President"
            },
            is_verified: true,
            election: 1
          },
          {
            id: 2,
            name: "Michael Rodriguez",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
            manifesto: "Focused on economic growth, traditional values, and strong national defense. Committed to reducing taxes, supporting small businesses, and maintaining law and order while protecting constitutional rights.",
            party: {
              party_name: "Conservative Alliance",
              party_symbol: "🛡️"
            },
            position: {
              position_name: "President"
            },
            is_verified: true,
            election: 1
          },
          {
            id: 3,
            name: "Dr. Emma Chen",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
            manifesto: "Environmental protection, sustainable development, and social justice. Advocating for climate action, affordable housing, and comprehensive immigration reform to build an inclusive society.",
            party: {
              party_name: "Green Future Party",
              party_symbol: "🌱"
            },
            position: {
              position_name: "President"
            },
            is_verified: true,
            election: 1
          },
          {
            id: 4,
            name: "James Wilson",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
            manifesto: "Independent leadership for the people. Fighting corruption, promoting transparency, and ensuring government accountability. Focus on bipartisan solutions and practical governance.",
            party: {
              party_name: "Independent Coalition",
              party_symbol: "⭐"
            },
            position: {
              position_name: "President"
            },
            is_verified: false,
            election: 1
          },
          // Senate Election Candidates
          {
            id: 5,
            name: "Lisa Thompson",
            image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face",
            manifesto: "Healthcare reform and education funding. Working to make healthcare accessible to all citizens and investing in our children's future through better schools and teacher support.",
            party: {
              party_name: "Progressive Party",
              party_symbol: "🌟"
            },
            position: {
              position_name: "Senator"
            },
            is_verified: true,
            election: 2
          },
          {
            id: 6,
            name: "Robert Davis",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
            manifesto: "Business-friendly policies and job creation. Supporting entrepreneurs, reducing regulatory burden, and attracting investment to boost local economy and create employment opportunities.",
            party: {
              party_name: "Conservative Alliance",
              party_symbol: "🛡️"
            },
            position: {
              position_name: "Senator"
            },
            is_verified: true,
            election: 2
          },
          {
            id: 7,
            name: "Maria Garcia",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
            manifesto: "Community development and social programs. Focusing on affordable housing, public transportation, and support for working families to build stronger communities.",
            party: {
              party_name: "Community First",
              party_symbol: "🏘️"
            },
            position: {
              position_name: "Senator"
            },
            is_verified: true,
            election: 2
          },
          // Governor Election Candidates
          {
            id: 8,
            name: "David Park",
            image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face",
            manifesto: "State modernization and technology advancement. Bringing innovation to government services, improving infrastructure, and preparing our state for the digital future.",
            party: {
              party_name: "Tech Forward Party",
              party_symbol: "💻"
            },
            position: {
              position_name: "Governor"
            },
            is_verified: true,
            election: 3
          },
          {
            id: 9,
            name: "Jennifer Adams",
            image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
            manifesto: "Rural development and agricultural support. Strengthening farming communities, improving rural healthcare, and building better infrastructure to connect all regions of our state.",
            party: {
              party_name: "Rural Alliance",
              party_symbol: "🌾"
            },
            position: {
              position_name: "Governor"
            },
            is_verified: true,
            election: 3
          },
          {
            id: 10,
            name: "Thomas Brown",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
            manifesto: "Fiscal responsibility and efficient government. Reducing wasteful spending, streamlining bureaucracy, and ensuring taxpayer money is used effectively for essential services.",
            party: {
              party_name: "Fiscal Conservative Party",
              party_symbol: "💰"
            },
            position: {
              position_name: "Governor"
            },
            is_verified: false,
            election: 3
          }
        ]
      };
      
      setElections(data.elections);
      setCandidates(data.candidates);
      if (data.elections?.length > 0) {
        setSelectedElection(data.elections[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getElectionCandidates = (electionId) => {
    return candidates.filter(candidate => candidate.election === electionId);
  };

  const handleVote = (electionId, candidateId) => {
    setVotes(prev => ({
      ...prev,
      [electionId]: candidateId
    }));
  };

  const submitVote = async (electionId) => {
    if (!votes[electionId]) {
      alert('Please select a candidate before voting');
      return;
    }

    try {
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful vote submission
      console.log(`Vote submitted for election ${electionId}, candidate ${votes[electionId]}`);
      
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
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedElection?.id === election.id
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
                  <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                    <Users className="h-6 w-6 mr-2 text-indigo-600" />
                    Candidates ({getElectionCandidates(selectedElection.id).length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {getElectionCandidates(selectedElection.id).map((candidate) => (
                      <div
                        key={candidate.id}
                        className={`border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                          votes[selectedElection.id] === candidate.id
                            ? 'border-green-500 bg-green-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => handleVote(selectedElection.id, candidate.id)}
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
                              {candidate.party.party_symbol && (
                                <p className="text-sm text-gray-600">Symbol: {candidate.party.party_symbol}</p>
                              )}
                            </div>

                            {candidate.manifesto && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <div className="flex items-center text-gray-600 mb-2">
                                  <FileText className="h-4 w-4 mr-1" />
                                  <span className="text-sm font-medium">Manifesto</span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-3">{candidate.manifesto}</p>
                              </div>
                            )}

                            <div className="flex justify-between items-center mt-4">
                              <div className="flex items-center space-x-2">
                                {candidate.is_verified && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              
                              {votes[selectedElection.id] === candidate.id && (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="h-5 w-5 mr-1" />
                                  <span className="text-sm font-medium">Selected</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vote Button */}
                  <div className="border-t pt-6">
                    <button
                      onClick={() => submitVote(selectedElection.id)}
                      disabled={!votes[selectedElection.id] || votedElections.has(selectedElection.id)}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                        votedElections.has(selectedElection.id)
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : votes[selectedElection.id]
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
                          {votes[selectedElection.id] ? 'Submit Vote' : 'Select a Candidate'}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionVotingApp;