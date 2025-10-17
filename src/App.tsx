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
import DashboardLayout from "./pages/admin/DashboardLayout";
import DashboardHome from "./pages/admin/DashboardHome";
import SubmissionsPage from "./pages/admin/SubmissionsPage";
import UsersPage from "./pages/admin/UsersPage";

import ArchivePage from "./pages/admin/ArchivePage";
import Verify2FA from "./pages/Verify2FA";
import Auth from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import FaqManager from "./pages/admin/FaqForm";
import ContactMessages from "./pages/admin/ContactMessages";
import EditorialMemberForm from "./pages/admin/UploadEditorialMember";
import AboutSectionManager from "./pages/admin/AboutPageSectionUI";
import NewsletterDashboard from "./pages/admin/NewsletterDashboard";
import TopicDashboard from "./pages/admin/TopicDashboard";
import IssueManager from "./pages/admin/IssueManager";
import AdminRoute from "./pages/admin/AdminRouteProtect";
import ContactInfoManager from "./pages/admin/ContactInfoManager";

const App = () => {
  const location = useLocation();
  const hideLayout = location.pathname.includes("dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      {!hideLayout && <Navigation />}

      <main className="flex-1">
        <Routes>
          {/* Dashboard routes */}
          <Route path="/dashboard" element={
            <AdminRoute>
              <DashboardLayout />
            </AdminRoute>
            
            }>
            <Route index element={<DashboardHome />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="users" element={<UsersPage />} />

            <Route path="archive" element={<ArchivePage />} />
            <Route path="upload-member"  element={<EditorialMemberForm/>} />
             <Route path="add-faq" element={<FaqManager/>}   />
             <Route path="contact-msg" element={<ContactMessages/>}  />
             <Route  path="add-about" element={<AboutSectionManager/>}  />
             <Route path="view-newsletter"  element={<NewsletterDashboard/>}   />
             <Route  path="add-topic"  element={<TopicDashboard/>}   />
             <Route path="issues" element={<IssueManager/>}  />
             <Route  path="contact-info" element={<ContactInfoManager/>} />
            
          </Route>

          {/* Public routes */}
         
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/editorial-board" element={<EditorialBoard />} />
          <Route path="/author-page" element={<AuthorPage />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/submission" element={<Submission />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/verify-2fa" element={<Verify2FA />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
     <ToastContainer
     position="top-right"
     autoClose={2000}
     hideProgressBar={false} // show progress bar
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
  );
};
export default App;