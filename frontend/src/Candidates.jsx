import React, { useEffect, useState } from "react";

function UserCards() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/candidate-details/");
        const data = await response.json();
        setCandidates(data.candidate_detail);
        console.log("candidate data: ", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates(); // call it
  }, []);


  if (loading){
    
    return <p>Loading...</p>;
  } 
  

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
  <h2 className="text-2xl font-bold mb-6 text-center">Candidate List</h2>
  
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {candidates.map((c) => (
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

export default UserCards;