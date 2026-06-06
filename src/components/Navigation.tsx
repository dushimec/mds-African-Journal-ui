import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, Mail, Phone, Search } from "lucide-react";
import { FaXTwitter, FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { toast } from "react-toastify";
import axios from "axios";
import { useGlobalSearch } from "./GlobalSearchContext";
import { useScrollDirection } from "@/hooks/useScrollAnimation";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const scrollDirection = useScrollDirection();
  const { searchQuery, setSearchQuery } = useGlobalSearch();
  

  const [contactInfo, setContactInfo] = useState<{
    phone?: string;
    editorEmail?: string;
    social?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  }>({});

  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [journalTitle, setJournalTitle] = useState<string>(
    "MDS African Journal of Applied Economics and Development (MAJAED)"
  );

  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isMenuOpen) {
      setIsNavVisible(true);
    }
  }, [isMenuOpen]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Articles", path: "/journal" },
    { name: "Editorial Board", path: "/editorial-board" },
    { name: "Author Page", path: "/author-page" },
    { name: "Archive", path: "/archive" },
    { name: "Submission", path: "/submission" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close menu and reset search on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    toast.success("Logout successfully");
    navigate("/login");
  };

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/contact-info`);
        if (res.data?.data?.contactInfo) {
          const { editorEmail, phone, social } = res.data.data.contactInfo;
          setContactInfo({ editorEmail, phone, social });
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      }
    };
    fetchContactInfo();
  }, []);

  useEffect(() => {
    const fetchLogoAndTitle = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/logo`);
        if (res.data?.data) {
          setLogoUrl(res.data.data.logoUrl || "/logo.png");
          setJournalTitle(res.data.data.name || journalTitle);
        }
      } catch (error) {
        console.error("Failed to fetch logo/title:", error);
      }
    };
    fetchLogoAndTitle();
  }, []);
  
  return (
    <nav className={`sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft transition-all duration-300 ${!isNavVisible && scrollDirection === 'down' && !isMenuOpen ? '-translate-y-full' : 'translate-y-0'}`}>
      {/* Top Contact + Social - Hidden on xs screens, visible from sm */}
      <div className="hidden xs:block bg-primary text-primary-foreground text-xs sm:text-sm">
        <div className="container mx-auto px-2 xs:px-4 py-1 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1.5 sm:space-y-0">
          <div className="flex flex-col xs:flex-row xs:items-center xs:space-x-2 sm:space-x-4 space-y-1 xs:space-y-0 text-xs xs:text-xs sm:text-sm">
            <a href={`tel:${contactInfo.phone || "+250123456789"}`} className="flex items-center space-x-1 hover:underline truncate">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{contactInfo.phone || "+250 123 456 789"}</span>
            </a>
            <a href={`mailto:${contactInfo.editorEmail || "info@majaed.org"}`} className="flex items-center space-x-1 hover:underline truncate">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{contactInfo.editorEmail || "info@majaed.org"}</span>
            </a>
          </div>

          <div className="flex flex-row space-x-3 justify-start sm:justify-end">
            <a href={contactInfo.social?.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <FaFacebook className="w-3 h-3 xs:w-4 xs:h-4 cursor-pointer" />
            </a>
            <a href={contactInfo.social?.twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <FaXTwitter className="w-3 h-3 xs:w-4 xs:h-4 cursor-pointer" />
            </a>
            <a href={contactInfo.social?.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <FaLinkedin className="w-3 h-3 xs:w-4 xs:h-4 cursor-pointer" />
            </a>
            <a href={contactInfo.social?.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <FaInstagram className="w-3 h-3 xs:w-4 xs:h-4 cursor-pointer" />
            </a>
          </div>
        </div>
      </div>

      {/* Middle Bar - Logo and Search */}
      <div className="container mx-auto px-2 xs:px-4 py-2 xs:py-3 border-b border-border">
        <div className="flex items-center justify-between gap-2 xs:gap-3">
          <Link to="/" className="flex items-center gap-1 xs:gap-2 font-bold text-primary flex-shrink-0">
            <div className="h-12 xs:h-16 sm:h-24 w-12 xs:w-16 sm:w-24">
              <img src={logoUrl} alt="Logo" className="rounded-full object-cover w-full h-full" />
            </div>
            <span className="font-heading text-xs xs:text-sm sm:text-base line-clamp-2 max-w-xs xs:max-w-sm">
              {journalTitle}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 xs:gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  navigate("/search");
                }}
                className="pl-8 w-48 md:w-64"
              />
            </div>
            {isLoggedIn ? (
              <Button variant="default" onClick={handleLogout} className="text-xs sm:text-sm">
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="default" className="text-xs sm:text-sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-background">
        <div className="container mx-auto px-2 xs:px-4">
          <div className="flex items-center justify-between h-12">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth whitespace-nowrap ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden ml-auto h-10 w-10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 animate-scale-in" />
              ) : (
                <Menu className="h-5 w-5 animate-scale-in" />
              )}
            </Button>
          </div>

          {/* Mobile Menu - Animated */}
          {isMenuOpen && (
            <div className="lg:hidden py-3 xs:py-4 border-t border-border animate-slide-in-down">
              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      animation: `slide-in-down 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="mt-3 xs:mt-4 space-y-2 border-t border-border pt-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        navigate("/search");
                      }}
                      className="pl-8 w-full text-sm"
                    />
                  </div>
                  {isLoggedIn ? (
                    <Button
                      className="w-full text-sm"
                      variant="destructive"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  ) : (
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block">
                      <Button className="w-full text-sm">Login</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
