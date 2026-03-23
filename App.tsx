import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { DEMO_MODE } from "@/lib/demoMode";
import Hero from "./pages/Hero.tsx";
import Index from "./pages/Index.tsx";
import StudyTracker from "./pages/StudyTracker.tsx";
import HabitTracker from "./pages/HabitTracker.tsx";
import ExpenseTracker from "./pages/ExpenseTracker.tsx";
import SleepTracker from "./pages/SleepTracker.tsx";
import GymTracker from "./pages/GymTracker.tsx";
import Analytics from "./pages/Analytics.tsx";
import Notes from "./pages/Notes.tsx";
import CalendarPage from "./pages/CalendarPage.tsx";
import AIChat from "./pages/AIChat.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (DEMO_MODE) return <>{children}</>;
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<Hero />} />
    <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/study" element={<ProtectedRoute><StudyTracker /></ProtectedRoute>} />
    <Route path="/habits" element={<ProtectedRoute><HabitTracker /></ProtectedRoute>} />
    <Route path="/expenses" element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
    <Route path="/sleep" element={<ProtectedRoute><SleepTracker /></ProtectedRoute>} />
    <Route path="/gym" element={<ProtectedRoute><GymTracker /></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
    <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
    <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
    <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
