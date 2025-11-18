import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Journal from "./pages/Journal";
import EditorialBoard from "./pages/EditorialBoard";
import AuthorPage from "./pages/AuthorPage";
import Archive from "./pages/Archive";
import Submission from "./pages/Submission";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { useEffect } from "react";
import GlobalLayout from "./components/GlobalLayout";
import { GlobalSearchProvider } from "./components/GlobalSearchContext";
import axios from "axios";

// Admin pages
import DashboardLayout from "./pages/admin/DashboardLayout";
import DashboardHome from "./pages/admin/DashboardHome";
import SubmissionsPage from "./pages/admin/SubmissionsPage";
import UsersPage from "./pages/admin/UsersPage";
import ArchivePage from "./pages/admin/ArchivePage";
import FaqManager from "./pages/admin/FaqForm";
import ContactMessages from "./pages/admin/ContactMessages";
import EditorialMemberForm from "./pages/admin/UploadEditorialMember";
import AboutSectionManager from "./pages/admin/AboutPageSectionUI";
import NewsletterDashboard from "./pages/admin/NewsletterDashboard";
import TopicDashboard from "./pages/admin/TopicDashboard";
import IssueManager from "./pages/admin/IssueManager";
import ContactInfoManager from "./pages/admin/ContactInfoManager";
import AdminRoute from "./pages/admin/AdminRouteProtect";
import Announcements from "./pages/admin/Announcements";


// Auth pages
import Auth from "./pages/Login";
import Verify2FA from "./pages/Verify2FA";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// New admin login page
import AdminLogin from "./pages/admin/AdminLogin"; // ✅ Create this for admin auth
import LogoManager from "./pages/admin/LogoManager";

const App = () => {
  const location = useLocation();
   const [logoUrl, setLogoUrl] = useState("/logo.png");
   const [journalTitle, setJournalTitle] = useState("Loading...");
    useEffect(() => {
    const fetchLogoAndTitle = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/logo`);
      if (res.data?.data) {
        setLogoUrl(res.data.data.logoUrl || "/logo.png");
        setJournalTitle(res.data.data.name);
      }
    };
    fetchLogoAndTitle();
  }, []);

  // ✅ Hide Navigation & Footer for admin dashboard or login routes
  const hideLayout =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin");

  return (
    <GlobalLayout logoUrl={logoUrl} journalTitle={journalTitle}>
    <GlobalSearchProvider>
    <div className="min-h-screen flex flex-col">
      {!hideLayout && <Navigation />}

      <main className="flex-1">
        <Routes>
          {/* ✅ Admin routes (protected) */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <DashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="archive" element={<ArchivePage />} />
            <Route path="upload-member" element={<EditorialMemberForm />} />
            <Route path="add-faq" element={<FaqManager />} />
            <Route path="contact-msg" element={<ContactMessages />} />
            <Route path="add-about" element={<AboutSectionManager />} />
            <Route path="view-newsletter" element={<NewsletterDashboard />} />
            <Route path="add-topic" element={<TopicDashboard />} />
            <Route path="issues" element={<IssueManager />} />
            <Route path="contact-info" element={<ContactInfoManager />} />
            <Route path="manage-logo"  element={<LogoManager/>}   />
            <Route path="announcements" element={<Announcements/>}/>
          </Route>

          {/* ✅ Admin auth routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/verify-2fa" element={<Verify2FA />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />

          {/* ✅ Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/editorial-board" element={<EditorialBoard />} />
          <Route path="/author-page" element={<AuthorPage />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/submission" element={<Submission />} />
          <Route path="/contact" element={<Contact />} />

          {/* User auth */}
          <Route path="/login" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Misc */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}

      {/* ✅ Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        toastStyle={{
          background: "#fff",
          border: "1px solid #d1d5db",
        }}
      />
    </div>
    </GlobalSearchProvider>
    </GlobalLayout>
  );
};

export default App;
