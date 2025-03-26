import { Routes, Route, useLocation } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import CipherWorkshopPage from './pages/CipherWorkshopPage';
import FloatingActionButton from './components/FloatingActionButton';
import DarkModeToggle from './components/DarkModeToggle';

function App() {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  
  return (
    <div className={`min-h-screen py-12 px-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-[#f9f9f9]'}`}>
      {/* Dark Mode Toggle - visible on all pages */}
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      {/* Main Content */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/workshop" element={<CipherWorkshopPage />} />
      </Routes>
      
      {/* Floating Action Button - only show on home page */}
      {location.pathname === '/' && (
        <FloatingActionButton
          to="/workshop"
          tooltip="Cipher Workshop"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
      )}
      
      <footer className={`mt-12 pt-6 text-sm text-center ${isDarkMode ? 'border-t border-gray-700 text-gray-400' : 'border-t border-gray-200 text-gray-500'}`}>
        <p>© {new Date().getFullYear()} Ciphers by Johann Valenteros and Michael Rodriguez</p>
      </footer>
    </div>
  );
}

export default App;
