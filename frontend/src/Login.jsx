import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storePrivateKey } from './hooks/secureDB';

const VoterLogin = () => {
  const navigate= useNavigate();
  const [voterId, setVoterId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    
    const response = await fetch("http://localhost:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: voterId,
        password: password
      }),
    });

    const data = await response.json();

    if(response.ok){
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      navigate('/voting'); // navigate to the home page after successful login
    } else{
      console.error("Login failed:", data);
      alert("Invalid Voter ID or Password");
    }

    const private_key = data.private_key;
    const user_id = data.user_id;

        const save_key = async () => {
          try {
            await storePrivateKey(user_id, private_key);
            console.log("Private key stored successfully.");
          }
          catch (error) {
            console.log("Error storing private key:", error);
            alert("Failed to store private key. Please try again.");
          }
        }
        await save_key();
    
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Voter Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Voter ID</label>
            <input
              type="text"
              placeholder="Enter your Voter ID"
              className="w-full mt-1 p-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
              required
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full mt-1 p-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>

          <div className="text-sm text-center mt-4">
            <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoterLogin;
