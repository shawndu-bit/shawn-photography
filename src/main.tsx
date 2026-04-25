import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import { SiteContentContext } from './context/SiteContentContext';
import { useSiteContent } from './hooks/useSiteContent';
import { AdminAuthContext } from './admin/context/AdminAuthContext';
import { useAdminAuth } from './admin/hooks/useAdminAuth';
import AboutPage from './pages/AboutPage';
import LoginPage from './admin/pages/LoginPage';
import DashboardPage from './admin/pages/DashboardPage';
import HeroEditPage from './admin/pages/HeroEditPage';
import AboutEditPage from './admin/pages/AboutEditPage';
import BlogEditPage from './admin/pages/BlogEditPage';
import ContactEditPage from './admin/pages/ContactEditPage';
import PhotosPage from './admin/pages/PhotosPage';
import VisibilityPage from './admin/pages/VisibilityPage';
import PortfolioPlaceholderPage from './admin/pages/PortfolioPlaceholderPage';
import BlogPagePlaceholder from './admin/pages/BlogPagePlaceholder';
import PhotosLibraryPlaceholderPage from './admin/pages/PhotosLibraryPlaceholderPage';
import './index.css';

function AppProviders({ children }: { children: React.ReactNode }) {
  const siteContentValue = useSiteContent();
  const adminAuthValue = useAdminAuth();

  return (
    <AdminAuthContext.Provider value={adminAuthValue}>
      <SiteContentContext.Provider value={siteContentValue}>
        {children}
      </SiteContentContext.Provider>
    </AdminAuthContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/hero" element={<HeroEditPage />} />
          <Route path="/admin/about" element={<AboutEditPage />} />
          <Route path="/admin/blog" element={<BlogEditPage />} />
          <Route path="/admin/contact" element={<ContactEditPage />} />
          <Route path="/admin/photos" element={<PhotosPage />} />
          <Route path="/admin/visibility" element={<VisibilityPage />} />
          <Route path="/admin/portfolio" element={<PortfolioPlaceholderPage />} />
          <Route path="/admin/blog-page" element={<BlogPagePlaceholder />} />
          <Route path="/admin/photos-library" element={<PhotosLibraryPlaceholderPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);
