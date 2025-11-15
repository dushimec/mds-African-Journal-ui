import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, Mail, Phone, Search } from "lucide-react";
import { FaXTwitter, FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { toast } from "react-toastify";
import axios from "axios";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Journal", path: "/journal" },
    { name: "Editorial Board", path: "/editorial-board" },
    { name: "Author Page", path: "/author-page" },
    { name: "Archive", path: "/archive" },
    { name: "Submission", path: "/submission" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

 
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, [location]);

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

  useEffect(() => {
    document.title = journalTitle;
  }, [journalTitle]);

  useEffect(() => {
    const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = logoUrl;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = logoUrl;
      document.head.appendChild(newLink);
    }
  }, [logoUrl]);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      {/* Top Contact + Social */}
      <div className="bg-primary text-primary-foreground text-xs md:text-sm">
        <div className="container mx-auto px-4 py-1 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
            <a href={`tel:${contactInfo.phone || "+250123456789"}`} className="flex items-center space-x-1 hover:underline">
              <Phone className="h-3 w-3" />
              <span>{contactInfo.phone || "+250 123 456 789"}</span>
            </a>
            <a href={`mailto:${contactInfo.editorEmail || "info@majaed.org"}`} className="flex items-center space-x-1 hover:underline">
              <Mail className="h-3 w-3" />
              <span>{contactInfo.editorEmail || "info@majaed.org"}</span>
            </a>
          </div>

          <div className="flex flex-row space-x-3 justify-start md:justify-end">
            <a href={contactInfo.social?.facebook} target="_blank" rel="noopener noreferrer">
              <FaFacebook className="w-4 h-4 cursor-pointer" />
            </a>
            <a href={contactInfo.social?.twitter} target="_blank" rel="noopener noreferrer">
              <FaXTwitter className="w-4 h-4 cursor-pointer" />
            </a>
            <a href={contactInfo.social?.linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="w-4 h-4 cursor-pointer" />
            </a>
            <a href={contactInfo.social?.instagram} target="_blank" rel="noopener noreferrer">
              <FaInstagram className="w-4 h-4 cursor-pointer" />
            </a>
          </div>
        </div>
      </div>

      {/* Middle Bar */}
      <div className="container mx-auto px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-primary">
            <div className="h-24 w-24">
              <img src={logoUrl} alt="Logo" className="rounded-full object-cover" />
            </div>
            <span className="font-heading text-base">{journalTitle}</span>
          </Link>

          <div className="hidden md:flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Search..." className="pl-8 w-48 md:w-64" />
            </div>
            {isLoggedIn ? (
              <Button variant="default" onClick={handleLogout}>Logout</Button>
            ) : (
              <Link to="/login"><Button variant="default">Login</Button></Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="mt-4 space-y-2">
                  <Input type="text" placeholder="Search..." />
                  {isLoggedIn ? (
                    <Button className="w-full" variant="destructive" onClick={handleLogout}>Logout</Button>
                  ) : (
                    <Link to="/login"><Button className="w-full">Login</Button></Link>
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
