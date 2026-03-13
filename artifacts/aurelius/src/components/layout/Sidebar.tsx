import React from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Calendar, Timer, LineChart, Table2, Moon, Sun } from "lucide-react";
import { useStudy } from "@/context/StudyContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: BookOpen },
  { href: "/planner", label: "Study Planner", icon: Calendar },
  { href: "/focus", label: "Focus Vault", icon: Timer },
  { href: "/ledger", label: "Academic Ledger", icon: Table2 },
  { href: "/analytics", label: "Analytics", icon: LineChart },
];

export function Sidebar() {
  const [location] = useLocation();
  const { darkMode, toggleDarkMode } = useStudy();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/50 bg-card/50 backdrop-blur-xl h-screen sticky top-0 flex flex-col transition-colors duration-300">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold gold-gradient-text">Aurelius</h1>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} 
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:-translate-y-0.5"
              )}
            >
              <item.icon size={18} className={cn(isActive && "text-accent")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="glass-card rounded-xl p-4 text-center border-accent/20 bg-accent/5">
          <p className="text-xs font-serif italic text-muted-foreground mb-1">"Waste no more time arguing what a good man should be. Be one."</p>
          <p className="text-[10px] uppercase tracking-widest text-accent font-bold">— Marcus Aurelius</p>
        </div>
      </div>
    </aside>
  );
}
