import React, { useState, useEffect, useRef } from 'react';

// Reusable Icon component placeholder
const Icon = ({ name, className }) => {
  const icons = {
    checkCircle: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    arrowRight: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
    arrowLeft: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
    alertTriangle: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    phone: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81 .7A2 2 0 0 1 22 16.92z"></path></svg>,
    bookOpen: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
  };
  return <div className={className || ''}>{icons[name]}</div>;
};

const surveyQuestions = [
  { text: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?" },
  { text: "Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?" },
  { text: "Over the last 2 weeks, how often have you had little interest or pleasure in doing things?" },
  { text: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?" },
  { text: "Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?" },
  { text: "Over the last 2 weeks, how often have you felt tired or had little energy?" },
  { text: "Over the last 2 weeks, how often have you felt bad about yourself, or that you're a failure?" },
];

const answerOptions = [
  { text: "Not at all", value: 0 },
  { text: "Several days", value: 1 },
  { text: "More than half the days", value: 2 },
  { text: "Nearly every day", value: 3 },
];

const counselors = [
  { id: 1, name: 'Dr. Emily Carter', specialty: 'Anxiety & Stress Management', image: 'https://placehold.co/100x100/E2E8F0/475569?text=EC' },
  { id: 2, name: 'Dr. Alex Ray', specialty: 'Academic & Career Counseling', image: 'https://placehold.co/100x100/E2E8F0/475569?text=AR' }
];

const useFadeIn = (duration = 500) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);
  const style = {
    transition: `opacity ${duration}ms, transform ${duration}ms`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
  };
  return style;
};

export default function WellnessSurveyPage() {
  const [step, setStep] = useState('intro');
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');
  const [bookingDetails, setBookingDetails] = useState({ counselor: null, date: null, time: null });

  const introStyle = useFadeIn();
  const surveyStyle = useFadeIn();
  const resultsStyle = useFadeIn();
  const scheduleStyle = useFadeIn();
  const confirmedStyle = useFadeIn();

  const handleAnswerSelect = (questionIndex, value) => {
    setAnswers({ ...answers, [questionIndex]: value });
    setError('');
  };

  const handleNextQuestion = () => {
    if (answers[currentQuestionIndex] === undefined) {
      setError("Please select an option to continue.");
      return;
    }
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  }

  const calculateResults = () => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    setScore(totalScore);
    setStep('results');
  };

  const resetSurvey = () => {
    setStep('intro');
    setAnswers({});
    setCurrentQuestionIndex(0);
    setScore(0);
    setBookingDetails({ counselor: null, date: null, time: null });
  };

  const getResultContent = () => {
    if (score <= 4) return { title: "Minimal Distress Suggested", message: "Based on your responses, you seem to be managing well.", colorClass: "text-green-500", resources: [{ text: "Explore Mindfulness Exercises", icon: "bookOpen" }] };
    if (score <= 9) return { title: "Mild Distress Suggested", message: "Your responses suggest you may be experiencing some mild emotional challenges.", colorClass: "text-yellow-500", resources: [{ text: "Read Articles on Managing Stress", icon: "bookOpen" }, { text: "Consider a one-time chat with a counselor", icon: "phone", action: 'schedule' }] };
    if (score <= 14) return { title: "Moderate Distress Suggested", message: "It seems like you've been going through a tough time lately. It can be very helpful to talk to someone.", colorClass: "text-orange-500", resources: [{ text: "Strongly Recommended: Schedule a session", icon: "phone", action: 'schedule' }] };
    return { title: "Severe Distress Suggested", message: "Your responses indicate you may be facing significant challenges. Please know that help is available.", colorClass: "text-red-500", resources: [{ text: "Urgent: Contact a Crisis Helpline Immediately", icon: "alertTriangle" }, { text: "Connect with a University Counselor Today", icon: "phone", action: 'schedule' }] };
  };

  const progress = ((currentQuestionIndex + 1) / surveyQuestions.length) * 100;

  const renderIntro = () => (
    <div style={introStyle} className="text-center">
      <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center"><Icon name="checkCircle" className="text-teal-500 w-10 h-10" /></div>
      <h2 className="mt-6 text-3xl font-bold text-gray-800">Your Private Wellness Check-in</h2>
      <p className="mt-3 text-gray-600 max-w-2xl mx-auto">This confidential survey helps you reflect on your emotional well-being. Your answers are for your eyes only.</p>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8 rounded-r-lg text-left max-w-2xl mx-auto">
        <div className="flex"><div className="flex-shrink-0"><Icon name="alertTriangle" className="text-yellow-500 h-5 w-5" /></div><div className="ml-3"><p className="text-sm text-yellow-700">This is not a diagnostic tool. If you are in crisis, please contact a professional immediately.</p></div></div>
      </div>
      <button onClick={() => setStep('survey')} className="mt-8 flex items-center gap-2 mx-auto bg-teal-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 transition-all transform hover:scale-105">Start Check-in <Icon name="arrowRight" /></button>
    </div>
  );

  const renderSurvey = () => (
    <div style={surveyStyle}>
      <div className="mb-6"><span className="text-sm font-semibold text-teal-600">Question {currentQuestionIndex + 1} of {surveyQuestions.length}</span><div className="w-full bg-gray-200 rounded-full h-2.5 mt-2"><div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div></div>
      <div className="bg-white p-8 rounded-xl border shadow-lg">
        <p className="text-xl font-medium text-gray-800 mb-8 min-h-[56px]">{surveyQuestions[currentQuestionIndex].text}</p>
        <div className="space-y-4">
          {answerOptions.map((option) => (<label key={option.value} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestionIndex] === option.value ? 'bg-teal-50 border-teal-500' : 'border-gray-200 hover:border-teal-400'}`}><input type="radio" name={`question-${currentQuestionIndex}`} className="h-5 w-5 text-teal-600" checked={answers[currentQuestionIndex] === option.value} onChange={() => handleAnswerSelect(currentQuestionIndex, option.value)} /><span className="ml-4 text-md text-gray-700 font-medium">{option.text}</span></label>))}
        </div>
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        <div className="mt-8 flex justify-between items-center">
          <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="flex items-center gap-2 text-gray-600 font-semibold px-4 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50"> <Icon name="arrowLeft" /> Back</button>
          <button onClick={handleNextQuestion} className="flex items-center gap-2 bg-teal-500 text-white font-semibold px-5 py-2 rounded-md hover:bg-teal-600"> {currentQuestionIndex < surveyQuestions.length - 1 ? 'Next' : 'Finish & See Results'} <Icon name="arrowRight" /></button>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    const { title, message, resources, colorClass } = getResultContent();
    return (
      <div style={resultsStyle} className="text-center max-w-2xl mx-auto">
        <div className={`mx-auto w-16 h-16 ${colorClass.replace('text', 'bg').replace('-500', '-100')} rounded-full flex items-center justify-center`}><Icon name="checkCircle" className={`${colorClass} w-10 h-10`} /></div>
        <h2 className={`mt-6 text-3xl font-bold ${colorClass}`}>{title}</h2>
        <p className="mt-3 text-gray-600">{message}</p>
        <div className="mt-8 text-left bg-white p-6 rounded-xl border shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-4 text-center">Recommended Next Steps</h3>
          <ul className="space-y-3">
            {resources.map((res, index) => (<li key={index} onClick={() => res.action === 'schedule' && setStep('schedule')} className={`flex items-center p-4 bg-gray-50 rounded-lg ${res.action ? 'hover:bg-teal-50 cursor-pointer' : ''} transition-all`}><Icon name={res.icon} className={`mr-4 ${title.includes("Severe") ? 'text-red-500' : 'text-teal-600'}`} /><span className="text-sm font-medium text-gray-800">{res.text}</span>{res.action && <Icon name="arrowRight" className="ml-auto text-gray-400" />}</li>))}
          </ul>
        </div>
        <button onClick={resetSurvey} className="mt-8 text-sm font-semibold text-gray-600 hover:text-teal-600">Take Again</button>
      </div>
    );
  };

  const renderSchedule = () => {
    const today = new Date();
    const weekDates = Array.from({ length: 5 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i + 1));
    const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"];
    return (
      <div style={scheduleStyle} className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Book a Confidential Session</h2>
        <div className="bg-white p-8 rounded-xl border shadow-lg">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">1. Choose a Counselor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {counselors.map(c => (<div key={c.id} onClick={() => setBookingDetails({ ...bookingDetails, counselor: c })} className={`p-4 border-2 rounded-lg flex items-center gap-4 cursor-pointer ${bookingDetails.counselor?.id === c.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-400'}`}><img src={c.image} alt={c.name} className="w-16 h-16 rounded-full" /><div><h4 className="font-bold text-gray-800">{c.name}</h4><p className="text-sm text-gray-600">{c.specialty}</p></div></div>))}
          </div>
          {bookingDetails.counselor && (<div className="mt-8"><h3 className="font-semibold text-lg text-gray-800 mb-4">2. Select a Date & Time</h3><div className="flex flex-col md:flex-row gap-8"><div className="flex-1"><h4 className="font-medium text-center mb-3">Upcoming Week</h4><div className="grid grid-cols-5 gap-2">{weekDates.map(date => (<button key={date.toISOString()} onClick={() => setBookingDetails({ ...bookingDetails, date: date })} className={`p-2 rounded-lg text-center ${bookingDetails.date?.toDateString() === date.toDateString() ? 'bg-teal-500 text-white' : 'bg-gray-100 hover:bg-teal-100'}`}><p className="font-bold text-sm">{date.toLocaleString('default', { weekday: 'short' })}</p><p className="text-2xl font-light">{date.getDate()}</p></button>))}</div></div>{bookingDetails.date && (<div className="flex-1"><h4 className="font-medium text-center mb-3">Available Slots</h4><div className="grid grid-cols-3 gap-2">{timeSlots.map(time => (<button key={time} onClick={() => setBookingDetails({ ...bookingDetails, time: time })} className={`p-2 rounded-lg ${bookingDetails.time === time ? 'bg-teal-500 text-white' : 'bg-gray-100 hover:bg-teal-100'}`}>{time}</button>))}</div></div>)}</div></div>)}
          <div className="mt-8 pt-6 border-t flex justify-between items-center">
            <button onClick={() => setStep('results')} className="text-gray-600 font-semibold px-4 py-2 rounded-md hover:bg-gray-100">Back to Results</button>
            <button onClick={() => setStep('confirmed')} disabled={!bookingDetails.counselor || !bookingDetails.date || !bookingDetails.time} className="bg-teal-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 disabled:bg-gray-300">Confirm & Proceed</button>
          </div>
        </div>
      </div>
    )
  };

  const renderConfirmation = () => (
    <div style={confirmedStyle} className="text-center max-w-2xl mx-auto">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"><Icon name="checkCircle" className="text-green-500 w-10 h-10" /></div>
      <h2 className="mt-6 text-3xl font-bold text-gray-800">Appointment Confirmed!</h2>
      <p className="mt-3 text-gray-600">A confirmation email has been sent with the details of your session.</p>
      <div className="mt-8 text-left bg-white p-6 rounded-xl border shadow-lg">
        <h3 className="font-semibold text-gray-800 mb-4 text-center">Your Booking Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 bg-gray-50 rounded-md"><span className="font-semibold text-gray-500">Counselor:</span><span className="font-medium text-gray-800">{bookingDetails.counselor?.name}</span></div>
          <div className="flex justify-between p-3 bg-gray-50 rounded-md"><span className="font-semibold text-gray-500">Date:</span><span className="font-medium text-gray-800">{bookingDetails.date?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
          <div className="flex justify-between p-3 bg-gray-50 rounded-md"><span className="font-semibold text-gray-500">Time:</span><span className="font-medium text-gray-800">{bookingDetails.time}</span></div>
        </div>
      </div>
      <button onClick={resetSurvey} className="mt-8 text-sm font-semibold text-gray-600 hover:text-teal-600">Back to Wellness Home</button>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-8">
        {step === 'intro' && renderIntro()}
        {step === 'survey' && renderSurvey()}
        {step === 'results' && renderResults()}
        {step === 'schedule' && renderSchedule()}
        {step === 'confirmed' && renderConfirmation()}
      </div>
    </div>
  );
}

