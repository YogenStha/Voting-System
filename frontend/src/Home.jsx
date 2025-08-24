import {  FaVoteYea, FaPollH, FaLock } from "react-icons/fa";
// import logo from './assets/ChunabE.png';
import { useNavigate } from 'react-router-dom'

import { HelpCircle,ShieldCheck, Users, TrendingUp, Settings, BarChart, Smartphone, Lock, Mail } from "lucide-react";
import FAQSection from "./Faq.jsx";
function Home() {
    const navigate = useNavigate()
  return (
    <>
      <section className="bg-white min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center bg-cover">
  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 max-w-3xl">
    Build a Secure Online Election for Free
  </h1>

  <p className="text-base sm:text-lg text-black mb-8 max-w-2xl font-semibold">
    Create an election for your school or organization in seconds. Your voters can vote from any location on any device.
  </p>

  <img
    src="chunabe.png"
    alt="this an image"
    className="w-full max-w-md h-auto mx-auto mb-8"
  />

  <div className="flex flex-col sm:flex-row gap-4">
    <button
      className="bg-blue-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-md hover:bg-blue-700 transition"
      onClick={() => navigate('/voting')}
    >
      Vote
    </button>
    <button className="bg-blue-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-md hover:bg-blue-700 transition">
      View Candidates
    </button>
  </div>
</section>

        {/* Key Features Section */}
      <section id="features" className="py-16 md:py-24 bg-black rounded-2xl shadow-inner">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12">
      Powerful Features for Seamless Elections
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-indigo-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-start space-x-4">
        <ShieldCheck className="w-8 h-8 text-green-300 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">End-to-End Encryption</h3>
          <p className="text-indigo-100">
            Your election data and voter anonymity are protected with state-of-the-art encryption protocols.
          </p>
        </div>
      </div>

      <div className="bg-indigo-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-start space-x-4">
        <Lock className="w-8 h-8 text-yellow-300 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Robust Audit Trails</h3>
          <p className="text-indigo-100">
            Maintain complete transparency with verifiable logs of every action, ensuring election integrity.
          </p>
        </div>
      </div>

      <div className="bg-indigo-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-start space-x-4">
        <Smartphone className="w-8 h-8 text-pink-300 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Multi-Device Compatibility</h3>
          <p className="text-indigo-100">
            Voters can cast their ballots securely from any smartphone, tablet, or computer.
          </p>
        </div>
      </div>

      <div className="bg-indigo-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-start space-x-4">
        <Settings className="w-8 h-8 text-orange-300 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Customizable Ballots</h3>
          <p className="text-indigo-100">
            Design ballots that perfectly match your election's requirements, from simple to complex.
          </p>
        </div>
      </div>

      <div className="bg-indigo-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-start space-x-4">
        <TrendingUp className="w-8 h-8 text-red-300 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Real-Time Results</h3>
          <p className="text-indigo-100">
            Monitor election progress and view results instantly as votes are cast and verified.
          </p>
        </div>
      </div>

      <div className="bg-indigo-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-start space-x-4">
        <Users className="w-8 h-8 text-teal-300 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Flexible Voter Authentication</h3>
          <p className="text-indigo-100">
            Choose from various authentication methods to ensure only eligible voters participate.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

      <section id="services" className="flex items-center justify-center bg-black text-white px-4 py-16 md:py-24 rounded-2xl">
  <div className="w-full max-w-6xl">
    {/* Centered Title with Indigo Underline */}
    <h2 className="text-3xl md:text-4xl font-semibold text-center border-b-4 border-indigo-500 w-fit mx-auto pb-2 mb-12">
      Our Services
    </h2>

    {/* Services Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Box 1 */}
      <div className="bg-indigo-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
        <FaVoteYea className="w-12 h-12 mx-auto mb-4 text-green-300" />
        <h3 className="text-2xl font-semibold text-white mb-3">Online Elections</h3>
        <p className="text-indigo-100 text-base md:text-lg">
          Send your voters an email with secure, single-use voting links that ensure only authorized voters can vote, once.
        </p>
      </div>

      {/* Box 2 */}
      <div className="bg-indigo-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
        <FaPollH className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
        <h3 className="text-2xl font-semibold text-white mb-3">Online Polls</h3>
        <p className="text-indigo-100 text-base md:text-lg">
          Create a personalized poll that anyone can vote on, and publicize it using your website, email, or social media.
        </p>
      </div>

      {/* Box 3 */}
      <div className="bg-indigo-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
        <FaLock className="w-12 h-12 mx-auto mb-4 text-pink-300" />
        <h3 className="text-2xl font-semibold text-white mb-3">Automated Ballot Counts</h3>
        <p className="text-indigo-100 text-base md:text-lg">
          Count ranked ballots that you've already collected (using e.g., paper ballots or your own vote collection software).
        </p>
      </div>
    </div>
  </div>
</section>
    
      
      {/* Benefits for Different Users Section */}
      <section className="py-16 md:py-24 bg-black rounded-2xl shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12">
            Benefits for Everyone Involved
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Organizers */}
            <div className="bg-indigo-600 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Users className="w-8 h-8 mr-3 text-green-300" /> For Organizers
              </h3>
              <ul className="list-disc list-inside text-indigo-100 space-y-2">
                <li>Significantly reduce election costs and logistics.</li>
                <li>Streamline election setup and management.</li>
                <li>Access real-time results and detailed analytics.</li>
                <li>Ensure compliance and maintain audit trails.</li>
                <li>Expand reach and boost voter participation effortlessly.</li>
              </ul>
            </div>

            {/* For Voters */}
            <div className="bg-indigo-600 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Smartphone className="w-8 h-8 mr-3 text-pink-300" /> For Voters
              </h3>
              <ul className="list-disc list-inside text-indigo-100 space-y-2">
                <li>Vote conveniently from anywhere, anytime.</li>
                <li>Experience a simple, intuitive, and accessible voting process.</li>
                <li>Trust in the security and anonymity of their ballot.</li>
                <li>Participate confidently knowing their vote counts.</li>
                <li>Reduce travel and time commitment for voting.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <FAQSection/>

      <footer className="bg-black text-white py-10">
  <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
    
    {/* Site Description */}
    <section aria-labelledby="footer-branding">
      <h2 id="footer-branding" className="text-xl font-bold mb-4">Online Voting System</h2>
      <p className="text-sm text-gray-400">
        A secure, transparent, and efficient digital voting platform for modern organizations.
      </p>
    </section>

    {/* Navigation Links */}
    <nav aria-labelledby="footer-navigation">
      <h2 id="footer-navigation" className="text-lg font-semibold mb-4">Quick Links</h2>
      <ul className="space-y-2 text-sm text-gray-300">
        {["Home", "About", "FAQ", "Login"].map((link) => (
          <li key={link}>
            <a href={`/${link.toLowerCase()}`} className="hover:text-blue-500 transition-colors">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    {/* Contact Info */}
    <section aria-labelledby="footer-contact">
      <h2 id="footer-contact" className="text-lg font-semibold mb-4">Contact</h2>
      <address className="not-italic text-sm text-gray-300 space-y-2">
        <div>
          Email:{" "}
          <a href="mailto:support@vote.com" className="hover:text-blue-500 transition-colors">
            support@vote.com
          </a>
        </div>
        <div>Phone: +977-9800000000</div>
        <div>Address: Mechi Multiple Campus, Birtamode</div>
      </address>
    </section>

    {/* Social Media */}
    <section aria-labelledby="footer-social">
      <h2 id="footer-social" className="text-lg font-semibold mb-4">Follow Us</h2>
      <ul className="flex space-x-4 text-gray-300">
        {["Facebook", "Twitter", "LinkedIn"].map((platform) => (
          <li key={platform}>
            <a
              href={`https://www.${platform.toLowerCase()}.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors"
            >
              {platform}
            </a>
          </li>
        ))}
      </ul>
    </section>
  </div>

  {/* Copyright */}
  <div className="text-center text-sm text-gray-500 mt-10">
    &copy; 2025 Online Voting System. All rights reserved.
  </div>
</footer>
    </>
  );
}

export default Home;
