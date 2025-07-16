
import Navbar from "./Navbar.jsx"; 
import Home from "./Home.jsx"; 
import Login from "./Login.jsx";
import { Routes, Route } from 'react-router-dom';
import Register from "./Register.jsx";
import useAuthTokenRefresh from './hooks/useAuthTokenRefresh';

// add protectedRoutes.jsx later to allow only logged in users to access certain routes
function App() {
  useAuthTokenRefresh(29); // Refresh token every 4 minutes by default
  return (
    <>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
      </Routes>
    </>
  );

}
export default  App;