import { useNavigate } from 'react-router-dom';
function Option() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-10">
        Select Your Role 
      </h1>
      <div className="flex flex-wrap gap-6">
        <a href="/register">
        <button className="px-8 py-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 text-lg">
          Voter
        </button>
        </a>
        <a href="/Candidate_Registration">
        <button className="px-8 py-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 text-lg">
          Candidates
        </button>
        </a>
      </div>
    </div>
  );
}

export default Option;