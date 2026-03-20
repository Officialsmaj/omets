import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Consultation from './pages/Consultation';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Services from './pages/Services';
import Workshops from './pages/Workshops';
import KnowledgeBase from './pages/KnowledgeBase';
import InnovationHub from './pages/InnovationHub';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import CourseDetail from './pages/CourseDetail';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import FAQ from './pages/FAQ';
import EnrollmentSuccess from './pages/EnrollmentSuccess';
import { Login, Register, Verify } from './pages/Auth';
import { DatabaseSeeder } from './components/DatabaseSeeder';

const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }
  return <>{children}</>;
};

export default function App() {
  const basename = import.meta.env.VITE_GITHUB_PAGES === 'true' ? '/omets' : '';
  return (
    <AuthProvider>
      <DatabaseSeeder />
      <BrowserRouter basename={basename}>
        <AuthLoader>
          <Routes>
            <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="workshops" element={<Workshops />} />
            <Route path="consultation" element={<Consultation />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="community" element={<Community />} />
            <Route path="innovation-hub" element={<InnovationHub />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="blog" element={<Blog />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify" element={<Verify />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="enrollment-success" element={<EnrollmentSuccess />} />
          </Route>
        </Routes>
        </AuthLoader>
      </BrowserRouter>
    </AuthProvider>
  );
}
