import React, { createContext, useContext, useEffect, useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { generateId } from "@/lib/utils";

export interface Subject {
  id: string;
  name: string;
  currentGrade: number;
  targetGrade: number;
  difficulty: number; // 1-5
  examDate: string; // ISO date string
  dailyHours: number;
}

export interface StudyTask {
  id: string;
  subjectId: string;
  title: string;
  date: string; // ISO date string
  completed: boolean;
  plannedHours: number;
}

export interface RecallSession {
  id: string;
  subjectId: string;
  topic: string;
  scheduledDate: string; // ISO date string
  completed: boolean;
}

export interface PomodoroStats {
  completedToday: number;
  plannedToday: number;
  totalCompleted: number;
}

interface StudyContextType {
  subjects: Subject[];
  studyTasks: StudyTask[];
  recallSessions: RecallSession[];
  pomodoroStats: PomodoroStats;
  darkMode: boolean;
  
  // Actions
  toggleDarkMode: () => void;
  addSubject: (subject: Omit<Subject, "id">) => void;
  deleteSubject: (id: string) => void;
  addTask: (task: Omit<StudyTask, "id" | "completed">) => void;
  toggleTask: (id: string) => void;
  addRecallTopic: (subjectId: string, topic: string) => void;
  completeRecallSession: (id: string) => void;
  addPomodoroSession: () => void;
  setPlannedPomodoros: (count: number) => void;
}

const defaultSubjects: Subject[] = [
  { id: "1", name: "Physics", currentGrade: 72, targetGrade: 90, difficulty: 4, examDate: addDays(new Date(), 21).toISOString(), dailyHours: 2 },
  { id: "2", name: "Mathematics", currentGrade: 85, targetGrade: 95, difficulty: 3, examDate: addDays(new Date(), 14).toISOString(), dailyHours: 1.5 },
  { id: "3", name: "English Literature", currentGrade: 78, targetGrade: 85, difficulty: 2, examDate: addDays(new Date(), 28).toISOString(), dailyHours: 1 },
];

const defaultTasks: StudyTask[] = [
  { id: "t1", subjectId: "1", title: "Quantum Mechanics Chapter 4", date: new Date().toISOString(), completed: false, plannedHours: 2 },
  { id: "t2", subjectId: "2", title: "Integration Practice Set", date: new Date().toISOString(), completed: true, plannedHours: 1 },
];

const defaultRecalls: RecallSession[] = [
  { id: "r1", subjectId: "1", topic: "Thermodynamics Laws", scheduledDate: new Date().toISOString(), completed: false },
  { id: "r2", subjectId: "3", topic: "Shakespeare Motifs", scheduledDate: addDays(new Date(), 1).toISOString(), completed: false },
];

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State initialization from localStorage or defaults
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [recallSessions, setRecallSessions] = useState<RecallSession[]>([]);
  const [pomodoroStats, setPomodoroStats] = useState<PomodoroStats>({ completedToday: 0, plannedToday: 4, totalCompleted: 0 });
  const [darkMode, setDarkMode] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      const storedSubjects = localStorage.getItem("aurelius_subjects");
      if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
      else setSubjects(defaultSubjects);

      const storedTasks = localStorage.getItem("aurelius_tasks");
      if (storedTasks) setStudyTasks(JSON.parse(storedTasks));
      else setStudyTasks(defaultTasks);

      const storedRecalls = localStorage.getItem("aurelius_recalls");
      if (storedRecalls) setRecallSessions(JSON.parse(storedRecalls));
      else setRecallSessions(defaultRecalls);

      const storedStats = localStorage.getItem("aurelius_pomodoro");
      if (storedStats) {
        const stats = JSON.parse(storedStats);
        // Reset completedToday if it's a new day (simple check based on last saved date, omitted for brevity, assuming same session)
        setPomodoroStats(stats);
      }

      const storedTheme = localStorage.getItem("aurelius_theme");
      if (storedTheme === "dark") {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      }
      
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Save data on changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("aurelius_subjects", JSON.stringify(subjects));
    localStorage.setItem("aurelius_tasks", JSON.stringify(studyTasks));
    localStorage.setItem("aurelius_recalls", JSON.stringify(recallSessions));
    localStorage.setItem("aurelius_pomodoro", JSON.stringify(pomodoroStats));
    localStorage.setItem("aurelius_theme", darkMode ? "dark" : "light");
  }, [subjects, studyTasks, recallSessions, pomodoroStats, darkMode, isLoaded]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  };

  const addSubject = (subject: Omit<Subject, "id">) => {
    setSubjects(prev => [...prev, { ...subject, id: generateId() }]);
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setStudyTasks(prev => prev.filter(t => t.subjectId !== id));
    setRecallSessions(prev => prev.filter(r => r.subjectId !== id));
  };

  const addTask = (task: Omit<StudyTask, "id" | "completed">) => {
    setStudyTasks(prev => [...prev, { ...task, id: generateId(), completed: false }]);
  };

  const toggleTask = (id: string) => {
    setStudyTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        // If completing a task, optionally we could auto-generate a recall session for its title
        if (isCompleting) {
          addRecallTopic(t.subjectId, t.title);
        }
        return { ...t, completed: isCompleting };
      }
      return t;
    }));
  };

  // Spaced Repetition Engine
  const addRecallTopic = (subjectId: string, topic: string) => {
    const now = new Date();
    const newSessions: RecallSession[] = [
      { id: generateId(), subjectId, topic, scheduledDate: addDays(now, 1).toISOString(), completed: false },
      { id: generateId(), subjectId, topic, scheduledDate: addDays(now, 7).toISOString(), completed: false },
      { id: generateId(), subjectId, topic, scheduledDate: addDays(now, 30).toISOString(), completed: false },
    ];
    setRecallSessions(prev => [...prev, ...newSessions]);
  };

  const completeRecallSession = (id: string) => {
    setRecallSessions(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r));
  };

  const addPomodoroSession = () => {
    setPomodoroStats(prev => ({
      ...prev,
      completedToday: prev.completedToday + 1,
      totalCompleted: prev.totalCompleted + 1
    }));
  };

  const setPlannedPomodoros = (count: number) => {
    setPomodoroStats(prev => ({ ...prev, plannedToday: count }));
  };

  if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <StudyContext.Provider value={{
      subjects, studyTasks, recallSessions, pomodoroStats, darkMode,
      toggleDarkMode, addSubject, deleteSubject, addTask, toggleTask, addRecallTopic, completeRecallSession, addPomodoroSession, setPlannedPomodoros
    }}>
      {children}
    </StudyContext.Provider>
  );
}

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error("useStudy must be used within StudyProvider");
  return context;
};
