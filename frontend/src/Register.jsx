import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storePrivateKey } from './hooks/secureDB';;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    student_id: '',
    address: '',
    email: '',
    year: '',
    faculty: '',
    contact_number: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData((formData) => ({
      ...formData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('Submit clicked, sending data:', formData);
    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        
        navigate('/login');
      } else {
        alert("Error: " + JSON.stringify(data));
      }

      const private_key = data.private_key; // yo private key lai Indexed DB ma store gara hai
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

    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again. " + error.message);
    }


  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center mt-10">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Student Registration</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Full Name</label>
            <input
              type="text"
              name="username"
              className="w-full mt-1 p-2 border rounded-xl"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Student ID</label>
            <input
              type="text"
              name="student_id"
              className="w-full mt-1 p-2 border rounded-xl"
              required
              value={formData.student_id}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Address</label>
            <input
              type="text"
              name="address"
              className="w-full mt-1 p-2 border rounded-xl"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full mt-1 p-2 border rounded-xl"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium">Year</label>
              <select
                name="year"
                className="w-full mt-1 p-2 border rounded-xl"
                value={formData.year}
                onChange={handleChange}
              >
                <option value="">Select Year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Faculty</label>
              <select
                name="faculty"
                className="w-full mt-1 p-2 border rounded-xl"
                value={formData.faculty}
                onChange={handleChange}
              >
                <option value="">Select Faculty</option>
                <option>BSc CSIT</option>
                <option>BCA</option>
                <option>BIT</option>
                <option>BBA</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Contact No</label>
            <input
              type="tel"
              name="contact_number"
              className="w-full mt-1 p-2 border rounded-xl"
              value={formData.contact_number}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium">Create Password</label>
              <input
                type="password"
                name="password"
                className="w-full mt-1 p-2 border rounded-xl"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="w-full mt-1 p-2 border rounded-xl"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
