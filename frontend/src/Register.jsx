import { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    address: '',
    email: '',
    year: '',
    faculty: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    // TODO: Submit formData to server
    console.log('Registration successful:', formData);
    alert('Registered successfully!');
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
              name="fullName"
              className="w-full mt-1 p-2 border rounded-xl"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Student ID</label>
            <input
              type="text"
              name="studentId"
              className="w-full mt-1 p-2 border rounded-xl"
              required
              value={formData.studentId}
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
              name="contact"
              className="w-full mt-1 p-2 border rounded-xl"
              value={formData.contact}
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
