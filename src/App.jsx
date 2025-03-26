import { Routes, Route, useLocation, Link } from 'react-router-dom'; // Added Link
import { useTheme } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import CipherWorkshopPage from './pages/CipherWorkshopPage';
import DarkModeToggle from './components/DarkModeToggle';

function App() {
  const { isDarkMode } = useTheme();
  const location = useLocation();

  return (
    <div className={`min-h-screen py-12 px-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-[#f9f9f9]'}`}>
      {/* dark mode - visible on all pages */}
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>

      {/* main */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/workshop" element={<CipherWorkshopPage />} />
      </Routes>

      <footer className={`mt-12 pt-6 text-sm text-center ${isDarkMode ? 'border-t border-gray-700 text-gray-400' : 'border-t border-gray-200 text-gray-500'}`}>
        <p>
          © {new Date().getFullYear()} Ciphers by Johann Valenteros and Michael Rodriguez
          {' | '}
          <Link 
            to="/workshop" 
            className="text-inherit hover:text-inherit no-underline hover:no-underline opacity-75 hover:opacity-100 transition-opacity"
          >
            Ciphers
          </Link>
        </p>
      </footer>
    </div>
  );
}

export default App;
