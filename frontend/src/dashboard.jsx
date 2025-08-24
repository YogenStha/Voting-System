import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, Calendar, Users, CheckCircle, AlertCircle, User, FileText, XCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { loadPrivateKey, hasPrivateKey, getAllUserIds } from './hooks/secureDB';
import { signMessage } from './hooks/signature';

// Utility functions for encryption and hashing
const sha256 = async (data) => {
  const encoder = new TextEncoder();
  const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return new Uint8Array(hashBuffer);
};

const encryptWithAES = async (key, plaintext) => {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM needs 12 bytes IV
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    cryptoKey,
    plaintext
  );
  
  // Combine IV and ciphertext
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return combined;
};

const encryptWithRSA = async (publicKeyPem, data) => {
  // Remove PEM headers and decode base64
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = publicKeyPem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
  const keyData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const publicKey = await crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  );
  
  return new Uint8Array(encrypted);
};

const base64Encode = (uint8Array) => {
  return btoa(String.fromCharCode(...uint8Array));
};

const base64Decode = (base64String) => {
  return Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
};

const ElectionVotingApp = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittingVote, setSubmittingVote] = useState(false);
  const [votedElections, setVotedElections] = useState(new Set());
  const [showKeyManagement, setShowKeyManagement] = useState(false);
  const [hasUserKey, setHasUserKey] = useState(false);
  const [credentials, setCredentials] = useState({}); // Store credentials per election

  const voterId = parseInt(sessionStorage.getItem("user_id"), 10);
  console.log('type of Voter ID from session:', typeof voterId);

  useEffect(() => {
    fetchElectionData();
    fetchUserVoteHistory();
    loadCredentials();
  }, []);

  // Load credentials from localStorage
  const loadCredentials = () => {
    try {
      const savedCredentials = localStorage.getItem(`credentials_${voterId}`);
      if (savedCredentials) {
        const parsedCredentials = JSON.parse(savedCredentials);
        setCredentials(parsedCredentials);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  // Save credentials to localStorage
  const saveCredentials = (newCredentials) => {
    try {
      localStorage.setItem(`credentials_${voterId}`, JSON.stringify(newCredentials));
      setCredentials(newCredentials);
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  // Generate or retrieve credential for an election
  const getOrCreateCredential = async (electionId) => {
    // Check if we already have a credential for this election
    if (credentials[electionId]) {
      console.log('Using existing credential for election:', electionId);
      return credentials[electionId];
    }

    // Generate new credential
    console.log('Generating new credential for election:', electionId);
    const S_array = JSON.parse(localStorage.getItem('S'));
    const S = new Uint8Array(S_array);
    console.log("S value in dashboard:", S_array);
    // TODO: In a real implementation, you would get σ (sigma) from the Election Authority
    // For now, we'll simulate it or get it from your backend
    let sigma;
    let voter_credential;
    try {
      // Request credential signature from EA
      const response = await fetch(`http://localhost:8000/api/elections/${electionId}/credential/`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          election_id: electionId,
          serial_number: btoa(String.fromCharCode(...S))
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Received credential data from EA:", data);
        sigma = base64Decode(data.signature);
        voter_credential = data.voter_credential_id;
        console.log("received voter credential id: ", voter_credential);
      } else {
        throw new Error('Failed to get credential signature from EA');
      }
    } catch (error) {
      console.error('Error getting credential signature:', error);
      // For development, generate a dummy sigma
      sigma = crypto.getRandomValues(new Uint8Array(256)); // Dummy signature
    }

    const credential = { S: Array.from(S), sigma: Array.from(sigma), voter_credential_id: voter_credential };
    
    // Save the credential
    const newCredentials = { ...credentials, [electionId]: credential };
    saveCredentials(newCredentials);
    
    return credential;
  };

  // Load voted elections from localStorage on component mount
  const loadVotedElections = () => {
    try {
      const savedVotedElections = localStorage.getItem(`votedElections_${voterId}`);
      if (savedVotedElections) {
        const parsedElections = JSON.parse(savedVotedElections);
        setVotedElections(new Set(parsedElections));
      }
    } catch (error) {
      console.error('Error loading voted elections:', error);
    }
  };

  // Save voted elections to localStorage
  const saveVotedElections = (electionIds) => {
    try {
      localStorage.setItem(`votedElections_${voterId}`, JSON.stringify([...electionIds]));
    } catch (error) {
      console.error('Error saving voted elections:', error);
    }
  };

  // Fetch user's vote history from backend (better approach)
  const fetchUserVoteHistory = async () => {
    try {
      console.log("Token being sent:", localStorage.getItem("access_token"));

      const response = await fetch(`http://localhost:8000/api/user/vote-history/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Assuming the API returns an array of election IDs the user has voted in
        const votedElectionIds = data.voted_elections || [];
        setVotedElections(new Set(votedElectionIds));
      } else {
        // Fallback to localStorage if API fails
        loadVotedElections();
      }
    } catch (error) {
      console.error('Error fetching vote history:', error);
      // Fallback to localStorage if API fails
      loadVotedElections();
    }
  };

  const fetchElectionData = async () => {
    try {
      setLoading(true);

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

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
    setTimeout(() => setShowErrorModal(false), 5000);
  };

  const showSuccess = () => {
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  console.log('Component rendered, selectedElection:', selectedElection?.name);

  useEffect(() => {
    checkPrivateKeyExists();
  }, [voterId]);

  const checkPrivateKeyExists = async () => {
    if (!voterId) {
      console.warn('No voter ID found');
      return;
    }

    try {
      const keyExists = await hasPrivateKey(voterId);
      console.log(`Private key exists for ${voterId}: ${keyExists}`);
      setHasUserKey(keyExists);

      if (!keyExists) {
        console.warn('No private key found - user should generate one');
        // Optionally show key management automatically
        // setShowKeyManagement(true);
      }
    } catch (error) {
      console.error('Error checking private key:', error);
      setHasUserKey(false);
    }
  };

  const submitVote = async (electionId) => {
    // Get all positions for this election
    if (!hasUserKey) {
      showError("You need to generate a private key first. Please use the Key Management section.");
      setShowKeyManagement(true);
      return;
    }

    const electionCandidates = getElectionCandidates(electionId);
    const positions = [...new Set(electionCandidates.map(candidate => candidate.position.id))];

    // Check if votes have been made for all positions
    const electionVotes = votes[electionId] || {};
    const hasVotedForAllPositions = positions.every(positionId => electionVotes[positionId]);

    if (!hasVotedForAllPositions) {
      showError('Please select a candidate for each position before voting');
      return;
    }

    setSubmittingVote(true);
    
    try {
      // Get or create credential for this election
      const credential = await getOrCreateCredential(electionId);
      const S = new Uint8Array(credential.S);
      const sigma = new Uint8Array(credential.sigma);
      const voter_credential = credential.voter_credential_id;
      console.log('Using credential S:', S);
      console.log("voter credential id: ", voter_credential);
      console.log('Using credential sigma:', sigma);

      // Find the election to get its public key
      const election = elections.find(e => e.id === electionId);
      if (!election || !election.public_key) {
        throw new Error('Election public key not found');
      }

      // Prepare candidate selections
      const candidateIds = positions.map(positionId => electionVotes[positionId]);
      console.log('Selected candidate IDs:', candidateIds);

      // Generate AES key for vote encryption
      const aesKey = crypto.getRandomValues(new Uint8Array(32));

      // Encrypt the vote data
      const voteData = new TextEncoder().encode(JSON.stringify({ candidate_ids: candidateIds }));
      const voteCiphertext = await encryptWithAES(aesKey, voteData);

      // Encrypt AES key with election public key
      const aesKeyWrapped = await encryptWithRSA(election.public_key, aesKey);

      // Create serial commitment (hash of S)
      const serialCommitment = await sha256(S);

      // Prepare payload according to your backend expectations
      const payload = {
        election_id: electionId,
        voter_credential_id: voter_credential,
        candidate_ciphertext: base64Encode(voteCiphertext),
        aes_key_wrapped: base64Encode(aesKeyWrapped),
        credential_sig: base64Encode(sigma),
        serial_commitment: base64Encode(serialCommitment),
        timestamp: new Date().toISOString()
      };

      console.log("Submitting vote payload:", payload);

      const response = await fetch("http://localhost:8000/api/vote/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      // Parse the response
      const responseData = await response.json();
      console.log("Vote submission response:", responseData);

      if (response.ok) {
        // Success case
        console.log(`Vote submitted successfully for election ${electionId}`);
        const newVotedElections = new Set([...votedElections, electionId]);
        setVotedElections(newVotedElections);
        saveVotedElections(newVotedElections);
        showSuccess();

        // Clear the votes for this election
        setVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[electionId];
          return newVotes;
        });
      } else {
        // Error case - handle different types of errors
        let errorMsg = 'Failed to submit vote. Please try again.';

        if (response.status === 400) {
          // Validation errors
          if (responseData.non_field_errors) {
            errorMsg = responseData.non_field_errors[0];
          } else if (responseData.voter_id) {
            errorMsg = responseData.voter_id[0];
          } else if (responseData.election_id) {
            errorMsg = responseData.election_id[0];
          } else if (responseData.votes) {
            errorMsg = 'There was an error with your vote selections.';
          } else {
            errorMsg = 'Invalid vote data. Please check your selections.';
          }
        } else if (response.status === 401) {
          errorMsg = 'You are not authorized to vote. Please log in again.';
          navigate('/login');
        } else if (response.status === 403) {
          errorMsg = 'You do not have permission to vote in this election.';
        } else if (response.status >= 500) {
          errorMsg = 'Server error occurred. Please try again later.';
        }

        console.error('Vote submission failed:', responseData);
        showError(errorMsg);
      }
    } catch (err) {
      console.error('Error during vote submission:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showError('Network error. Please check your connection and try again.');
      } else {
        showError(`An error occurred: ${err.message}`);
      }
    } finally {
      setSubmittingVote(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Vote Failed</h3>
            <p className="text-gray-600 text-center mb-4">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Close
            </button>
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
                    {credentials[election.id] && (
                      <div className="flex items-center text-blue-600 text-xs mt-1">
                        <User className="h-3 w-3 mr-1" />
                        Credential Ready
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
                          console.log('Candidate object:', candidate);

                          const candidateKey = `${candidate.id}`;
                          const positionKey = candidate.position.id;
                          console.log('Candidate key:', candidateKey, 'Position key:', positionKey);

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
                      disabled={!hasAnyVotes(selectedElection.id) || submittingVote}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${hasAnyVotes(selectedElection.id) && !submittingVote
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {submittingVote ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting Vote...
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