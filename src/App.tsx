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
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const imgs = Array.from(document.images);
    if (imgs.length === 0) {
      setImagesLoaded(true);
      return;
    }
    let loadedCount = 0;
    imgs.forEach((img) => {
      if (img.complete) {
        loadedCount++;
        if (loadedCount === imgs.length) setImagesLoaded(true);
      } else {
        img.addEventListener("load", () => {
          loadedCount++;
          if (loadedCount === imgs.length) setImagesLoaded(true);
        });
        img.addEventListener("error", () => {
          loadedCount++;
          if (loadedCount === imgs.length) setImagesLoaded(true);
        });
      }
    });
  }, []);

  useEffect(() => {
    // Hide loader on window load or after a short delay as fallback
    const onReady = () => {
      if (imagesLoaded) setLoading(false);
    };
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
  }, [imagesLoaded]);

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
      { /* Full-screen loading page */}

    </>
  );
}

export default App;
