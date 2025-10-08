import { Heart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '@/assets/MelitaLogo.png';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import CartButton from '@/components/CartButton';
import { useCart } from '@/contexts/CartContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { state, closeCart } = useCart();

  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  // Load user from localStorage
  useEffect(() => {
    try {
      const u = localStorage.getItem('melita_user');
      setUser(u ? JSON.parse(u) : null);
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  // Listen cross-tab auth changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'melita_user') {
        try {
          const u = localStorage.getItem('melita_user');
          setUser(u ? JSON.parse(u) : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('melita_token');
    localStorage.removeItem('melita_user');
    setUser(null);
    setUserMenuOpen(false);
    if (location.pathname !== '/') navigate('/');
  };

  return (
    <header className={`${isHome ? 'sticky top-0' : ''} relative  bg-white shadow-md z-50  border-b border-[#D4B5A0]/30 py-4 px-4 sm:px-6 backdrop-blur-sm`}>
      {/* Navigation */}
      <nav>
        <div className="max-w-6xl mx-auto px-1 sm:px-3 relative grid grid-cols-3 items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="text-[#835339] focus:outline-none md:hidden justify-self-start p-2"
            aria-label="Toggle Menu"
          >
            {/* Hamburger Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          {/* Left Navigation (desktop) */}
          <div className="hidden md:flex items-center space-x-8 justify-self-start">
            <Link to="/about" className="font-headingOne text-lg text-[#835339] hover:text-[#2C3E50]">
              About Us
            </Link>
            <Link to="/shop" className="font-headingOne text-lg text-[#835339] hover:text-[#2C3E50]">
              Shop
            </Link>
            <Link to="/blog" className="font-headingOne text-lg text-[#835339] hover:text-[#2C3E50]">
              Blog
            </Link>
          </div>

          {/* Logo */}
          <div className="col-start-2 justify-self-center">
            <Link to="/">
              <img className="w-24 sm:w-28 md:w-32" src={logo} alt="logo" />
            </Link>
          </div>

          {/* Right Icons */
          }
          <div className="flex items-center space-x-1 sm:space-x-4 justify-self-end">
            <CartButton className=" h-5 w-5 scale-125 hover:bg-melita-soft-beige text-[#835339] " />
            {/* <div className="hidden md:block">
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="hover:bg-melita-soft-beige">
                  <Heart className="h-6 w-6 scale-125 text-[#835339]" />
                </Button>
              </Link>
            </div> */}
            {user ? (
              <div className="relative">
               <button
  onClick={() => setUserMenuOpen((v) => !v)}
  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-melita-soft-beige text-[#835339]"
  aria-haspopup="menu"
  aria-expanded={userMenuOpen}
>
  <User className="h-5 w-5 scale-125" />
  {/* Hide on mobile, show from md+ */}
  <span className="hidden md:inline font-headingOne max-w-[120px] truncate">
    {user?.name || 'Account'}
  </span>
</button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 bg-white shadow-md rounded-md border border-[#D4B5A0]/40 z-50"
                    role="menu"
                  >
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/dashboard'); }}
                      className="w-full text-left px-3 py-2 hover:bg-melita-soft-beige text-[#835339]"
                      role="menuitem"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 hover:bg-melita-soft-beige text-[#835339] flex items-center gap-2"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)} aria-label="Open login" className="rounded-md hover:bg-melita-soft-beige p-2">
                <User className="h-5 w-5 scale-125 text-[#835339]" />
              </button>
            )}
          </div>
        </div>
        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white shadow-md border-t">
            <div className="flex flex-col px-4 py-2">
              <Link to="/about" className="block py-2 text-[#835339]" onClick={() => setMobileMenuOpen(false)}>
                About Us
              </Link>
              <Link to="/shop" className="block py-2 text-[#835339]" onClick={() => setMobileMenuOpen(false)}>
                Shop
              </Link>
              <Link to="/blog" className="block py-2 text-[#835339]" onClick={() => setMobileMenuOpen(false)}>
                Blog
              </Link>
            </div>
          </div>
        )}
      </nav>
      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          try {
            const u = localStorage.getItem('melita_user');
            setUser(u ? JSON.parse(u) : null);
          } catch {
            setUser(null);
          }
        }}
      />
      <CartDrawer isOpen={state.isOpen} onClose={closeCart} />
    </header>
  );
};

export default Header;