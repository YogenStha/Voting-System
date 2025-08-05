import { useState, useEffect } from "react"
import { Users, Vote, Settings, Plus, Trash2 } from "lucide-react"

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
}

// Mock initial data
const initialElections = [
  {
    id: 1,
    name: "Student Council Election 2024",
    startTime: new Date(Date.now() + 60000), // 1 minute from now
    endTime: new Date(Date.now() + 300000), // 5 minutes from now
    status: "upcoming", // upcoming, active, completed
    isResultPublished: false,
  },
]

const initialCandidates = [
  { id: 1, name: "John Doe", position: "President", electionId: 1, votes: 0 },
  { id: 2, name: "Jane Smith", position: "President", electionId: 1, votes: 0 },
  { id: 3, name: "Mike Johnson", position: "Vice President", electionId: 1, votes: 0 },
  { id: 4, name: "Sarah Wilson", position: "Vice President", electionId: 1, votes: 0 },
  { id: 5, name: "Tom Brown", position: "Secretary", electionId: 1, votes: 0 },
  { id: 6, name: "Lisa Davis", position: "Secretary", electionId: 1, votes: 0 },
]

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")

  const handleLogin = () => {
    if (credentials.username === ADMIN_CREDENTIALS.username && credentials.password === ADMIN_CREDENTIALS.password) {
      onLogin()
      setError("")
    } else {
      setError("Invalid username or password")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin password"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
        
      </div>
    </div>
  )
}

const VoterDashboard = ({ elections, candidates, votes, onVote, currentVoter, setCurrentVoter }) => {
  const [voterId, setVoterId] = useState(currentVoter?.id || "")
  const [voterName, setVoterName] = useState(currentVoter?.name || "")
  const [selectedVotes, setSelectedVotes] = useState({})

  const activeElection = elections.find((e) => e.status === "active")
  const completedElections = elections.filter((e) => e.status === "completed" && e.isResultPublished)

  const getTimeRemaining = (endTime) => {
    const now = new Date()
    const diff = endTime - now
    if (diff <= 0) return "Election Ended"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const [timeRemaining, setTimeRemaining] = useState("")

  useEffect(() => {
    if (activeElection) {
      const timer = setInterval(() => {
        setTimeRemaining(getTimeRemaining(activeElection.endTime))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [activeElection])

  const handleLogin = () => {
    if (voterId && voterName) {
      setCurrentVoter({ id: voterId, name: voterName })
    }
  }

  const hasVotedForPosition = (electionId, position) => {
    return votes.some(
      (vote) => vote.voterId === currentVoter?.id && vote.electionId === electionId && vote.position === position,
    )
  }

  const getVoterVotesForElection = (electionId) => {
    return votes.filter((vote) => vote.voterId === currentVoter?.id && vote.electionId === electionId)
  }

  const handleVoteSelection = (position, candidateId) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [position]: candidateId,
    }))
  }

  const submitVotes = () => {
    if (activeElection && currentVoter && Object.keys(selectedVotes).length > 0) {
      Object.entries(selectedVotes).forEach(([position, candidateId]) => {
        onVote(currentVoter.id, candidateId, activeElection.id, position)
      })
      setSelectedVotes({})
      alert("Votes submitted successfully!")
    }
  }

  const groupCandidatesByPosition = (electionId) => {
    const electionCandidates = candidates.filter((c) => c.electionId === electionId)
    const grouped = {}
    electionCandidates.forEach((candidate) => {
      if (!grouped[candidate.position]) {
        grouped[candidate.position] = []
      }
      grouped[candidate.position].push(candidate)
    })
    return grouped
  }

  const getVotingStatus = (electionId) => {
    const voterVotes = getVoterVotesForElection(electionId)
    const positions = Object.keys(groupCandidatesByPosition(electionId))
    const votedPositions = voterVotes.map((vote) => vote.position)

    return {
      hasVotedAny: voterVotes.length > 0,
      votedPositions,
      totalPositions: positions.length,
      remainingPositions: positions.filter((pos) => !votedPositions.includes(pos)),
    }
  }

  if (!currentVoter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Voter Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Voter ID</label>
              <input
                type="text"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your voter ID (e.g., V001)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
          
        </div>
      </div>
    )
  }

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
            <button
              onClick={() => setCurrentVoter(null)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Election */}
        {activeElection && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeElection.name}</h2>
                <p className="text-gray-600">Active Election</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-red-600">{timeRemaining}</div>
                <p className="text-sm text-gray-600">Time Remaining</p>
              </div>
            </div>

            {(() => {
              const votingStatus = getVotingStatus(activeElection.id)

              if (votingStatus.hasVotedAny) {
                return (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Vote className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            You have voted in {votingStatus.votedPositions.length} out of {votingStatus.totalPositions}{" "}
                            positions
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Your votes:</p>
                            <ul className="list-disc list-inside mt-1">
                              {getVoterVotesForElection(activeElection.id).map((vote) => {
                                const candidate = candidates.find((c) => c.id === vote.candidateId)
                                return (
                                  <li key={vote.id}>
                                    {vote.position}: {candidate?.name}
                                  </li>
                                )
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
                          const positionCandidates = groupCandidatesByPosition(activeElection.id)[position]
                          return (
                            <div key={position} className="border border-gray-200 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">{position}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {positionCandidates.map((candidate) => (
                                  <div
                                    key={candidate.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                      selectedVotes[position] === candidate.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    onClick={() => handleVoteSelection(position, candidate.id)}
                                  >
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        name={position}
                                        checked={selectedVotes[position] === candidate.id}
                                        onChange={() => handleVoteSelection(position, candidate.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      />
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                                        <p className="text-sm text-gray-500">{candidate.position}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}

                        {Object.keys(selectedVotes).length > 0 && (
                          <div className="flex justify-center">
                            <button
                              onClick={submitVotes}
                              className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
                            >
                              Submit Additional Votes
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              } else {
                return (
                  <div className="space-y-6">
                    {Object.entries(groupCandidatesByPosition(activeElection.id)).map(
                      ([position, positionCandidates]) => (
                        <div key={position} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">{position}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {positionCandidates.map((candidate) => (
                              <div
                                key={candidate.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                  selectedVotes[position] === candidate.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => handleVoteSelection(position, candidate.id)}
                              >
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    name={position}
                                    checked={selectedVotes[position] === candidate.id}
                                    onChange={() => handleVoteSelection(position, candidate.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                                    <p className="text-sm text-gray-500">{candidate.position}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}

                    {Object.keys(selectedVotes).length > 0 && (
                      <div className="flex justify-center">
                        <button
                          onClick={submitVotes}
                          className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
                        >
                          Submit Votes
                        </button>
                      </div>
                    )}
                  </div>
                )
              }
            })()}
          </div>
        )}

        {/* Completed Elections with Published Results */}
        {completedElections.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Election Results</h2>
            {completedElections.map((election) => (
              <div key={election.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{election.name}</h3>
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
                                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                                    Winner
                                  </span>
                                )}
                                <span className="text-sm font-medium">{candidate.name}</span>
                              </div>
                              <span className="text-sm text-gray-600">{candidate.votes} votes</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
  )
}

const AdminPanel = ({
  elections,
  candidates,
  votes,
  onCreateElection,
  onUpdateElection,
  onAddCandidate,
  onDeleteCandidate,
  onPublishResults,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState("elections")
  const [showCreateElection, setShowCreateElection] = useState(false)
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  const [newElection, setNewElection] = useState({
    name: "",
    startTime: "",
    endTime: "",
  })
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position: "",
    electionId: "",
  })

  const handleCreateElection = () => {
    if (newElection.name && newElection.startTime && newElection.endTime) {
      onCreateElection({
        ...newElection,
        startTime: new Date(newElection.startTime),
        endTime: new Date(newElection.endTime),
      })
      setNewElection({ name: "", startTime: "", endTime: "" })
      setShowCreateElection(false)
    }
  }

  const handleAddCandidate = () => {
    if (newCandidate.name && newCandidate.position && newCandidate.electionId) {
      onAddCandidate(newCandidate)
      setNewCandidate({ name: "", position: "", electionId: "" })
      setShowAddCandidate(false)
    }
  }

  const getVoteCount = (candidateId) => {
    return votes.filter((vote) => vote.candidateId === candidateId).length
  }

  const groupCandidatesByPosition = (electionId) => {
    const electionCandidates = candidates.filter((c) => c.electionId === electionId)
    const grouped = {}
    electionCandidates.forEach((candidate) => {
      if (!grouped[candidate.position]) {
        grouped[candidate.position] = []
      }
      grouped[candidate.position].push({
        ...candidate,
        votes: getVoteCount(candidate.id),
      })
    })
    return grouped
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <div className="flex space-x-8">
            {["elections", "candidates", "results"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "elections" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Elections Management</h2>
              <button
                onClick={() => setShowCreateElection(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Election
              </button>
            </div>

            {showCreateElection && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Create New Election</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Election Name</label>
                    <input
                      type="text"
                      value={newElection.name}
                      onChange={(e) => setNewElection((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      value={newElection.startTime}
                      onChange={(e) => setNewElection((prev) => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      value={newElection.endTime}
                      onChange={(e) => setNewElection((prev) => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowCreateElection(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateElection}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {elections.map((election) => (
                <div key={election.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{election.name}</h3>
                      <p className="text-sm text-gray-600">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            election.status === "active"
                              ? "text-green-600"
                              : election.status === "completed"
                                ? "text-blue-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {election.status}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">Start: {election.startTime.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">End: {election.endTime.toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      {election.status === "completed" && !election.isResultPublished && (
                        <button
                          onClick={() => onPublishResults(election.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Publish Results
                        </button>
                      )}
                      {election.isResultPublished && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">Results Published</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "candidates" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Candidates Management</h2>
              <button
                onClick={() => setShowAddCandidate(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </button>
            </div>

            {showAddCandidate && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Add New Candidate</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Candidate Name</label>
                    <input
                      type="text"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                      type="text"
                      value={newCandidate.position}
                      onChange={(e) => setNewCandidate((prev) => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., President, Vice President"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Election</label>
                    <select
                      value={newCandidate.electionId}
                      onChange={(e) =>
                        setNewCandidate((prev) => ({ ...prev, electionId: Number.parseInt(e.target.value) }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Election</option>
                      {elections.map((election) => (
                        <option key={election.id} value={election.id}>
                          {election.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowAddCandidate(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCandidate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Candidate
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {elections.map((election) => (
                <div key={election.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{election.name}</h3>
                  {Object.entries(groupCandidatesByPosition(election.id)).map(([position, positionCandidates]) => (
                    <div key={position} className="mb-4">
                      <h4 className="text-md font-medium text-gray-700 mb-2">{position}</h4>
                      <div className="space-y-2">
                        {positionCandidates.map((candidate) => (
                          <div key={candidate.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                            <span className="font-medium">{candidate.name}</span>
                            <button
                              onClick={() => onDeleteCandidate(candidate.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Live Results & Analytics</h2>
            <div className="space-y-6">
              {elections.map((election) => (
                <div key={election.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{election.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        election.status === "active"
                          ? "bg-green-100 text-green-800"
                          : election.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {election.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(groupCandidatesByPosition(election.id)).map(([position, positionCandidates]) => (
                      <div key={position} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-md font-medium text-gray-900 mb-3">{position}</h4>
                        <div className="space-y-3">
                          {positionCandidates
                            .sort((a, b) => b.votes - a.votes)
                            .map((candidate, index) => {
                              const totalVotes = positionCandidates.reduce((sum, c) => sum + c.votes, 0)
                              const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0

                              return (
                                <div key={candidate.id} className="flex items-center justify-between">
                                  <div className="flex items-center flex-1">
                                    {index === 0 && candidate.votes > 0 && (
                                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                                        Leading
                                      </span>
                                    )}
                                    <span className="font-medium">{candidate.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium w-12 text-right">{candidate.votes}</span>
                                    <span className="text-sm text-gray-500 w-12 text-right">{percentage}%</span>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total Votes Cast: {votes.filter((v) => v.electionId === election.id).length}</span>
                      <span>
                        Unique Voters:{" "}
                        {new Set(votes.filter((v) => v.electionId === election.id).map((v) => v.voterId)).size}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const Voting = () => {
  const [currentView, setCurrentView] = useState("voter") // 'voter' or 'admin'
  const [elections, setElections] = useState(initialElections)
  const [candidates, setCandidates] = useState(initialCandidates)
  const [votes, setVotes] = useState([])
  const [currentVoter, setCurrentVoter] = useState(null)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  // Update election status based on time
  useEffect(() => {
    const updateElectionStatus = () => {
      const now = new Date()
      setElections((prev) =>
        prev.map((election) => {
          let status = election.status
          if (now >= election.startTime && now < election.endTime) {
            status = "active"
          } else if (now >= election.endTime) {
            status = "completed"
          } else {
            status = "upcoming"
          }
          return { ...election, status }
        }),
      )
    }

    updateElectionStatus()
    const interval = setInterval(updateElectionStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleVote = (voterId, candidateId, electionId, position) => {
    // Remove any existing votes from this voter for this position in this election
    setVotes((prev) =>
      prev.filter(
        (vote) => !(vote.voterId === voterId && vote.electionId === electionId && vote.position === position),
      ),
    )

    // Add the new vote
    const newVote = {
      id: Date.now() + Math.random(),
      voterId,
      candidateId,
      electionId,
      position,
      timestamp: new Date(),
    }

    setVotes((prev) => [...prev, newVote])
  }

  const handleCreateElection = (electionData) => {
    const newElection = {
      id: Date.now(),
      ...electionData,
      status: "upcoming",
      isResultPublished: false,
    }
    setElections((prev) => [...prev, newElection])
  }

  const handleUpdateElection = (electionId, updates) => {
    setElections((prev) =>
      prev.map((election) => (election.id === electionId ? { ...election, ...updates } : election)),
    )
  }

  const handleAddCandidate = (candidateData) => {
    const newCandidate = {
      id: Date.now(),
      ...candidateData,
      votes: 0,
    }
    setCandidates((prev) => [...prev, newCandidate])
  }

  const handleDeleteCandidate = (candidateId) => {
    setCandidates((prev) => prev.filter((candidate) => candidate.id !== candidateId))
    // Also remove any votes for this candidate
    setVotes((prev) => prev.filter((vote) => vote.candidateId !== candidateId))
  }

  const handlePublishResults = (electionId) => {
    setElections((prev) =>
      prev.map((election) => (election.id === electionId ? { ...election, isResultPublished: true } : election)),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-blue-600">ChunabE</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setCurrentView("voter")
                  setIsAdminAuthenticated(false)
                }}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentView === "voter" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Voter
              </button>
              <button
                onClick={() => setCurrentView("admin")}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentView === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentView === "voter" ? (
        <VoterDashboard
          elections={elections}
          candidates={candidates}
          votes={votes}
          onVote={handleVote}
          currentVoter={currentVoter}
          setCurrentVoter={setCurrentVoter}
        />
      ) : isAdminAuthenticated ? (
        <AdminPanel
          elections={elections}
          candidates={candidates}
          votes={votes}
          onCreateElection={handleCreateElection}
          onUpdateElection={handleUpdateElection}
          onAddCandidate={handleAddCandidate}
          onDeleteCandidate={handleDeleteCandidate}
          onPublishResults={handlePublishResults}
          onLogout={() => setIsAdminAuthenticated(false)}
        />
      ) : (
        <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />
      )}
    </div>
  )
}

export default Voting;
