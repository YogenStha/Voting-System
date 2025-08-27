import React from 'react'; 
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
// add protectedRoutes.jsx later to allow only logged in users to access certain routes
function App() {
  useAuthTokenRefresh(1); // Refresh token every 4 minutes by default
  const location = useLocation();
  // List of paths where Navbar should be hidden
  const hideNavbarPaths = ["/voting"];
  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/RegistrationOptions" element={<Option />} />
        <Route path="/register" element={<Register />} />
        <Route path="/CandidateForm" element={<CandidateForm/>}/>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ElectionDetails />
          </ProtectedRoute>} />
        <Route path="/voting" element={<VotingPage />} />
        <Route path="/Candidates" element={<UserCards/>}/>
      </Routes>
      
    </>
  );

}
export default App;
