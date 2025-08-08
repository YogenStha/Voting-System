import Navbar from "./Navbar.jsx"; 
import Home from "./Home.jsx"; 
import Login from "./Login.jsx";
import { Routes, Route ,useLocation} from 'react-router-dom';
import Register from "./Register.jsx";
import useAuthTokenRefresh from './hooks/useAuthTokenRefresh';
import ElectionDetails from "./dashboard.jsx";
import VotingPage from "./as.jsx";

// add protectedRoutes.jsx later to allow only logged in users to access certain routes
function App() {
  useAuthTokenRefresh(29); // Refresh token every 4 minutes by default
   const location = useLocation();
     // List of paths where Navbar should be hidden
  const hideNavbarPaths = ["/voting"];
  return (
    <>
       {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={<ElectionDetails />} />
        <Route path="/voting" element={<VotingPage />} />
      </Routes>
    </>
  );

}
export default  App;
