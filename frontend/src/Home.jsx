import {  FaVoteYea, FaPollH, FaLock } from "react-icons/fa";
import logo from './assets/everest.jpg';
import { useNavigate } from 'react-router-dom'

import { HelpCircle,ShieldCheck, Users, TrendingUp, Settings, BarChart, Smartphone, Lock, Mail } from "lucide-react";
function Home() {
    const navigate = useNavigate()
  return (
    <>
      <section className="bg-[#C0C9EE] min-h-screen flex flex-col justify-center items-center px-6 py-16 text-center bg-cover"
      style={{ backgroundImage: `url(${logo})` }}>
        <h1 className="text-5xl font-bold mb-4 max-w-3xl">
          Build a Secure Online Election for Free
        </h1>
        <p className="text-lg text-black mb-8 max-w-2xl font-bold ">
          Create an election for your school or organization in seconds. Your
          voters can vote from any location on any device.
        </p>
        <div>
          <button className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-md hover:bg-blue-700 transition" onClick={() => navigate('/voting')}>
            Vote
          </button>
          <button className="bg-blue-600 text-white font-semibold px-8 py-3 ml-4 rounded-md hover:bg-blue-700 transition">
            view Candidates
          </button>
        </div>
      </section>

        {/* Key Features Section */}
      <section id="features" className="py-16 md:py-24 bg-gray-100 rounded-t-3xl rounded-b-3xl shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">Powerful Features for Seamless Elections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start space-x-4 hover:shadow-lg transition-shadow">
              <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">End-to-End Encryption</h3>
                <p className="text-gray-600">Your election data and voter anonymity are protected with state-of-the-art encryption protocols.</p>
              </div>
            </div>
            {/* Feature Card 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start space-x-4 hover:shadow-lg transition-shadow">
              <Lock className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Robust Audit Trails</h3>
                <p className="text-gray-600">Maintain complete transparency with verifiable logs of every action, ensuring election integrity.</p>
              </div>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start space-x-4 hover:shadow-lg transition-shadow">
              <Smartphone className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Device Compatibility</h3>
                <p className="text-gray-600">Voters can cast their ballots securely from any smartphone, tablet, or computer.</p>
              </div>
            </div>
            {/* Feature Card 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start space-x-4 hover:shadow-lg transition-shadow">
              <Settings className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customizable Ballots</h3>
                <p className="text-gray-600">Design ballots that perfectly match your election's requirements, from simple to complex.</p>
              </div>
            </div>
            {/* Feature Card 5 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start space-x-4 hover:shadow-lg transition-shadow">
              <TrendingUp className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Results</h3>
                <p className="text-gray-600">Monitor election progress and view results instantly as votes are cast and verified.</p>
              </div>
            </div>
            {/* Feature Card 6 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start space-x-4 hover:shadow-lg transition-shadow">
              <Users className="w-8 h-8 text-teal-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Voter Authentication</h3>
                <p className="text-gray-600">Choose from various authentication methods to ensure only eligible voters participate.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-gray-900 text-white px-4 py-16 md:py-24">
        <div className="w-full max-w-6xl">
          {/* Centered Title with Underline */}
          <h2 className="text-3xl md:text-4xl font-semibold text-center border-b-4 border-blue-500 w-fit mx-auto pb-2 mb-12">
            Our Services
          </h2>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Box 1 */}
            <div className="text-center px-4">
              <FaVoteYea className="w-12 h-12 mx-auto mb-3"/>
              <h3 className="text-2xl font-semibold mb-4">Online Elections</h3>
              <p className="text-lg md:text-xl">
                Send your voters an email with secure, single-use voting links
                that ensure only authorized voters can vote, once.
              </p>
            </div>

            {/* Box 2 */}
            <div className="text-center px-4">
              <FaPollH className="w-12 h-12 mx-auto mb-3"/>
              <h3 className="text-2xl font-semibold mb-4">Online Polls</h3>
              <p className="text-lg md:text-xl">
                Create a personalized poll that anyone can vote on, and
                publicize it using your website, email, or social media.
              </p>
            </div>

            {/* Box 3 */}
            <div className="text-center px-4 ">
              <FaLock className="w-12 h-12 mx-auto mb-3"/>
             
              <h3 className="text-2xl font-semibold mb-4">
                Automated Ballot Counts
              </h3>
              <p className="text-lg md:text-xl">
                Count ranked ballots that you've already collected (using e.g.,
                paper ballots or your own vote collection software).
              </p>
            </div>
          </div>
        </div>
      </section>
    
      
      {/* Benefits for Different Users Section */}
      <section className="py-16 md:py-24 bg-gray-100 rounded-t-3xl rounded-b-3xl shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">Benefits for Everyone Involved</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* For Organizers */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                <Users className="w-8 h-8 mr-3" /> For Organizers
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Significantly reduce election costs and logistics.</li>
                <li>Streamline election setup and management.</li>
                <li>Access real-time results and detailed analytics.</li>
                <li>Ensure compliance and maintain audit trails.</li>
                <li>Expand reach and boost voter participation effortlessly.</li>
              </ul>
            </div>
            {/* For Voters */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                <Smartphone className="w-8 h-8 mr-3" /> For Voters
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
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
      <section className="py-16 md:py-24 bg-gray-100 rounded-t-3xl rounded-b-3xl shadow-inner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                <HelpCircle className="w-5 h-5 mr-2 text-indigo-600" /> Is VoteSecure truly secure?
              </h3>
              <p className="text-gray-700">Yes, VoteSecure employs advanced end-to-end encryption, robust authentication methods, and transparent audit trails to ensure the highest level of security and integrity for every election.</p>
            </div>
            {/* FAQ Item 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                <HelpCircle className="w-5 h-5 mr-2 text-indigo-600" /> How does VoteSecure ensure voter anonymity?
              </h3>
              <p className="text-gray-700">Our system is designed to separate voter identity from their ballot, ensuring complete anonymity while maintaining the ability to verify that only eligible voters participate.</p>
            </div>
            {/* FAQ Item 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                <HelpCircle className="w-5 h-5 mr-2 text-indigo-600" /> Can we customize the voting process?
              </h3>
              <p className="text-gray-700">Absolutely! VoteSecure offers extensive customization options for ballot design, voter eligibility, election timelines, and reporting to fit your specific needs.</p>
            </div>
            {/* FAQ Item 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                <HelpCircle className="w-5 h-5 mr-2 text-indigo-600" /> Is technical expertise required to use VoteSecure?
              </h3>
              <p className="text-gray-700">No, VoteSecure is designed with user-friendliness in mind. Our intuitive interface makes it easy for anyone to set up and manage elections, with minimal technical expertise required.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Online Voting System</h4>
              <p className="text-sm text-gray-400">
                A secure, transparent, and efficient digital voting platform for
                modern organizations.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Login
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:support@onlinevote.com"
                    className="hover:text-white"
                  >
                    support@vote.com
                  </a>
                </li>
                <li>Phone: +977-9800000000</li>
                <li>Address: Mechi Multiple Campus, Birtamode</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-400">
                  Facebook
                </a>
                <a href="#" className="hover:text-blue-400">
                  Twitter
                </a>
                <a href="#" className="hover:text-blue-400">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-6">
            &copy; 2025 Online Voting System. All rights reserved.
          </div>
        </footer>
      </section>
    </>
  );
}

export default Home;
