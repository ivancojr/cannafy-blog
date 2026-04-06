import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { CMSAuthProvider } from "@/hooks/useCMSAuth";
import BlogIndex from "@/pages/blog/BlogIndex";
import BlogArticlePage from "@/pages/blog/BlogArticlePage";
import BlogCategoryPage from "@/pages/blog/BlogCategoryPage";

const CMSLogin = lazy(() => import("@/pages/cms/CMSLogin"));
const CMSDashboard = lazy(() => import("@/pages/cms/CMSDashboard"));
const CMSEditor = lazy(() => import("@/pages/cms/CMSEditor"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const CMSLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full" />
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <CMSAuthProvider>
          <Toaster richColors position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/blog" replace />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/artigo/:slug" element={<BlogArticlePage />} />
              <Route path="/blog/categoria/:category" element={<BlogCategoryPage />} />

              {/* CMS Routes */}
              <Route path="/cms/login" element={<Suspense fallback={<CMSLoading />}><CMSLogin /></Suspense>} />
              <Route path="/cms" element={<Suspense fallback={<CMSLoading />}><CMSDashboard /></Suspense>} />
              <Route path="/cms/editor" element={<Suspense fallback={<CMSLoading />}><CMSEditor /></Suspense>} />
              <Route path="/cms/editor/:id" element={<Suspense fallback={<CMSLoading />}><CMSEditor /></Suspense>} />

              <Route path="*" element={<Navigate to="/blog" replace />} />
            </Routes>
          </BrowserRouter>
        </CMSAuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
