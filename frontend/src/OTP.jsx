import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';

export default function OTPPage() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    let voter_id = sessionStorage.getItem("VoterId");
    let actualOTP = parseInt(sessionStorage.getItem("otp"), 10);

   try{
    const response = await fetch('http://localhost:8000/api/OTP-verify/', {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({
          enteredOTP: otpValue,
          actualOTP: actualOTP,
          voter_id: voter_id,
        }),
    });
    const data = await response.json();

    if(response.ok){

      console.log("data sent: ", data);
      console.log("access: ", data.access);
      console.log("access: ", data.refresh);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      sessionStorage.setItem("user", JSON.stringify(data.user));
      navigate('/dashboard');
    }

   } catch (err){
    console.error("error occured: ", err);
   }
    

    
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          OTP Verification
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 bg-white shadow-lg rounded-xl p-6"
        >
          <p className="text-center text-sm text-gray-600">
            Please enter the 6-digit OTP sent to your email.
          </p>

          <div className="flex justify-between space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                maxLength="1"
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center rounded-md border border-gray-300 text-lg text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
