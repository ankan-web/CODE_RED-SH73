import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

// SVG Icon Components (to keep everything in one file)
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChatbotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const ResourcesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const ForumIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM12 8v4M12 16h.01"></path>
    <path d="M17 11.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z" opacity="0.5"></path>
  </svg>
);

const BookingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);


// Header Component
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = ["Home", "Resources", "Chatbot", "Forum", "Dashboard"];
  const authLinks = ["About", "Pricing", "Support"];

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800">
          StudentCare
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          {authLinks.map(link => (
            <a key={link} href="#" className="text-gray-600 hover:text-teal-600 transition-colors">{link}</a>
          ))}
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 focus:outline-none">
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="flex flex-col items-center px-6 py-4 space-y-4">
            {authLinks.map(link => (
              <a key={link} href="#" className="block w-full text-center text-gray-600 hover:text-teal-600 py-2 rounded-md transition-colors">{link}</a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

// Hero Component
const Hero = () => {
  const navigate = useNavigate();
  const handleLoginClick=()=>{
    navigate('/login')
  }
  const handleSignUpClick=()=>{
    navigate('/signup')
  }

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <span className="text-teal-600 font-semibold">Support for Students</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-6 leading-tight">
              Feel better, one step at a time
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              A gentle mental health companion for students. Access 24/7 chat support, curated resources, peer forums, and counseling bookings — all in one place.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <button
                onClick={handleLoginClick}
                className="bg-teal-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-teal-600 transition-all duration-300 transform hover:scale-105"
              >
                Login
              </button>

              <button
                onClick={handleSignUpClick}
                className="bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-full hover:bg-gray-300 transition-all duration-300"
              >
                Signup
              </button>

            </div>
            <p className="text-gray-500 text-sm mt-4">
              Private and secure — your wellbeing matters.
            </p>
          </div>
          <div>
            <img
              src="mind-calm.png"
              alt="Student studying peacefully outdoors"
              className="rounded-3xl shadow-2xl w-full h-auto object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/a7f3d0/334155?text=StudentCare'; }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// FeatureCard Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-teal-100 p-3 rounded-full">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
};


// Features Section Component
const Features = () => {
  const featuresData = [
    {
      icon: <ChatbotIcon />,
      title: 'Chatbot',
      description: '24/7 supportive conversations with a trained companion to help you navigate tough moments.'
    },
    {
      icon: <ResourcesIcon />,
      title: 'Resources',
      description: 'Curated self-care reads, exercises, and campus-specific help in one easy place.'
    },
    {
      icon: <ForumIcon />,
      title: 'Forum',
      description: 'A moderated peer space to share experiences, ask questions, and find community.'
    },
    {
      icon: <BookingIcon />,
      title: 'Booking',
      description: 'Easily schedule time with counselors or peer mentors that fit your timetable.'
    }
  ];

  return (
    <section className="bg-teal-50/50 py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Everything you need to feel supported
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Simple tools designed for student wellbeing
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map(feature => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};


// Footer Component
const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Column 1: Brand */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">StudentCare</h3>
            <p className="text-gray-500">Gentle support for every student, anytime.</p>
            <p className="text-gray-400 mt-4 text-sm">&copy; {new Date().getFullYear()} StudentCare. All rights reserved.</p>
          </div>
          {/* Column 2: Links */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-teal-600">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-teal-600">Terms of Service</a></li>
              <li><a href="#" className="text-gray-500 hover:text-teal-600">Accessibility</a></li>
            </ul>
          </div>
          {/* Column 3: Contact */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-4">Contact</h4>
            <ul className="space-y-2">
              <li><a href="mailto:hello@studentcare.app" className="text-gray-500 hover:text-teal-600">hello@studentcare.app</a></li>
              <li><a href="tel:+15550142222" className="text-gray-500 hover:text-teal-600">+1 (555) 014-2222</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};


// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="bg-white font-sans text-gray-800">
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}