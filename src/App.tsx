import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import PostDetail from "@/pages/PostDetail";
import Submit from "@/pages/Submit";
import Auth from "@/pages/Auth";
import Forms from "@/pages/Forms";
import Subreddit from "@/pages/Subreddit";
import Profile from "@/pages/Profile";
import Academics from "@/pages/Academics";
import CourseDetail from "@/pages/CourseDetail";
import Exchange from "@/pages/Exchange";
import ExchangeDetail from "@/pages/ExchangeDetail";
import Internships from "@/pages/Internships";
import InternshipDetail from "@/pages/InternshipDetail";
import ExamPapers from "@/pages/ExamPapers";
import CampusLife from "@/pages/CampusLife";
import UserProfile from "@/pages/UserProfile";
import ChatList from "@/pages/ChatList";
import ChatConversation from "@/pages/ChatConversation";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/d/:category" element={<Subreddit />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/forms" element={<Forms />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/academics" element={<Academics />} />
                <Route path="/academics/:courseId" element={<CourseDetail />} />
                <Route path="/exchange" element={<Exchange />} />
                <Route path="/exchange/:collegeId" element={<ExchangeDetail />} />
                <Route path="/internships" element={<Internships />} />
                <Route path="/internships/:companyId" element={<InternshipDetail />} />
                <Route path="/exam-papers" element={<ExamPapers />} />
                <Route path="/campus" element={<CampusLife />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/chat" element={<ChatList />} />
                <Route path="/chat/:conversationId" element={<ChatConversation />} />
              </Route>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
