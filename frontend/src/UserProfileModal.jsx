import React, { useState, useEffect } from "react";
import { User, MapPin, IdCard, LogOut, Mail } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const UserProfileModal = ({ user, onClose }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [profile, setProfile] = useState('')
  const [voter, setVoter] = useState('');
  const navigate = useNavigate();
  
   useEffect(() => {
    
    loadUserDetails();
  
    }, []);

  const HandleLogout = () => {
    
    // Clear storage
    localStorage.clear();
    
    sessionStorage.clear("user");

    // Redirect
    navigate("/login");
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      
       // Prepare form data
    const formData = new FormData();
    formData.append("profile_image", file); // backend expects this key
    formData.append("user_id", user.id); // send user id if required

     try {
      const response = await fetch("http://localhost:8000/api/user/upload_profile/", {
        method: "POST",
        body: formData,
        headers: {
          // 'Content-Type' should NOT be set manually when using FormData
          "Authorization": `Bearer ${localStorage.getItem("access_token")}` // if authentication needed
        },
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Image uploaded successfully:", data);
      } else {
        console.error("Upload failed:", data);
        alert("Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Something went wrong while uploading.");
    }

    }
  };

  const loadUserDetails = async () => {
    try{
      const response = await fetch('http://localhost:8000/api/user/user_detail/', {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      const data = await response.json();
      setVoter(data.user);
    } catch (err){
      console.log("error occured: ", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mt-6">
          <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform">
            
              <img
                src={voter.image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            
              <div className="bg-gradient-to-br from-blue-400 to-indigo-600 w-full h-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-4">{voter.username}</h2>
          <p className="text-sm text-gray-500">Voter Profile</p>
        </div>

        {/* User Info */}
        <div className="mt-6 space-y-4">
          {[
            { icon: IdCard, label: "Voter ID", value: voter.voter_id },
            { icon: Mail, label: "Email", value: voter.email },
            { icon: MapPin, label: "Address", value: voter.address },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <item.icon className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-700 font-medium">{item.label}:</span>
              <span className="text-gray-600">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-6">
          <button
            onClick={HandleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-2xl shadow-lg transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
