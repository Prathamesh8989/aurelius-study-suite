import React, { useState, useEffect } from "react";
import { useStudy } from "@/context/StudyContext";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { Link } from "wouter";

export default function FocusVault() {
  const { pomodoroStats, addPomodoroSession, setPlannedPomodoros } = useStudy();
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (mode === "focus") {
        addPomodoroSession();
        setMode("break");
        setTimeLeft(5 * 60); // 5 min break
      } else {
        setMode("focus");
        setTimeLeft(25 * 60);
        setIsActive(false); // pause before next focus
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, addPomodoroSession]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === "focus" ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 140; // r=140
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-10"
           style={{
             background: `radial-gradient(circle at center, hsl(var(--${mode === 'focus' ? 'primary' : 'success'})) 0%, transparent 70%)`
           }}
      />

      <Link href="/" className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors z-20">
        <X size={32} />
      </Link>

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          {mode === "focus" ? "Deep Work" : "Rest & Recover"}
        </h1>
        <p className="text-muted-foreground mb-12 uppercase tracking-widest text-sm font-medium">
          Session {pomodoroStats.completedToday + 1}
        </p>

        {/* Timer UI */}
        <div className="relative flex items-center justify-center mb-12">
          <svg width="320" height="320" className="transform -rotate-90 drop-shadow-2xl">
            <circle cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary opacity-30" />
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={mode === "focus" ? "text-accent" : "text-emerald-500"}
              style={{ transition: "stroke-dashoffset 0.5s linear" }}
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-7xl font-sans font-bold tabular-nums tracking-tighter text-foreground drop-shadow-md">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/20"
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
          </button>
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 hover:text-foreground transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 glass-card px-8 py-4 rounded-2xl flex items-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-serif font-bold text-foreground">{pomodoroStats.completedToday}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <input 
              type="number" 
              value={pomodoroStats.plannedToday}
              onChange={(e) => setPlannedPomodoros(Number(e.target.value))}
              className="w-12 text-2xl font-serif font-bold text-foreground bg-transparent text-center border-b border-dashed border-muted-foreground focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Planned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
