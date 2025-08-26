import React, { useEffect, useState } from 'react';

function UserCards() {
  const [users, setUsers] = useState([]);

   useEffect(() => {
    fetch('http://localhost/api/candidate-details/',{
      method:"GET",
      headers: {
        "Content-Type":"application/json",
      }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data); // store the fetched data in state
        console.log('candidate detail: ', data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  {users.map(user => (
    <div
      key={user.candidate_id}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 ease-in-out"
    >
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h3>
        {user.image && (
          <img
            src={user.image}
            alt={user.name}
            className="w-full max-h-48 object-contain rounded-md mb-4"
          />
        )}
        <div className="space-y-2 text-gray-700">
          <p><span className="font-semibold">Candidate ID:</span> {user.candidate_id}</p>
          <p><span className="font-semibold">Position:</span> {user.position}</p>
          <p><span className="font-semibold">Party Name:</span> {user.partyname}</p>
          <p><span className="font-semibold">Manifesto:</span> {user.manifesto}</p>
        </div>
      </div>
    </div>
  ))}
</div>
  );
}

export default UserCards;