import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ElectionResults = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/result.json')
      .then(response => {
        setElections(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Unable to load election results');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Election Winners</h1>

      {loading && <p className="text-blue-500">Loading results...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {elections.map((election, index) => {
          const winner = election.winner || {};
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold text-indigo-700 mb-2">
                {election.election || 'Unknown Election'}
              </h2>
              <p className="text-gray-700 mb-1">
                <strong>Position:</strong> {election.position || 'Unknown Position'}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Winner:</strong> {winner.name || 'N/A'}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Party:</strong> {winner.party || 'N/A'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Total Votes: {winner.votes ? winner.votes.toLocaleString() : 'N/A'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ElectionResults;