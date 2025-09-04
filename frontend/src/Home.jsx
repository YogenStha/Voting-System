import React from 'react'; 
import {  FaVoteYea, FaPollH, FaLock } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import chunabe from "./assets/logochunabE.png";
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
    src={chunabe}
    alt="this an image"
    className="w-full max-w-md h-auto mx-auto mb-8"
  />

  <div className="flex flex-col sm:flex-row gap-4">
    <button
      className="bg-blue-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-md hover:bg-blue-700 transition"
      onClick={() => navigate('/result')}
    >
      Result
    </button>
    <button className="bg-blue-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-md hover:bg-blue-700 transition"
    onClick={()=> navigate("/Candidates")}>
      View Candidates
    </button>
  </div>
</section>

        {/* Key Features Section */}
      <section id="features" className="py-12 md:py-16 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-10">
          Features That Make Voting Fun & Easy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <ShieldCheck className="w-10 h-10 text-blue-400" />,
              title: 'End-to-End Encryption',
              desc: 'Your votes are safe with super-strong encryption, keeping everything private!',
              bg: 'bg-blue-100',
              hoverBg: 'hover:bg-pink-200',
            },
            {
              icon: <Lock className="w-10 h-10 text-blue-400" />,
              title: 'Audit Trails',
              desc: 'Every step is tracked clearly, so you can trust the process is fair.',
              bg: 'bg-blue-100',
              hoverBg: 'hover:bg-green-200',
            },
            {
              icon: <Smartphone className="w-10 h-10 text-blue-400" />,
              title: 'Multi-Device Support',
              desc: 'Vote from your phone, tablet, or computer—anytime, anywhere!',
              bg: 'bg-blue-100',
              hoverBg: 'hover:bg-blue-200',
            },
            {
              icon: <Settings className="w-10 h-10 text-blue-400" />,
              title: 'Customizable Ballots',
              desc: 'Create ballots that fit your election, from simple to super unique.',
              bg: 'bg-blue-100',
              hoverBg: 'hover:bg-purple-200',
            },
            {
              icon: <TrendingUp className="w-10 h-10 text-blue-400" />,
              title: 'Real-Time Results',
              desc: 'Watch votes roll in instantly with live updates—exciting!',
              bg: 'bg-blue-100',
              hoverBg: 'hover:bg-yellow-200',
            },
            {
              icon: <Users className="w-10 h-10 text-blue-400" />,
              title: 'Voter Authentication',
              desc: 'Only the right people vote, with easy and secure verification.',
              bg: 'bg-blue-100',
              hoverBg: 'hover:bg-teal-200',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`${feature.bg} ${feature.hoverBg} p-6 rounded-2xl transition-transform duration-300 hover:scale-105 flex items-start space-x-4`}
            >
              {feature.icon}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

      <section id="services" className="flex items-center justify-center bg-white text-black px-4 py-16 md:py-24 rounded-2xl">
  <div className="w-full max-w-6xl">
    {/* Centered Title with Indigo Underline */}
    <h2 className="text-3xl md:text-4xl font-semibold text-center border-b-4 border-gray-800 w-fit mx-auto pb-2 mb-12">
      Our Services
    </h2>

    {/* Services Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Box 1 */}
      <div className="bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
        <FaVoteYea className="w-12 h-12 mx-auto mb-4 text-green-300" />
        <h3 className="text-2xl font-semibold text-white mb-3">Online Elections</h3>
        <p className="text-indigo-100 text-base md:text-lg">
          Send your voters an email with secure, single-use voting links that ensure only authorized voters can vote, once.
        </p>
      </div>

      {/* Box 2 */}
      <div className="bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
        <FaPollH className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
        <h3 className="text-2xl font-semibold text-white mb-3">Online Polls</h3>
        <p className="text-indigo-100 text-base md:text-lg">
          Create a personalized poll that anyone can vote on, and publicize it using your website, email, or social media.
        </p>
      </div>

      {/* Box 3 */}
      <div className="bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
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
      <section className="py-12 md:py-16 bg-gray-100">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-10 text-bold">
      Benefits for Everyone
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* For Organizers */}
      <div className="bg-blue-100 hover:bg-pink-200 p-6 rounded-2xl transition-transform duration-300 hover:scale-105">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <Users className="w-8 h-8 mr-3 text-blue-400" /> For Organizers
        </h3>
        <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
          <li>Save money and simplify election logistics.</li>
          <li>Make setup and management super easy.</li>
          <li>Get real-time results and cool analytics.</li>
          <li>Stay compliant with clear audit trails.</li>
          <li>Reach more voters and boost turnout.</li>
        </ul>
      </div>

      {/* For Voters */}
      <div className="bg-blue-100 hover:bg-green-200 p-6 rounded-2xl transition-transform duration-300 hover:scale-105">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <Smartphone className="w-8 h-8 mr-3 text-blue-400" /> For Voters
        </h3>
        <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
          <li>Vote from anywhere, anytime—easy peasy!</li>
          <li>Enjoy a simple and friendly voting process.</li>
          <li>Trust your vote is safe and anonymous.</li>
          <li>Feel confident your vote matters.</li>
          <li>Skip travel and save time.</li>
        </ul>
      </div>
    </div>
  </div>
</section>
      {/* FAQ Section */}
      <FAQSection/>

      <footer id="contact" className="bg-gray-900 text-white py-6">
  <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Site Description */}
    <section aria-labelledby="footer-branding">
      <h2 id="footer-branding" className="text-lg font-semibold mb-2">Voting Platform</h2>
      <p className="text-xs text-gray-400">Secure and transparent digital voting.</p>
    </section>

    {/* Navigation Links */}
    <nav aria-labelledby="footer-navigation">
      <h2 id="footer-navigation" className="text-base font-medium mb-2">Links</h2>
      <ul className="space-y-1 text-xs text-gray-300">
        {["Home", "About", "FAQ"].map((link) => (
          <li key={link}>
            <a href="/" className="hover:text-blue-400 transition-colors">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    {/* Contact Info */}
    <section aria-labelledby="footer-contact">
      <h2 id="footer-contact" className="text-base font-medium mb-2">Contact</h2>
      <address className="not-italic text-xs text-gray-300 space-y-1">
        <div>
          <a href="mailto:support@vote.com" className="hover:text-blue-400 transition-colors">
            support@vote.com
          </a>
        </div>
        <div>+977-9800000000</div>
      </address>
    </section>

    {/* Social Media */}
    <section aria-labelledby="footer-social">
      <h2 id="footer-social" className="text-base font-medium mb-2">Social</h2>
      <ul className="flex space-x-3 text-xs text-gray-300">
        {["Facebook", "Twitter"].map((platform) => (
          <li key={platform}>
            <a
              href={`https://www.${platform.toLowerCase()}.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              {platform}
            </a>
          </li>
        ))}
      </ul>
    </section>
  </div>

  {/* Copyright */}
  <div className="text-center text-xs text-gray-500 mt-6">
    &copy; 2025 Voting Platform
  </div>
</footer>
    </>
  );
}

export default Home;
