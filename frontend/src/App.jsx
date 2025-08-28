import React, { Suspense, lazy } from 'react'; 
import Navbar from "./Navbar.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom';
import Register from "./Register.jsx";
import Option from "./RegistrationOptions.jsx";
import useAuthTokenRefresh from './hooks/useAuthTokenRefresh';
import ElectionDetails from "./dashboard.jsx";
import VotingPage from "./as.jsx";
import ProtectedRoute from './ProtectedRoute.jsx';
import UserCards from "./Candidates.jsx";
import CandidateForm from "./CandidateForm.jsx"
import ElectionResults from "./Result.jsx";
// import ElectionResultsApp from "./result_as.jsx"

const Result = lazy(() => import("./result_as.jsx"));

function App() {
  useAuthTokenRefresh(1); // Refresh token every 4 minutes by default
  const location = useLocation();
  // List of paths where Navbar should be hidden
  const hideNavbarPaths = ["/voting"];
  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      
      <Suspense fallback={<div className="p-6 text-center text-gray-600">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Registration_Options" element={<Option />} />
        <Route path="/User_registration" element={<Register />} />
        <Route path="/Candidate_Registration" element={<CandidateForm/>}/>
        <Route path="/result" element={<Result/>}/>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ElectionDetails />
          </ProtectedRoute>} />
        <Route path="/voting" element={<VotingPage />} />
        <Route path="/Candidates" element={<UserCards/>}/>
      </Routes>
      </Suspense>
    </>
  );

}
export default App;
