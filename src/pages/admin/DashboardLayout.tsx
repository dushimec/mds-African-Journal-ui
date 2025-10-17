// src/layouts/DashboardLayout.tsx
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Menu,
  LogOut,
  X,
  Home,
  FileText,
  Users,
  Book,
  Award,
  BookOpen,
  Mail,
  BadgeInfo,
  Rss,
  Plus,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const navigate = useNavigate();

 const handleLogOut = async () => {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.warn("No token found");
      navigate("/login");
      return;
    }

    await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.removeItem("access_token");
    navigate("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    localStorage.removeItem("access_token");
    navigate("/login");
  }
};


  const menus = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    {
      name: "Submissions",
      path: "/dashboard/submissions",
      icon: <FileText size={18} />,
    },
    { name: "Users", path: "/dashboard/users", icon: <Users size={18} /> },
    {
      name: "Editorial Board",
      path: "/dashboard/upload-member",
      icon: <Award size={18} />,
    },
    {
      name: "Archive",
      path: "/dashboard/issues",
      icon: <BookOpen size={18} />,
    },
    { name: "FAQ", path: "/dashboard/add-faq", icon: <BookOpen size={18} /> },
    {
      name: "Messages",
      path: "/dashboard/contact-msg",
      icon: <Mail size={18} />,
    },
    {
      name: "About Content",
      path: "/dashboard/add-about",
      icon: <BadgeInfo size={18} />,
    },
    {
      name: "View Newslater",
      path: "/dashboard/view-newsletter",
      icon: <Rss size={18} />,
    },
    {
      name: "Add Topic",
      path: "/dashboard/add-topic",
      icon: <Plus size={18} />,
    },
    {
      name: "Contact Info",
      path: "/dashboard/contact-info",
      icon: <Plus size={18} />,
    },
  ];

  return (
    <aside
      className={`bg-blue-900 text-white w-64 h-screen flex flex-col justify-between fixed top-0 p-6 transition-transform duration-300 z-40 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div>
        <div className="flex justify-between items-center mb-12">
          <span className="text-3xl font-bold tracking-tight">MDS</span>
          <button className="md:hidden" onClick={toggle}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col gap-3">
          {menus.map((m) => (
            <button
              key={m.name}
              onClick={() => navigate(m.path)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-900"
            >
              {m.icon}
              <span className="font-medium">{m.name}</span>
            </button>
          ))}
        </nav>
      </div>
      <button
        onClick={handleLogOut}
        className="flex items-center justify-center gap-2 mt-10 p-3 text-sm bg-red-600 rounded-xl hover:bg-red-700 transition-all"
      >
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );
};

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(false)} />

      <main className="flex-1 ml-0 md:ml-64 p-6">
        {/* Mobile Menu Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Render child routes here */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
