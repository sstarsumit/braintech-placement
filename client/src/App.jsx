import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth, dashboardPath } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import FloatButtons from './components/FloatButtons.jsx';

import Home from './pages/Home.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import About from './pages/About.jsx';
import PlacementStory from './pages/PlacementStory.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SubmitResume from './pages/SubmitResume.jsx';
import PostJob from './pages/PostJob.jsx';
import NotFound from './pages/NotFound.jsx';

import CandidateLayout from './pages/candidate/CandidateLayout.jsx';
import CandidateDashboard from './pages/candidate/CandidateDashboard.jsx';
import CandidateProfile from './pages/candidate/CandidateProfile.jsx';
import CandidateApplications from './pages/candidate/CandidateApplications.jsx';
import SavedJobs from './pages/candidate/SavedJobs.jsx';

import RecruiterLayout from './pages/recruiter/RecruiterLayout.jsx';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard.jsx';
import RecruiterJobs from './pages/recruiter/RecruiterJobs.jsx';
import RecruiterApplicants from './pages/recruiter/RecruiterApplicants.jsx';
import RecruiterCompany from './pages/recruiter/RecruiterCompany.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminCandidates from './pages/admin/AdminCandidates.jsx';
import AdminCompanies from './pages/admin/AdminCompanies.jsx';
import AdminJobs from './pages/admin/AdminJobs.jsx';
import AdminApplications from './pages/admin/AdminApplications.jsx';
import AdminContacts from './pages/admin/AdminContacts.jsx';
import AdminStories from './pages/admin/AdminStories.jsx';

function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="spin" />;
  // Unauthenticated visitors to /admin go to the dedicated admin portal, not
  // the public login page. Everything else keeps the public login flow.
  const loginTo = roles?.includes('admin') ? '/admin/login' : '/login';
  if (!user) return <Navigate to={loginTo} state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'recruiter' ? '/recruiter' : '/candidate'} replace />;
  }
  return children;
}

// /post-job serves visitors (registers a company inline) and recruiters. Candidates
// and admins are bounced to their own dashboards — navbar hides the link, this
// blocks the URL, and the API's authorize('recruiter') blocks the request itself.
function PostJobGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spin" />;
  if (user && user.role !== 'recruiter') {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }
  return children;
}

function Shell({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <FloatButtons />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shell><Home /></Shell>} />
      <Route path="/jobs" element={<Shell><Jobs /></Shell>} />
      <Route path="/jobs/:id" element={<Shell><JobDetail /></Shell>} />
      <Route path="/about" element={<Shell><About /></Shell>} />
      <Route path="/placement-story" element={<Shell><PlacementStory /></Shell>} />
      <Route path="/contact" element={<Shell><Contact /></Shell>} />
      <Route path="/login" element={<Shell><Login /></Shell>} />
      {/* Admin portal: standalone, outside the public Shell (no navbar/footer). */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Shell><Register /></Shell>} />
      <Route path="/submit-resume" element={<Shell><SubmitResume /></Shell>} />
      <Route path="/post-job" element={<Shell><PostJobGuard><PostJob /></PostJobGuard></Shell>} />

      <Route path="/candidate" element={<Protected roles={['candidate']}><CandidateLayout /></Protected>}>
        <Route index element={<CandidateDashboard />} />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="applications" element={<CandidateApplications />} />
        <Route path="saved" element={<SavedJobs />} />
      </Route>

      <Route path="/recruiter" element={<Protected roles={['recruiter']}><RecruiterLayout /></Protected>}>
        <Route index element={<RecruiterDashboard />} />
        <Route path="jobs" element={<RecruiterJobs />} />
        <Route path="jobs/:jobId/applicants" element={<RecruiterApplicants />} />
        <Route path="company" element={<RecruiterCompany />} />
      </Route>

      <Route path="/admin" element={<Protected roles={['admin']}><AdminLayout /></Protected>}>
        <Route index element={<AdminDashboard />} />
        <Route path="candidates" element={<AdminCandidates />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="stories" element={<AdminStories />} />
      </Route>

      <Route path="*" element={<Shell><NotFound /></Shell>} />
    </Routes>
  );
}
