import React, { useState } from "react";
import { useStudy, Subject, StudyTask } from "@/context/StudyContext";
import { Plus, Trash2, CheckCircle2, Circle, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export default function Planner() {
  const { subjects, addSubject, deleteSubject, studyTasks, addTask, toggleTask, addRecallTopic } = useStudy();
  
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSub, setNewSub] = useState({ name: "", currentGrade: 0, targetGrade: 0, difficulty: 3, examDate: "", dailyHours: 1 });
  
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: "", date: format(new Date(), "yyyy-MM-dd"), plannedHours: 1 });

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.name || !newSub.examDate) return;
    addSubject({
      ...newSub,
      examDate: new Date(newSub.examDate).toISOString()
    });
    setShowAddSubject(false);
    setNewSub({ name: "", currentGrade: 0, targetGrade: 0, difficulty: 3, examDate: "", dailyHours: 1 });
  };

  const handleAddTask = (subjectId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    addTask({
      subjectId,
      title: newTask.title,
      date: new Date(newTask.date).toISOString(),
      plannedHours: newTask.plannedHours
    });
    setShowAddTask(null);
    setNewTask({ title: "", date: format(new Date(), "yyyy-MM-dd"), plannedHours: 1 });
  };

  const handleCreateRecall = (subjectId: string) => {
    const topic = window.prompt("Enter topic for spaced repetition:");
    if (topic) addRecallTopic(subjectId, topic);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Study Planner</h1>
          <p className="text-muted-foreground mt-1 text-lg">Curriculum architecture and task assignment.</p>
        </div>
        <button 
          onClick={() => setShowAddSubject(!showAddSubject)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={18} /> Add Subject
        </button>
      </header>

      {showAddSubject && (
        <div className="glass-card rounded-2xl p-6 border-accent/30 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-serif font-bold mb-4">New Academic Subject</h3>
          <form onSubmit={handleAddSubject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Subject Name</label>
              <input type="text" required value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Organic Chemistry" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Current Grade (%)</label>
              <input type="number" required min="0" max="100" value={newSub.currentGrade || ""} onChange={e => setNewSub({...newSub, currentGrade: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Target Grade (%)</label>
              <input type="number" required min="0" max="100" value={newSub.targetGrade || ""} onChange={e => setNewSub({...newSub, targetGrade: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Difficulty (1-5)</label>
              <input type="range" min="1" max="5" value={newSub.difficulty} onChange={e => setNewSub({...newSub, difficulty: Number(e.target.value)})} className="w-full accent-accent" />
              <div className="text-xs text-muted-foreground text-center">Level {newSub.difficulty}</div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Exam Date</label>
              <input type="date" required value={newSub.examDate} onChange={e => setNewSub({...newSub, examDate: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="w-full px-4 py-2 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-accent/90 transition-colors">Save Subject</button>
              <button type="button" onClick={() => setShowAddSubject(false)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subjects.map(subject => {
          const sTasks = studyTasks.filter(t => t.subjectId === subject.id);
          const progress = subject.targetGrade > 0 ? (subject.currentGrade / subject.targetGrade) * 100 : 0;
          
          return (
            <div key={subject.id} className="glass-card rounded-2xl overflow-hidden flex flex-col">
              {/* Subject Header */}
              <div className="p-5 border-b border-border/50 bg-secondary/30 relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-serif font-bold text-foreground">{subject.name}</h3>
                  <button onClick={() => deleteSubject(subject.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                  <span>Target: <strong className="text-foreground">{subject.targetGrade}%</strong></span>
                  <span>Current: <strong className="text-foreground">{subject.currentGrade}%</strong></span>
                  <span>Exam: <strong className="text-foreground">{format(parseISO(subject.examDate), "MMM d, yyyy")}</strong></span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
              </div>

              {/* Tasks List */}
              <div className="flex-1 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Study Tasks</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCreateRecall(subject.id)}
                      className="text-xs flex items-center gap-1 text-primary hover:text-accent transition-colors font-medium"
                    >
                      <BrainCircuit size={14} /> Add Recall
                    </button>
                    <button 
                      onClick={() => setShowAddTask(subject.id)}
                      className="text-xs flex items-center gap-1 text-primary hover:text-accent transition-colors font-medium"
                    >
                      <Plus size={14} /> Add Task
                    </button>
                  </div>
                </div>

                {showAddTask === subject.id && (
                  <form onSubmit={(e) => handleAddTask(subject.id, e)} className="bg-secondary/50 p-3 rounded-xl space-y-3 animate-in fade-in">
                    <input type="text" required placeholder="Task title..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary" />
                    <div className="flex gap-2">
                      <input type="date" required value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none flex-1" />
                      <input type="number" min="0.5" step="0.5" required placeholder="Hrs" value={newTask.plannedHours || ""} onChange={e => setNewTask({...newTask, plannedHours: Number(e.target.value)})} className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none w-20" />
                      <button type="submit" className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium">Add</button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {sTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No tasks assigned yet.</p>
                  ) : (
                    sTasks.map(task => (
                      <div key={task.id} className="flex items-start gap-3 group cursor-pointer" onClick={() => toggleTask(task.id)}>
                        <button className={cn("mt-0.5 flex-shrink-0 transition-colors", task.completed ? "text-success" : "text-muted-foreground group-hover:text-primary")}>
                          {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>
                        <div className={cn("flex-1 transition-opacity", task.completed && "opacity-50 line-through")}>
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{format(parseISO(task.date), "MMM d")} • {task.plannedHours}h</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
