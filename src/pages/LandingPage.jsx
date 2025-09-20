import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import ScrollFloat from '../components/reactBits/ScrollFloat';
import Aurora from '../components/reactBits/Aurora';
import CardSwap, { Card } from '../components/reactBits/CardSwap';
import SplitText from '../components/reactBits/SplitText';

// --- SVG Icon components (enhanced with better styling) ---
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
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const ResourcesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const ForumIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM12 8v4M12 16h.01"></path>
    <path d="M17 11.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z" opacity="0.5"></path>
  </svg>
);

const BookingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// --- Enhanced Header Component ---
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const authLinks = ["About", "Pricing", "Support"];

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/90 backdrop-blur-xl py-2 shadow-xl' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-white bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
          MindEase
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          {authLinks.map(link => (
            <a key={link} href="#" className="text-gray-300 hover:text-teal-400 transition-colors duration-300 font-medium relative group">
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-gray-900/95 shadow-xl backdrop-blur-lg animate-fadeIn">
          <div className="flex flex-col items-center px-6 py-4 space-y-3">
            {authLinks.map(link => (
              <a key={link} href="#" className="block w-full text-center text-gray-300 hover:text-teal-400 py-3 rounded-md transition-colors duration-300 font-medium border-b border-gray-800 last:border-b-0">
                {link}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

// --- Enhanced Hero Component with Mobile-Friendly Card Animation ---
const Hero = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => navigate('/login');
  const handleSignUpClick = () => navigate('/signup');

  const [cardProps, setCardProps] = useState({
    width: 400,
    height: 320,
    cardDistance: 50,
    verticalDistance: 35,
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        setCardProps({
          width: 300,
          height: 240,
          cardDistance: 30,
          verticalDistance: 25,
        });
      } else {
        setCardProps({
          width: 400,
          height: 320,
          cardDistance: 50,
          verticalDistance: 35,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardImages = [
    'https://images.unsplash.com/photo-1593811167562-9cef47bfc5d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1548602088-9d12a4f9c10f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  ];

  return (
    <section className="pt-28 pb-20 md:pt-32 md:pb-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 to-gray-950/90 -z-10"></div>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="text-center md:text-left">
            <span className="text-teal-400 font-semibold bg-teal-400/10 px-4 py-1.5 rounded-full inline-flex items-center text-sm mb-6">
              <div className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></div>
              Support for Students
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-6 leading-tight">
              Feel better, <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">one step</span> at a time
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-lg">
              A gentle mental health companion for students. Access 24/7 chat support, curated resources, peer forums, and counseling bookings — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mb-6">
              <button
                onClick={handleLoginClick}
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3.5 px-8 rounded-full shadow-lg hover:shadow-teal-500/20 hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={handleSignUpClick}
                className="bg-white/10 backdrop-blur-sm text-white font-semibold py-3.5 px-8 rounded-full border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                Create Account
              </button>
            </div>
            <p className="text-gray-400 text-sm flex items-center justify-center md:justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Private and secure — your wellbeing matters.
            </p>
          </div>

          {/* CardSwap only visible on desktop */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-400/20 to-blue-400/20 blur-2xl rounded-3xl -z-10"></div>
              <CardSwap
                width={cardProps.width}
                height={cardProps.height}
                cardDistance={cardProps.cardDistance}
                verticalDistance={cardProps.verticalDistance}
                delay={3000}
                skewAmount={8}
              >
                {cardImages.map((src, index) => (
                  <Card
                    key={index}
                    style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    customClass="shadow-2xl hover:shadow-glow rounded-2xl border border-white/10"
                  />
                ))}
              </CardSwap>
            </div>
          </div>

          {/* Static image for mobile */}
          <div className="md:hidden flex justify-center items-center mt-8">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-400/20 to-blue-400/20 blur-2xl rounded-3xl -z-10"></div>
              <div
                className="w-full h-64 rounded-2xl border border-white/10 shadow-2xl"
                style={{
                  backgroundImage: `url(${cardImages[0]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Enhanced FeatureCard Component ---
const FeatureCard = ({ icon, title, description, index }) => {
  return (
    <div className="group relative bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-lg p-8 rounded-3xl border border-white/10 transition-all duration-500 h-full overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-teal-400/30">
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-blue-400/5 to-purple-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative bg-gradient-to-br from-teal-400/20 to-blue-400/20 p-4 rounded-2xl group-hover:from-teal-400/30 group-hover:to-blue-400/30 transition-all duration-300 shadow-lg">
            {icon}
            <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors duration-300">{title}</h3>
        </div>
        <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Number indicator */}
      <div className="absolute top-4 right-4 text-6xl font-bold text-gray-800/30">{index + 1}</div>
    </div>
  );
};

// --- Enhanced Features Section ---
const Features = () => {
  const featuresData = [
    { icon: <ChatbotIcon />, title: 'Chatbot Support', description: '24/7 supportive conversations with a trained companion to help you navigate tough moments and find clarity.' },
    { icon: <ResourcesIcon />, title: 'Curated Resources', description: 'Expert-vetted self-care materials, mindfulness exercises, and campus-specific help in one organized place.' },
    { icon: <ForumIcon />, title: 'Community Forum', description: 'A safe, moderated peer space to share experiences, ask questions, and find community with others who understand.' },
    { icon: <BookingIcon />, title: 'Easy Booking', description: 'Seamlessly schedule appointments with counselors or peer mentors that fit your academic timetable.' }
  ];

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  return (
    <section className="py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 to-gray-950/90 -z-10"></div>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-teal-400 font-medium text-sm uppercase tracking-wider mb-4 block">Features</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            <SplitText
              text="Everything you need to feel supported"
              className="leading-tight"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              onLetterAnimationComplete={handleAnimationComplete}
            />
          </h2>
          <p className="text-gray-400 text-lg md:text-xl">
            Simple yet powerful tools designed specifically for student mental wellbeing
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Enhanced Footer Component ---
const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-950/50 to-gray-950 border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">MindEase</h3>
            <p className="text-gray-400 max-w-md mb-6">Gentle mental health support for every student, available anytime you need it.</p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200 mb-4 text-lg">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">Accessibility</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">Data Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200 mb-4 text-lg">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a href="mailto:hello@mindease.app" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">hello@mindease.app</a>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <a href="tel:+15550142222" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">+1 (555) 014-2222</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} MindEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// --- Main LandingPage Component ---
export default function LandingPage() {
  return (
    <div className="bg-gray-950 font-sans text-white isolate overflow-x-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full">
        <Aurora
          colorStops={['#0ea5e9', '#0891b2', '#0d9488']}
          amplitude={1.2}
          blend={0.7}
        />
      </div>

      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}