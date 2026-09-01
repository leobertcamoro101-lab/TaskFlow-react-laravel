import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-violet-400 font-bold text-lg">✅ TaskFlow</Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-400 text-sm hidden sm:block">
                👋 {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30
                           text-red-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login"
                className="bg-gray-800 border border-gray-700 text-gray-300 text-sm
                           px-4 py-2 rounded-xl transition-colors hover:bg-gray-700">
                Login
              </Link>
              <Link to="/register"
                className="bg-violet-500 hover:bg-violet-400 text-white text-sm
                           font-bold px-4 py-2 rounded-xl transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
