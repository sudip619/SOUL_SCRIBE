import React, { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import ProfileView from './components/ProfileView';
import MoodTrendsView from './components/MoodTrendsView';
import ChatView from './components/ChatView';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import LiveBackground from './components/LiveBackground';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import toast, { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/LoadingScreen';
import AOS from 'aos';
import 'aos/dist/aos.css';

const showAlert = (message, isSuccess) => {
  if (isSuccess) {
    toast.success(message);
  } else {
    toast.error(message);
  }
};

// This component holds all the app's logic and can access the theme context
const AppContent = () => {
  const { applyTheme } = useTheme();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentView, setCurrentView] = useState('auth');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      document.body.classList.add('animated-gradient-bg');
    } else {
      document.body.classList.remove('animated-gradient-bg');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    if (token && username && userId) {
      setIsLoggedIn(true);
      setCurrentUsername(username);
      setCurrentUserId(userId);
      setCurrentView('home');
    } else {
      setIsLoggedIn(false);
      setCurrentView('auth');
    }
  }, []);

  const handleLoginSuccess = (username, userId) => {
    setIsAuthenticating(true);
    // MODIFIED: Changed duration from 3000ms to 2000ms
    setTimeout(() => {
      setIsLoggedIn(true);
      setCurrentUsername(username);
      setCurrentUserId(userId);
      setCurrentView('home');
      showAlert(`Welcome back, ${username}!`, true);
      setIsAuthenticating(false);
    }, 2000); // 2-second delay
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUsername(null);
    setCurrentUserId(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    showAlert('You have been logged out.', true);
    setCurrentView('auth');
    applyTheme('neutral'); // Resets theme to default
  };

  const handleNavClick = (view) => {
    if (isLoggedIn) {
      setCurrentView(view);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'auth':
        return <AuthForm onLoginSuccess={handleLoginSuccess} showAlert={showAlert} />;
      case 'home':
        return <HomeView />;
      case 'chat':
        return <ChatView showAlert={showAlert} />;
      case 'profile':
        return <ProfileView username={currentUsername} showAlert={showAlert} />;
      case 'moodTrends':
        return <MoodTrendsView showAlert={showAlert} />;
      default:
        return <AuthForm onLoginSuccess={handleLoginSuccess} showAlert={showAlert} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-dark-text-light">
      <svg style={{ display: 'none' }} version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" /><feBlend in="SourceGraphic" in2="goo" /></filter>
        </defs>
      </svg>
      <Toaster position="bottom-left" toastOptions={{ duration: 5000, style: { background: '#363636', color: '#fff' }, success: { duration: 3000 } }} />

      {isAuthenticating && <LoadingScreen />}

      {!isAuthenticating && (
        <>
          <LiveBackground />
          <header className="w-full p-6 flex justify-between items-center relative z-10">
            <h1 className="text-2xl font-bold text-accent-primary" data-aos="fade-right" data-aos-duration="2500">SoulSCRIBE</h1>
            <nav>
              {isLoggedIn && (
                <div className="flex items-center gap-x-6">
                  <button onClick={() => handleNavClick('home')} className="nav-button px-4 py-2 rounded-md">Home</button>
                  <button onClick={() => handleNavClick('chat')} className="nav-button px-4 py-2 rounded-md">Chat</button>
                  <button onClick={() => handleNavClick('profile')} className="nav-button px-4 py-2 rounded-md">Profile</button>
                  <button onClick={() => handleNavClick('moodTrends')} className="nav-button px-4 py-2 rounded-md">Mood Trends</button>
                  <button onClick={handleLogout} className="logout-btn">
                    <div className="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
                    <div className="text">Logout</div>
                  </button>
                </div>
              )}
            </nav>
          </header>
          <main className="flex-grow p-8 relative z-10">
            {isLoggedIn ? (
              <div className="app-shell">
                <Sidebar currentView={currentView} onNavigate={handleNavClick} />
                <div className="app-content">
                  <div className="container-wide glass-panel p-6">{renderView()}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center container-wide glass-panel p-6">{renderView()}</div>
            )}
          </main>
          <footer className="text-dark-text-muted p-4 text-center text-sm relative z-10">
            <p>&copy; 2025 AI Mental Health Chatbot Team. All rights reserved.</p>
          </footer>
        </>
      )}
    </div>
  );
}

// The App component is now just a wrapper for the provider
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
