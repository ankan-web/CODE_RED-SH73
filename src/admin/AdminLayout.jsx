import React, { useEffect, useRef, useState, Fragment } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

// --- MOCK AI SERVICE ---
// This service simulates API calls to a backend. In a real app, these would be
// fetch requests to endpoints powered by a service like the Google Gemini API.
const aiService = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  chat: async function (message) {
    console.log(`Sending to /chat: ${message}`);
    await this.delay(1000); // Simulate network latency
    return "This is a mock reply from the AI service. Connection successful!";
  },

  generateSummary: async function (title) {
    await this.delay(1500);
    return `This is an AI-generated summary for the resource about "${title}". Key takeaways include focusing on practical tips and understanding core concepts for better well-being.`;
  },

  translate: async function (text, language) {
    await this.delay(1000);
    switch (language) {
      case 'Hindi':
        return `(Hindi) ${text}`;
      case 'Bengali':
        return `(Bengali) ${text}`;
      case 'Tamil':
        return `(Tamil) ${text}`;
      default:
        return text;
    }
  },

  moderate: async function (postText) {
    await this.delay(800);
    const hasBadWord = postText.toLowerCase().includes("bad word");
    return {
      isFlagged: hasBadWord,
      reason: hasBadWord ? "Contains inappropriate language." : "Content seems OK.",
      confidence: hasBadWord ? 0.95 : 0.1,
    };
  }
};


// --- REUSABLE UI COMPONENTS ---

const Icon = ({ name, className }) => {
  const icons = {
    shield: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><path d="M12 7h.01" /></svg>,
    analytics: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    resources: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
    forum: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    bookings: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m14 14-2 2-2-2" /></svg>,
    chevronDown: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
    chevronUp: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>,
    arrowUp: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>,
    article: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z" /><path d="M16 2v10l-4-3-4 3V2" /></svg>,
    video: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="6" width="14" height="12" rx="2" ry="2" /></svg>,
    chatbot: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    send: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
    chevronLeft: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>,
    chevronRight: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>,
  };
  return <div className={className || ''}>{icons[name]}</div>;
};

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className || ''}`}> {children} </div>
);

const PageHeader = ({ title, actions }) => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
    {actions && <div className="flex items-center space-x-2">{actions}</div>}
  </header>
);

// --- CHART COMPONENTS ---
const chartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#e5e7eb', borderDash: [2, 4], drawBorder: false },
      ticks: { color: '#6b7280', font: { family: 'Inter, sans-serif' } }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#6b7280', font: { family: 'Inter, sans-serif' } }
    }
  },
  interaction: { intersect: false, mode: 'index' },
};

const ChartComponent = ({ type, data, options }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    const chart = new Chart(chartRef.current, { type, data, options });
    return () => chart.destroy();
  }, [type, data, options]);
  return <canvas ref={chartRef}></canvas>;
};


// --- PAGE COMPONENTS ---

const AnalyticsPage = () => {
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{ data: [65, 59, 80, 81, 56, 55, 40], fill: false, borderColor: '#14b8a6', tension: 0.4, pointBackgroundColor: '#14b8a6', pointRadius: 4 }]
  };
  const chatbotUsageData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [120, 200, 150, 80, 70, 110, 130], backgroundColor: '#a7f3d0', borderColor: '#10b981', borderWidth: 1, borderRadius: 4 }]
  };
  const forumActivityData = (canvas) => {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(20, 184, 166, 0.3)');
    gradient.addColorStop(1, 'rgba(20, 184, 166, 0)');
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
      datasets: [{ data: [200, 250, 220, 300, 280, 350, 320, 400], backgroundColor: gradient, borderColor: '#14b8a6', borderWidth: 2, fill: true, tension: 0.4 }]
    };
  };

  return (
    <div>
      <PageHeader title="Analytics" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card><p className="text-sm text-gray-500">Total users</p><p className="text-3xl font-bold text-gray-800 mt-1">12,480</p><div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600"><Icon name="arrowUp" /><span>+4.2%</span></div></Card>
        <Card><p className="text-sm text-gray-500">Active today</p><p className="text-3xl font-bold text-gray-800 mt-1">1,236</p><div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600"><Icon name="arrowUp" /><span>+2.1%</span></div></Card>
        <Card><p className="text-sm text-gray-500">Sessions booked</p><p className="text-3xl font-bold text-gray-800 mt-1">842</p><div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600"><Icon name="arrowUp" /><span>+6.7%</span></div></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card><h3 className="font-semibold text-gray-800 mb-4">User Growth</h3><div className="h-64"><ChartComponent type="line" data={userGrowthData} options={chartOptions} /></div></Card>
        <Card><h3 className="font-semibold text-gray-800 mb-4">Chatbot Usage</h3><div className="h-64"><ChartComponent type="bar" data={chatbotUsageData} options={chartOptions} /></div></Card>
      </div>
      <Card><h3 className="font-semibold text-gray-800 mb-4">Forum Activity</h3><div className="h-80"><ChartComponent type="line" data={forumActivityData(document.createElement('canvas'))} options={chartOptions} /></div></Card>
    </div>
  );
};

const UsersPage = () => {
  const users = [
    { id: 1, name: 'John Doe', avatar: 'JD', email: 'john.doe@example.com', joinDate: 'Aug 15, 2025', status: 'Active' },
    { id: 2, name: 'Jane Smith', avatar: 'JS', email: 'jane.smith@example.com', joinDate: 'Jul 22, 2025', status: 'Suspended' },
    { id: 3, name: 'Mike Johnson', avatar: 'MJ', email: 'mike.johnson@example.com', joinDate: 'Jul 20, 2025', status: 'Active' },
  ];

  return (
    <div>
      <PageHeader title="User Management" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center"><img className="w-8 h-8 rounded-full mr-3" src={`https://placehold.co/40x40/E2E8F0/475569?text=${user.avatar}`} alt="Avatar" />{user.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span></td>
                                    <td className="px-6 py-4 text-right"><button className="font-medium text-teal-600 hover:underline">Edit</button></td>
                                </tr>
                            ))}
          </tbody>
        </table>
    </div>
            </Card >
        </div >
    );
};

const ResourcesPage = () => {
  const [expandedRow, setExpandedRow] = useState(1);
  const [summaries, setSummaries] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  const handleRowClick = (id) => setExpandedRow(expandedRow === id ? null : id);

  const handleGenerateSummary = async (resourceId, resourceTitle) => {
    setLoadingStates(prev => ({ ...prev, [resourceId]: true }));
    const summary = await aiService.generateSummary(resourceTitle);
    setSummaries(prev => ({ ...prev, [resourceId]: { original: summary, translated: null, lang: 'en' } }));
    setLoadingStates(prev => ({ ...prev, [resourceId]: false }));
  };

  const handleTranslate = async (resourceId, language) => {
    if (!language || !summaries[resourceId]?.original) return;
    if (language === 'en') {
      setSummaries(prev => ({ ...prev, [resourceId]: { ...prev[resourceId], translated: null, lang: 'en' } }));
      return;
    }
    setLoadingStates(prev => ({ ...prev, [`translate-${resourceId}`]: true }));
    const translatedSummary = await aiService.translate(summaries[resourceId].original, language);
    setSummaries(prev => ({ ...prev, [resourceId]: { ...prev[resourceId], translated: translatedSummary, lang: language } }));
    setLoadingStates(prev => ({ ...prev, [`translate-${resourceId}`]: false }));
  };

  const resources = [
    { id: 1, title: 'Managing Stress and Anxiety', links: [{ type: 'Article', title: 'APA - Healthy ways to handle stress', url: 'https://www.apa.org/topics/stress/tips' }, { type: 'Video', title: 'TED: How to make stress your friend', url: 'https://www.youtube.com/watch?v=RcGyVTAoXEU' }] },
    { id: 2, title: 'Tips for Better Sleep', links: [{ type: 'Article', title: 'Mayo Clinic - 6 steps to better sleep', url: 'https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/sleep/art-20048379' }, { type: 'Article', title: 'Sleep Foundation - Sleep Hygiene', url: 'https://www.sleepfoundation.org/sleep-hygiene' }] },
    { id: 3, title: 'Introduction to Mindfulness', links: [{ type: 'Article', title: 'Mindful.org - What is Mindfulness?', url: 'https://www.mindful.org/what-is-mindfulness/' }, { type: 'Video', title: 'TED: All it takes is 10 mindful minutes', url: 'https://www.youtube.com/watch?v=cal_SOwGz-g' }] },
    { id: 4, title: 'Healthy Eating on a Budget', links: [{ type: 'Article', title: 'Budget Bytes - Pantry Staples', url: 'https://www.budgetbytes.com/stock-your-kitchen-pantry-staples/' }, { type: 'Video', title: 'Goodful - 5 Healthy Meals For $25', url: 'https://www.youtube.com/watch?v=q2_ZG-zNBrE' }] },
  ];

  return (
    <div>
      <PageHeader title="Resource Hub" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50"><tr><th className="px-6 py-3">Topic</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {resources.map(resource => {
                const summaryData = summaries[resource.id];
                const isLoadingSummary = loadingStates[resource.id];
                const isLoadingTranslation = loadingStates[`translate-${resource.id}`];
              return (
              <Fragment key={resource.id}>
                <tr onClick={() => handleRowClick(resource.id)} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 font-medium text-gray-900"><div className="flex items-center justify-between"><span>{resource.title}</span><Icon name={expandedRow === resource.id ? 'chevronUp' : 'chevronDown'} className="text-gray-500 ml-4" /></div></td>
                  <td className="px-6 py-4 text-right"><button onClick={(e) => { e.stopPropagation(); handleRowClick(resource.id); }} className="font-medium text-teal-600 hover:underline">Details</button></td>
                </tr>
                {expandedRow === resource.id && (
                  <tr className="bg-gray-50 border-b"><td colSpan="2" className="px-6 py-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Associated Media</h4>
                          <ul className="space-y-2">{resource.links.map((link, index) => (<li key={index} className="text-sm flex items-center gap-3"><Icon name={link.type.toLowerCase()} className="text-gray-500 flex-shrink-0" /><div><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{link.title}</a></div></li>))}</ul>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-gray-200 pl-0 md:pl-6 pt-4 md:pt-0">
                      <h4 className="font-semibold text-gray-700 mb-3">AI Services</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">AI Summary</h5>
                          <div className="p-3 bg-white rounded-md border border-gray-200 text-xs text-gray-600 min-h-[80px]">{isLoadingSummary ? "Generating..." : (summaryData?.translated || summaryData?.original || <span className="italic text-gray-400">Click 'Generate' to see an AI overview.</span>)}</div>
                          <button onClick={() => handleGenerateSummary(resource.id, resource.title)} disabled={isLoadingSummary} className="mt-2 text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-1 rounded hover:bg-teal-200 disabled:bg-gray-200 disabled:text-gray-500"> {isLoadingSummary ? 'Generating...' : summaryData ? 'Regenerate' : 'Generate'}</button>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Translation</h5>
                          <select onChange={(e) => handleTranslate(resource.id, e.target.value)} disabled={!summaryData || isLoadingTranslation} className="text-xs border border-gray-300 rounded p-1 w-full disabled:bg-gray-100" value={summaryData?.lang || 'en'}>
                            <option value="en">English (Original)</option><option value="Hindi">Hindi</option><option value="Bengali">Bengali</option><option value="Tamil">Tamil</option>
                          </select>
                          {isLoadingTranslation && <p className="text-xs text-gray-500 mt-1">Translating...</p>}
                        </div>
                      </div>
                    </div>
                  </div></td></tr>)}
              </Fragment>
                            )})}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const ForumPage = () => {
  const initialReports = [
    { id: 1, item: 'Re: Final exam study group', content: 'Does anyone want to form a study group? We can meet at the library. Or we can just create a bad word group chat.', by: 'Emily Carter', reason: 'Spam', status: 'Open', aiStatus: null, isAnalyzing: false },
    { id: 2, item: 'Post: "Need advice on dorm life"', content: 'My roommate is driving me crazy. I need some advice on how to handle this without starting a fight.', by: 'Mark Johnson', reason: 'Harassment', status: 'Resolved', aiStatus: { isFlagged: false, reason: 'Content seems OK.' }, isAnalyzing: false },
  ];

  const [reports, setReports] = useState(initialReports);

  const handleAnalyze = async (reportId) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, isAnalyzing: true } : r));
    const report = reports.find(r => r.id === reportId);
    const result = await aiService.moderate(report.content);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, aiStatus: result, isAnalyzing: false } : r));
  };

  return (
    <div>
      <PageHeader title="Forum Management" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Reported Item</th>
                <th scope="col" className="px-6 py-3">Reported By</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">AI Analysis</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                                <tr key={report.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate"><p className="font-semibold">{report.item}</p><p className="text-xs text-gray-500 italic mt-1">"{report.content}"</p></td>
                                    <td className="px-6 py-4 text-gray-600">{report.by}</td>
                                    <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${report.status === 'Open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{report.status}</span></td>
                                    <td className="px-6 py-4">
                                        {report.isAnalyzing ? <span className="text-sm text-gray-500">Analyzing...</span> : report.aiStatus ? <span className={`text-sm ${report.aiStatus.isFlagged ? 'text-red-600 font-bold' : 'text-green-600'}`}>{report.aiStatus.isFlagged ? 'Flagged' : 'Looks OK'}</span> : <span className="text-sm text-gray-400">Not analyzed</span>}
            </td>
            <td className="px-6 py-4 text-right space-x-2">
              {report.status === 'Open' && (<button onClick={() => handleAnalyze(report.id)} disabled={report.isAnalyzing} className="font-medium text-blue-600 hover:underline disabled:text-gray-400">Analyze</button>)}
              <button className="font-medium text-teal-600 hover:underline">View</button>
            </td>
          </tr>
                            ))}
        </tbody>
      </table>
    </div>
            </Card >
        </div >
    );
};

const BookingsPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 12));
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const bookings = {
    12: [{ time: '10:00 AM', title: 'Academic Counseling', with: 'Alex Ray' }, { time: '1:30 PM', title: 'Support Group', with: 'Student Services' }],
    18: [{ time: '11:00 AM', title: 'Career Advising', with: 'Jane Smith' }],
  };

  const handleMonthChange = (offset) => {
    setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + offset)));
  };

  return (
        <div>
            <PageHeader title="Booking Management" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleMonthChange(-1)} className="p-1 rounded-full hover:bg-gray-100"><Icon name="chevronLeft" /></button>
                            <button onClick={() => handleMonthChange(1)} className="p-1 rounded-full hover:bg-gray-100"><Icon name="chevronRight" /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-gray-500 font-medium p-2">{day}</div>)}
                        {calendarDays.map((day, index) => (
                            <div key={index} className="relative">
                                <button onClick={() => day && setSelectedDay(day)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors mx-auto ${day === null ? 'cursor-default' : selectedDay === day ? 'bg-teal-500 text-white font-semibold' : 'hover:bg-teal-100'}`} disabled={!day}>{day}</button>
                                {day && bookings[day] && (<div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full"></div>)}
                            </div>
                        ))}
                    </div>
                </Card>
                <Card>
                    <h3 className="font-semibold text-gray-800 p-4 border-b">Upcoming - {currentDate.toLocaleString('default', { month: 'short' })} {selectedDay}</h3>
                    <div className="p-4 space-y-4">
                       {bookings[selectedDay] ? bookings[selectedDay].map((booking, i) => (
                           <div key={i} className="flex space-x-3">
                                <div className="w-16 h-12 flex-shrink-0 rounded-lg bg-teal-100 text-teal-600 flex flex-col items-center justify-center text-sm font-semibold"><span>{booking.time.split(' ')[0]}</span><span className="text-xs">{booking.time.split(' ')[1]}</span></div>
                                <div><p className="font-medium text-sm">{booking.title}</p><p className="text-xs text-gray-500">With {booking.with}</p></div>
                            </div>
                       )) : <p className="text-sm text-gray-500 p-4 text-center">No bookings for this day.</p>}
                    </div>
                </Card>
            </div >
        </div >
    );
};

const ChatbotWidget = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hello! I am the StudentCare AI assistant. How can I help you today?' }]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage === '') return;

    const userMessage = { from: 'user', text: trimmedMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    setTimeout(() => {
      const botResponse = { from: 'bot', text: 'This is a demo. In a real app, I would provide a helpful response!' };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-24 right-8 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in-up">
      <header className="bg-teal-500 text-white p-3 flex justify-between items-center rounded-t-lg"><h3 className="font-semibold text-sm">StudentCare AI</h3><button onClick={onClose} className="text-white hover:text-teal-100 text-2xl leading-none">&times;</button></header>
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto text-sm space-y-3">
        {messages.map((msg, index) => (<div key={index} className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}><p className={`max-w-xs p-2 rounded-lg ${msg.from === 'bot' ? 'bg-gray-200 text-gray-800' : 'bg-teal-500 text-white'}`}>{msg.text}</p></div>))}
      </div>
      <div className="p-2 border-t"><form onSubmit={handleSendMessage} className="flex space-x-2"><input type="text" placeholder="Type your message..." className="flex-grow text-sm p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} /><button type="submit" className="flex-shrink-0 bg-teal-500 text-white p-2 rounded-md hover:bg-teal-600 flex items-center justify-center" aria-label="Send message"><Icon name="send" /></button></form></div>
    </div>
    );
};

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { id: 'analytics', path: '/analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'users', path: '/users', label: 'Users', icon: 'users' },
    { id: 'resources', path: '/resources', label: 'Resources', icon: 'resources' },
    { id: 'forum', path: '/forum', label: 'Forum', icon: 'forum' },
    { id: 'bookings', path: '/bookings', label: 'Bookings', icon: 'bookings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex md:flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Icon name="shield" className="text-teal-500 w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-800">StudentCare</h1>
        </div>
      </div>
      <nav className="mt-6 flex-1">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <Link to={item.path} className={`flex items-center px-6 py-3 mx-4 rounded-lg transition-colors duration-200 ${location.pathname === item.path ? 'bg-teal-50 text-teal-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Icon name={item.icon} className="mr-3" />
              {item.label}
            </Link>
                        </li>
                    ))}
      </ul>
    </nav>
        </aside >
    );
};

export default function App() {
  const [isChatVisible, setChatVisible] = useState(false);
  return (
    <Router>
      <div className="flex min-h-screen font-sans bg-gray-50 text-gray-800">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/analytics" replace />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
            </Routes>
          </div>
        </main>
        <ChatbotWidget isVisible={isChatVisible} onClose={() => setChatVisible(false)} />
        <button onClick={() => setChatVisible(!isChatVisible)} className="fixed bottom-5 right-5 bg-teal-500 text-white p-3 rounded-full shadow-lg hover:bg-teal-600 transition-transform transform hover:scale-110 z-50" aria-label="Toggle Chatbot">
          <Icon name="chatbot" />
        </button>
      </div>
    </Router>
  );
}