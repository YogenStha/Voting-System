import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

// Mock Data (replace with API later)
const mockElectionData = [
  {
    id: 1,
    election: "Student Council Elections 2024",
    date: "2024-03-15",
    positions: [
      {
        position: "President",
        candidates: [
          { name: "Alice Johnson", party: "Progressive Party", votes: 1250 },
          { name: "Bob Smith", party: "Unity Party", votes: 980 },
          { name: "Carol Davis", party: "Independent", votes: 750 },
        ],
      },
      {
        position: "Vice President",
        candidates: [
          { name: "David Wilson", party: "Unity Party", votes: 1100 },
          { name: "Emma Brown", party: "Progressive Party", votes: 950 },
          { name: "Frank Miller", party: "Reform Party", votes: 830 },
        ],
      },
    ],
  },
  {
    id: 2,
    election: "Municipal Elections 2024",
    date: "2024-04-20",
    positions: [
      {
        position: "Mayor",
        candidates: [
          { name: "John Anderson", party: "Democratic Party", votes: 15420 },
          { name: "Sarah Williams", party: "Republican Party", votes: 12880 },
          { name: "Mike Rodriguez", party: "Independent", votes: 8950 },
        ],
      },
    ],
  },
];

const ElectionResults = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setElections(mockElectionData);
      setLoading(false);
    }, 800);
  }, []);

  const getWinner = (candidates) =>
    candidates.reduce((a, b) => (a.votes > b.votes ? a : b));

  const getTotalVotes = (candidates) =>
    candidates.reduce((sum, c) => sum + c.votes, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (selectedElection) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSelectedElection(null)}
              className="text-indigo-600 font-medium hover:underline"
            >
              ← Back
            </button>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800">
                {selectedElection.election}
              </h1>
              <p className="text-gray-500">
                {new Date(selectedElection.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Positions */}
          <div className="grid gap-8 md:grid-cols-2">
            {selectedElection.positions.map((pos, i) => {
              const winner = getWinner(pos.candidates);
              const total = getTotalVotes(pos.candidates);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow p-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {pos.position}
                  </h2>

                  {/* Winner Highlight */}
                  <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-6 text-center">
                    <p className="text-sm text-yellow-800">🏆 Winner</p>
                    <p className="font-bold text-lg">{winner.name}</p>
                    <p className="text-sm text-gray-600">{winner.party}</p>
                  </div>

                  {/* Chart */}
                  <div className="h-48 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pos.candidates}>
                        <XAxis dataKey="name" hide />
                        <Tooltip />
                        <Bar dataKey="votes" fill="#6366F1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Candidates List */}
                  <div className="space-y-3">
                    {pos.candidates
                      .sort((a, b) => b.votes - a.votes)
                      .map((c, j) => {
                        const pct = ((c.votes / total) * 100).toFixed(1);
                        return (
                          <div
                            key={j}
                            className={`p-3 border rounded-lg ${
                              c.name === winner.name
                                ? "bg-yellow-100 border-yellow-400"
                                : "bg-gray-50"
                            }`}
                          >
                            <div className="flex justify-between">
                              <p className="font-medium text-gray-800">
                                {c.name}
                              </p>
                              <p className="text-sm font-semibold">
                                {c.votes.toLocaleString()} ({pct}%)
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                              <div
                                className="h-2 rounded-full bg-indigo-500"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <p className="mt-4 text-sm text-gray-600">
                    Total Votes:{" "}
                    <span className="font-bold">{total.toLocaleString()}</span>
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          🗳️ Election Results
        </h1>
        <p className="text-gray-600">
          Click on any election to view detailed results
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {elections.map((e) => (
          <motion.div
            key={e.id}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
            onClick={() => setSelectedElection(e)}
          >
            <h2 className="text-xl font-bold text-indigo-600">{e.election}</h2>
            <p className="text-sm text-gray-500 mb-4">
              📅 {new Date(e.date).toLocaleDateString()}
            </p>
            <p className="text-gray-700 font-medium mb-2">
              Positions: {e.positions.length}
            </p>
            <div className="space-y-2">
              {e.positions.map((p, idx) => {
                const w = getWinner(p.candidates);
                return (
                  <p
                    key={idx}
                    className="text-sm bg-gray-50 p-2 rounded border text-left"
                  >
                    <span className="font-semibold">{p.position}:</span>{" "}
                    {w.name} ({w.party})
                  </p>
                );
              })}
            </div>
            <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">
              View Details →
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ElectionResults;
