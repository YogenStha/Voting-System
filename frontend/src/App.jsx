
import Navbar from "./Navbar.jsx"; 
import Home from "./Home.jsx"; 
import Login from "./Login.jsx";
import { Routes, Route } from 'react-router-dom';
import Register from "./Register.jsx";
function App() {
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