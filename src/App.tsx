import React, { useEffect, useState } from "react";
const style = document.createElement("style");
style.innerHTML = `@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`;
if (!document.head.querySelector('#shimmer-kf')) { style.id = 'shimmer-kf'; document.head.appendChild(style); }
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide loader on window load or after a short delay as fallback
    const onReady = () => setLoading(false);
    if (document.readyState === "complete") {
      onReady();
    } else {
      window.addEventListener("load", onReady);
    }
    const fallback = setTimeout(() => setLoading(false), 3000);
    return () => {
      window.removeEventListener("load", onReady);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
      { /* Full-screen loading page */ }
      {loading && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white dark:bg-black">
          <div className="relative flex flex-col items-center gap-6">
            {/* Logo / Title */}
            <div className="text-2xl md:text-3xl font-light tracking-widest text-black/80 dark:text-white/80">
              ORK HOSSAIN
            </div>
            {/* Glass orb spinner */}
            <div className="relative w-16 h-16 rounded-full border border-black/10 dark:border-white/10 bg-white/30 dark:bg-white/10 backdrop-blur-md">
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-black/60 dark:border-t-white/70 animate-spin"></div>
              <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-white/40 dark:bg-white/20 blur-md"></div>
            </div>
            {/* Progress bar with shimmer */}
            <div className="w-64 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div className="h-full w-1/3 animate-[shimmer_1.2s_ease_infinite] bg-gradient-to-r from-transparent via-black/40 to-transparent dark:via-white/60"></div>
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/60">Loading</div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
