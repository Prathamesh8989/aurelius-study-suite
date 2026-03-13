import React from "react";
import { Sidebar } from "./Sidebar";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isFocusMode = location === "/focus";

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-300">
      {/* Background texture layer */}
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/library-texture.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {!isFocusMode && <Sidebar />}
      
      <main className={cn(
        "flex-1 relative z-10 overflow-y-auto",
        !isFocusMode && "p-6 md:p-8 lg:p-10"
      )}>
        <div className="max-w-7xl mx-auto w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
