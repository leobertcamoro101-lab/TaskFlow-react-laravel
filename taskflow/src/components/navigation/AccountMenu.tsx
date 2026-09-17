import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

import Avatar from '../Avatar';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

function AccountMenu() {
	const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const linkClasses =
    'w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline';
  // commented because the Avatar component has fall-back initials
	// const initials =
  //   `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() ||
  //   user?.name?.[0]?.toUpperCase() ||
  //   "?";
	return (
		<div className="relative " ref={menuRef}>
      <button
        onClick={() => setMenuOpen((open) => !open)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Account menu"
      >
        <div className="w-8 h-8">
          <Avatar image={user?.avatar_url} name={user?.name} alt="Profile" width="32px" />
        </div>
        {/* commented because the Avatar component has fall-back initials*/}
				{/* {user?.avatar_url ? (
					<div className="w-8 h-8">
						<Avatar image={user.avatar_url} alt="Profile" width="32px" />
					</div>
				) : (
					<div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
						<span className="text-xs font-bold text-violet-300">{initials}</span>
					</div>
				)} */}
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {menuOpen && (
        <div className="absolute left-0 top-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
          <Link to="/profile" onClick={() => setMenuOpen(false)} className={linkClasses}>
            <User size={16} /> Profile
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
            aria-label="Logout"
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
	);
}

export default AccountMenu;