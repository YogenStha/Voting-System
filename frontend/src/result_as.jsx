import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Calendar, Users, Trophy, ArrowLeft, Vote } from "lucide-react";

const ElectionResultsApp = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchElectionResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:8000/api/election/result/",
          { headers: { "Content-Type": "application/json" } }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Group candidates by position for each election
        const processedElections = data.map((e) => {
          const positions = {};
          e.candidates.forEach((c) => {
            const posName = c.candidate.position.position_name;
            if (!positions[posName]) positions[posName] = [];
            positions[posName].push({ ...c.candidate, votes: c.vote_count });
          });
          return { ...e, results_by_position: positions };
        });

        setElections(processedElections);
      } catch (err) {
        console.error("Error fetching election results:", err);
        // You can add error state management here if needed
      } finally {
        setLoading(false);
      }
    };

    fetchElectionResults();
  }, []);

  const getWinner = (candidates) =>
    candidates.reduce((a, b) => (a.votes > b.votes ? a : b));

  const getTotalVotes = (candidates) =>
    candidates.reduce((sum, c) => sum + c.votes, 0);

  const getElectionWinners = (election) => {
    const winners = [];
    Object.entries(election.results_by_position).forEach(([position, candidates]) => {
      const winner = getWinner(candidates);
      winners.push({ position, winner });
    });
    return winners;
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Election Results...</p>
        </motion.div>
      </div>
    );
  }

  if (elections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No election data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AnimatePresence mode="wait">
        {!selectedElection ? (
          <motion.div
            key="election-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 max-w-7xl mx-auto"
          >
            {/* Header */}
            <motion.div 
              className="text-center mb-12"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                🗳️ Election Results
              </h1>
              <p className="text-xl text-gray-600">Click on an election to view detailed results</p>
            </motion.div>

            {/* Election Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {elections.map((election, index) => {
                const winners = getElectionWinners(election);
                const totalCandidates = election.candidates.length;
                const isActive = election.is_active;

                return (
                  <motion.div
                    key={election.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedElection(election)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {election.name}
                        </h3>
                        {isActive && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-gray-600 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600 mb-6">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">{totalCandidates} Candidates</span>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 mb-3">Winners:</h4>
                        {winners.map((w, i) => (
                          <div key={i} className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
                            <div>
                              <p className="font-medium text-gray-800">{w.winner.name}</p>
                              <p className="text-sm text-gray-600">{w.position}</p>
                            </div>
                            <Trophy className="w-5 h-5 text-yellow-600" />
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 group-hover:shadow-lg">
                          View Details →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="election-details"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="p-6 max-w-7xl mx-auto"
          >
            {/* Back Button */}
            <motion.button
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center mb-8 text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => setSelectedElection(null)}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Elections
            </motion.button>

            {/* Election Header */}
            <motion.div 
              className="text-center mb-12"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{selectedElection.name}</h1>
              <div className="flex items-center justify-center text-gray-600 mb-4">
                <Calendar className="w-5 h-5 mr-2" />
                <span>
                  {new Date(selectedElection.start_date).toLocaleDateString()} - {new Date(selectedElection.end_date).toLocaleDateString()}
                </span>
              </div>
              {selectedElection.is_active && (
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                  Election Active
                </span>
              )}
            </motion.div>

            {/* Position Results */}
            <div className="grid gap-8 lg:grid-cols-2">
              {Object.entries(selectedElection.results_by_position).map(
                ([positionName, candidates], i) => {
                  const winner = getWinner(candidates);
                  const total = getTotalVotes(candidates);
                  const sortedCandidates = candidates.sort((a, b) => b.votes - a.votes);

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.2 }}
                      className="bg-white rounded-2xl shadow-xl p-8"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        {positionName}
                      </h2>

                      {/* Winner Highlight */}
                      <motion.div 
                        className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 p-6 rounded-xl mb-8 text-center"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                        <p className="text-sm text-yellow-800 mb-2">🏆 Winner</p>
                        <p className="font-bold text-xl text-gray-800">{winner.name}</p>
                        <p className="text-sm text-gray-600 mb-2">{winner.party.party_name}</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {winner.votes} votes ({((winner.votes / total) * 100).toFixed(1)}%)
                        </p>
                      </motion.div>

                      {/* Chart */}
                      <div className="h-56 mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sortedCandidates} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [`${value} votes`, 'Votes']}
                              labelFormatter={(label) => `Candidate: ${label}`}
                            />
                            <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                              {sortedCandidates.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Candidates List */}
                      <div className="space-y-4">
                        {sortedCandidates.map((c, j) => {
                          const pct = ((c.votes / total) * 100).toFixed(1);
                          const isWinner = c.name === winner.name;
                          
                          return (
                            <motion.div
                              key={j}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: j * 0.1 }}
                              className={`p-4 rounded-xl transition-all duration-300 ${
                                isWinner
                                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-md"
                                  : "bg-gray-50 border border-gray-200 hover:shadow-md"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-3">
                                <div>
                                  <p className="font-semibold text-gray-800 text-lg">{c.name}</p>
                                  <p className="text-sm text-gray-600">{c.party.party_name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg text-gray-800">{c.votes}</p>
                                  <p className="text-sm font-semibold text-blue-600">{pct}%</p>
                                </div>
                              </div>
                              
                              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-3 rounded-full ${isWinner ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 1, delay: j * 0.1 }}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                        <p className="text-lg font-semibold text-gray-700">
                          Total Votes: <span className="text-blue-600">{total}</span>
                        </p>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElectionResultsApp;