import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Layout/Header';

// Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import RideDetailsPage from './pages/RideDetailsPage';
import PublishPage from './pages/PublishPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

import './App.css';

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/ride/:id" element={<RideDetailsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route
                  path="/publish"
                  element={
                    <ProtectedRoute>
                      <PublishPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
