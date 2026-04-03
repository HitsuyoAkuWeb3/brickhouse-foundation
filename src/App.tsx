import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Navigate } from "react-router-dom";
import BreakthroughConfirmation from "./pages/BreakthroughConfirmation";
import Coaching from "./pages/Coaching";
import CoachingIntake from "./pages/CoachingIntake";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import MyBricks from "./pages/MyBricks";
import BrickDetail from "./pages/BrickDetail";
import LessonPlayer from "./pages/LessonPlayer";
import DailyRitual from "./pages/DailyRitual";
import Affirmations from "./pages/Affirmations";
import PassionPick from "./pages/PassionPick";
import GoddessRx from "./pages/GoddessRx";
import Scheduler from "./pages/Scheduler";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }

    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Layout Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/coaching" element={<Coaching />} />
                <Route path="/coaching-intake" element={<CoachingIntake />} />
                <Route path="/breakthrough-confirmation" element={<BreakthroughConfirmation />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/contact" element={<Contact />} />
                {/* ADD ALL CUSTOM PUBLIC ROUTES HERE */}
              </Route>

              {/* App Layout Routes (Protected) */}
              <Route element={<AppLayout />}>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bricks"
                  element={
                    <ProtectedRoute>
                      <MyBricks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bricks/:slug"
                  element={
                    <ProtectedRoute>
                      <BrickDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bricks/:slug/lesson/:lessonId"
                  element={
                    <ProtectedRoute>
                      <LessonPlayer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/daily-ritual"
                  element={
                    <ProtectedRoute>
                      <DailyRitual />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/affirmations"
                  element={
                    <ProtectedRoute>
                      <Affirmations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/passion-pick"
                  element={
                    <ProtectedRoute>
                      <PassionPick />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/goddess-rx"
                  element={
                    <ProtectedRoute>
                      <GoddessRx />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scheduler"
                  element={
                    <ProtectedRoute>
                      <Scheduler />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
