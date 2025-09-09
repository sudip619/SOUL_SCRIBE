import React, { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import ProfileView from './components/ProfileView';
import MoodTrendsView from './components/MoodTrendsView';
import ChatView from './components/ChatView';
import ProductivityPage from './components/ProductivityPage';
import EmotionalVolatilityPage from './components/EmotionalVolatilityPage';
import ResiliencePage from './components/ResiliencePage';
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
  const [currentView, setCurrentView] = useState('auth');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);

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

  // Ensure the login/auth page uses a static theme that persists after logout
  useEffect(() => {
    if (!isLoggedIn) {
      // Remove any other theme-* classes except theme-login, then add theme-login
      Array.from(document.body.classList).forEach((c) => {
        if (c.startsWith('theme-') && c !== 'theme-login') document.body.classList.remove(c);
      });
      document.body.classList.add('theme-login');
      // Ensure animated background is not active
      document.body.classList.remove('animated-gradient-bg');
    } else {
      // When logged in, remove the static login theme
      document.body.classList.remove('theme-login');
    }

    // Also remove theme-login whenever the current view is not auth
    if (currentView !== 'auth') document.body.classList.remove('theme-login');
  }, [isLoggedIn, currentView]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    if (token && username && userId) {
      setIsLoggedIn(true);
      setCurrentUsername(username);
      setCurrentView('home');
    } else {
      setIsLoggedIn(false);
      setCurrentView('auth');
    }
  }, []);

  const handleLoginSuccess = (username, userId) => {
    // Show the loading screen and wait for user to click "Get Started"
    setPendingAuth({ username, userId });
    setIsAuthenticating(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUsername(null);
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

  // Expose a simple global navigation helper so pages/components can navigate back
  useEffect(() => {
    window.navigateToView = (view) => {
      if (isLoggedIn) setCurrentView(view);
    };
  }, [isLoggedIn]);

  const handleOpenGraphPage = (key) => {
    if (!isLoggedIn) return;
    if (key === 'productivity') setCurrentView('productivity');
    if (key === 'volatility') setCurrentView('volatility');
    if (key === 'resilience') setCurrentView('resilience');
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
        return <MoodTrendsView showAlert={showAlert} onOpenGraph={handleOpenGraphPage} />;
      case 'productivity':
        return <ProductivityPage />;
      case 'volatility':
        return <EmotionalVolatilityPage />;
      case 'resilience':
        return <ResiliencePage />;
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

      {isAuthenticating && (
        <LoadingScreen onContinue={() => {
          const pa = pendingAuth;
          if (!pa) {
            setIsAuthenticating(false);
            return;
          }
          setIsLoggedIn(true);
          setCurrentUsername(pa.username);
          setCurrentView('home');
          showAlert(`Welcome back, ${pa.username}!`, true);
          setIsAuthenticating(false);
          setPendingAuth(null);
        }} />
      )}

      {!isAuthenticating && (
        <>
          <LiveBackground />
          <header className="w-full p-6 flex justify-between items-center relative z-10">
            <h1 className="text-2xl font-bold text-accent-primary" data-aos="fade-right" data-aos-duration="2500">SoulSCRIBE</h1>
          </header>
          <main className="flex-grow p-8 relative z-10">
            {isLoggedIn ? (
              <div className="app-shell">
                <Sidebar currentView={currentView} onNavigate={handleNavClick} onLogout={handleLogout} />
                <div className="app-content">
                  <div className="w-full p-0">{renderView()}</div>
                </div>
              </div>
            ) : (
              <>{renderView()}</>
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
