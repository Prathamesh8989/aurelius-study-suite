import React from "react";
import { useStudy } from "@/context/StudyContext";
import { calculatePerformanceDelta, cn } from "@/lib/utils";
import { RadialGauge } from "@/components/ui/radial-gauge";
import { CheckCircle2, Circle, Clock, Brain, Flame, Target } from "lucide-react";
import { isSameDay, format, parseISO } from "date-fns";

export default function Dashboard() {
  const { subjects, studyTasks, recallSessions, pomodoroStats, toggleTask } = useStudy();

  // Readiness Score
  const readinessScore = subjects.length > 0 
    ? subjects.reduce((acc, s) => acc + Math.min(100, (s.currentGrade / s.targetGrade) * 100), 0) / subjects.length
    : 0;

  // Focus Efficiency
  const focusEfficiency = pomodoroStats.plannedToday > 0 
    ? Math.min(100, (pomodoroStats.completedToday / pomodoroStats.plannedToday) * 100)
    : 0;

  // Today's Tasks
  const today = new Date();
  const todayTasks = studyTasks.filter(t => isSameDay(parseISO(t.date), today));

  // Upcoming Recalls (Next 7 days)
  const upcomingRecalls = recallSessions
    .filter(r => !r.completed)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  // AI Strategy Brief
  const deltas = subjects.map(s => ({
    ...s,
    delta: calculatePerformanceDelta(s.currentGrade, s.targetGrade, s.difficulty, s.examDate)
  })).sort((a, b) => b.delta - a.delta);

  const highestDelta = deltas[0];
  const lowestDelta = deltas[deltas.length - 1];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-4xl font-serif font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1 text-lg">Your academic command center.</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Card */}
        <div className="glass-card rounded-2xl p-6 flex items-center gap-6">
          <RadialGauge value={readinessScore} label="Ready" size={100} strokeWidth={8} />
          <div>
            <h3 className="text-lg font-bold text-foreground font-serif">Readiness Score</h3>
            <p className="text-sm text-muted-foreground mt-1">Based on target vs current grades</p>
          </div>
        </div>

        {/* Focus Stats Card */}
        <div className="glass-card rounded-2xl p-6 luxury-gradient text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Flame size={80} /></div>
          <h3 className="text-lg font-bold font-serif relative z-10">Focus Efficiency</h3>
          <div className="mt-4 flex items-end gap-2 relative z-10">
            <span className="text-5xl font-bold font-serif">{Math.round(focusEfficiency)}%</span>
          </div>
          <p className="text-sm opacity-80 mt-2 relative z-10">
            {pomodoroStats.completedToday} of {pomodoroStats.plannedToday} sessions completed today
          </p>
        </div>

        {/* Strategy Brief */}
        <div className="glass-card rounded-2xl p-6 border-accent/30 relative">
          <div className="flex items-center gap-2 mb-3">
            <Target className="text-accent" size={20} />
            <h3 className="text-lg font-bold text-foreground font-serif">Strategy Brief</h3>
          </div>
          {highestDelta ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your <strong className="text-foreground">{highestDelta.name}</strong> performance delta is widening. 
              {lowestDelta && lowestDelta.id !== highestDelta.id && ` Consider shifting focus from ${lowestDelta.name} to ${highestDelta.name} today.`}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Add subjects to generate your strategy.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
              <Clock className="text-primary dark:text-accent" /> Today's Ledger
            </h2>
            <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {todayTasks.filter(t => t.completed).length} / {todayTasks.length} done
            </span>
          </div>
          
          <div className="glass-card rounded-2xl p-2 divide-y divide-border/50">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No tasks scheduled for today.</p>
              </div>
            ) : (
              todayTasks.map(task => {
                const subject = subjects.find(s => s.id === task.subjectId);
                return (
                  <div key={task.id} 
                    className="p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors group cursor-pointer"
                    onClick={() => toggleTask(task.id)}
                  >
                    <button className={cn("flex-shrink-0 transition-colors", task.completed ? "text-success" : "text-muted-foreground group-hover:text-primary")}>
                      {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    <div className={cn("flex-1 transition-opacity", task.completed && "opacity-50 line-through")}>
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{subject?.name} • {task.plannedHours}h</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Spaced Repetition Queue */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
            <Brain className="text-primary dark:text-accent" /> Active Recall
          </h2>
          
          <div className="glass-card rounded-2xl p-2 divide-y divide-border/50">
            {upcomingRecalls.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>Your recall queue is empty.</p>
              </div>
            ) : (
              upcomingRecalls.map(recall => {
                const subject = subjects.find(s => s.id === recall.subjectId);
                const isToday = isSameDay(parseISO(recall.scheduledDate), today);
                return (
                  <div key={recall.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="font-medium text-foreground">{recall.topic}</p>
                      <p className="text-xs text-muted-foreground">{subject?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-md",
                        isToday ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"
                      )}>
                        {isToday ? "DUE TODAY" : format(parseISO(recall.scheduledDate), "MMM d")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
