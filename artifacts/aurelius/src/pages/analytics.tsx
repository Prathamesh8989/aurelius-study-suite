import React from "react";
import { useStudy } from "@/context/StudyContext";
import { calculatePerformanceDelta } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function Analytics() {
  const { subjects, studyTasks, pomodoroStats, recallSessions } = useStudy();

  // Data for Bar Chart (Hours planned vs actual per subject)
  // Simple simulation: assuming if task is complete, plannedHours were spent.
  const hoursData = subjects.map(s => {
    const sTasks = studyTasks.filter(t => t.subjectId === s.id);
    const planned = sTasks.reduce((acc, t) => acc + t.plannedHours, 0);
    const completed = sTasks.filter(t => t.completed).reduce((acc, t) => acc + t.plannedHours, 0);
    return { name: s.name.substring(0, 10) + (s.name.length > 10 ? "..." : ""), planned, completed };
  });

  // Data for Pie Chart (Urgency Distribution)
  const deltas = subjects.map(s => calculatePerformanceDelta(s.currentGrade, s.targetGrade, s.difficulty, s.examDate));
  let high = 0, med = 0, low = 0;
  deltas.forEach(d => {
    if (d > 3) high++;
    else if (d > 1.5) med++;
    else low++;
  });
  const pieData = [
    { name: 'High Urgency', value: high, color: 'hsl(var(--destructive))' },
    { name: 'Medium Urgency', value: med, color: 'hsl(var(--warning))' },
    { name: 'Low Urgency', value: low, color: 'hsl(var(--success))' },
  ].filter(d => d.value > 0);

  // Data for Line Chart (Recalls completed vs total over abstract time)
  // Simplification for UI demonstration
  const completedRecalls = recallSessions.filter(r => r.completed).length;
  const totalRecalls = recallSessions.length;

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-4xl font-serif font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-lg">Insights into your study patterns.</p>
      </header>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Pomodoros", value: pomodoroStats.totalCompleted },
          { label: "Tasks Completed", value: studyTasks.filter(t=>t.completed).length },
          { label: "Recall Sessions", value: `${completedRecalls}/${totalRecalls}` },
          { label: "Avg Grade", value: `${subjects.length ? Math.round(subjects.reduce((a,b)=>a+b.currentGrade,0)/subjects.length) : 0}%` },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl text-center">
            <p className="text-3xl font-serif font-bold text-accent">{stat.value}</p>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hours Allocation Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-serif font-bold text-foreground mb-6">Time Allocation (Hours)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--secondary))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                />
                <Bar dataKey="planned" name="Planned" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} />
                <Bar dataKey="completed" name="Completed" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgency Distribution */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center">
          <h3 className="text-xl font-serif font-bold text-foreground mb-2 w-full text-left">Urgency Distribution</h3>
          <div className="h-[300px] w-full flex justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
            )}
          </div>
          {/* Custom Legend */}
          <div className="flex gap-4 mt-4">
            {pieData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-muted-foreground">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
