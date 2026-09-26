import { Link} from 'react-router-dom';
import AccountMenu from './AccountMenu';

const Navbar = () => {
  
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-[#E9E0CF] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-[#B8862E] font-bold text-lg">TaskFlow</Link>
        <div className="flex items-center gap-4">
              
              <AccountMenu/>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
