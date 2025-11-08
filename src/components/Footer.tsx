import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";
import { FaXTwitter, FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import axios from "axios";

interface ContactInfo {
  email?: string;
  phone?: string;
  mailingAddress?: string;
  social?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/contact-info`
        );
        if (res.data?.data?.contactInfo) {
          const { email, phone, mailingAddress, social } =
            res.data.data.contactInfo;
          setContactInfo({ email, phone, mailingAddress, social });
        }
      } catch (error) {
        console.error(" Failed to fetch contact info in footer:", error);
      }
    };

    fetchContactInfo();
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/*  Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="font-heading font-bold text-xl">
                MDS African Journal
              </span>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Advancing scientific knowledge through peer-reviewed research and
              scholarly communication. Our journal publishes high-quality
              research across multiple disciplines.
            </p>

            {/* 🌐 Social Media Icons */}
            <div className="flex space-x-4 mt-4">
              {/* Twitter */}
              <a
                href={contactInfo.social?.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:cursor-pointer"
              >
                <FaXTwitter className="h-5 w-5" />
              </a>

              {/*  Facebook */}
              <a
                href={contactInfo.social?.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:cursor-pointer "
              >
                <FaFacebook className="h-5 w-5" />
              </a>

              {/*  LinkedIn */}
              <a
                href={contactInfo.social?.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:cursor-pointer"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>

              {/* Instagram */}
              <a
                href={contactInfo.social?.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:cursor-pointer"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/*  Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
               <li>
                <Link
                  to="/"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-fast"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-fast"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/journal"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-fast"
                >
                  Journal
                </Link>
              </li>
              <li>
                <Link
                  to="/editorial-board"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-fast"
                >
                  Editorial Board
                </Link>
              </li>
              <li>
                <Link
                  to="/author-page"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-fast"
                >
                  Author Page
                </Link>
              </li>
              <li>
                <Link
                  to="/archive"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-fast"
                >
                  Archive
                </Link>
              </li>
              <li>
                <Link
                  to="/submission"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-fast"
                >
                  Submission
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-fast"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/*  Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>{contactInfo.email || "info@majaed.org"}</span>
              </li>
              <li className="flex items-center space-x-2 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>{contactInfo.phone || "+250 123 456 789"}</span>
              </li>
              <li className="flex items-center space-x-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4" />
                <span>{contactInfo.mailingAddress || "Kigali, Rwanda"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/80">
            © {currentYear} MDS African Journal of Applied Economics and
            Development (MAJAED). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
