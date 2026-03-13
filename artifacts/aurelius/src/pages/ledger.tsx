import React, { useState } from "react";
import { useStudy } from "@/context/StudyContext";
import { calculatePerformanceDelta, cn } from "@/lib/utils";
import { ArrowUpDown, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

type SortKey = "name" | "currentGrade" | "targetGrade" | "difficulty" | "examDate" | "delta";

export default function AcademicLedger() {
  const { subjects } = useStudy();
  const [sortKey, setSortKey] = useState<SortKey>("delta");
  const [sortAsc, setSortAsc] = useState(false);

  const tableData = subjects.map(s => ({
    ...s,
    delta: calculatePerformanceDelta(s.currentGrade, s.targetGrade, s.difficulty, s.examDate)
  }));

  const sortedData = [...tableData].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    
    if (sortKey === "examDate") {
      valA = new Date(valA as string).getTime();
      valB = new Date(valB as string).getTime();
    }
    
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const getUrgencyColor = (delta: number) => {
    if (delta > 3) return "bg-destructive/10 text-destructive border-destructive/20";
    if (delta > 1.5) return "bg-warning/10 text-warning border-warning/20";
    return "bg-success/10 text-success border-success/20";
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-4xl font-serif font-bold text-foreground">Academic Ledger</h1>
        <p className="text-muted-foreground mt-1 text-lg">Quantitative analysis of academic standing.</p>
      </header>

      <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border/80">
                {[
                  { key: "name", label: "Subject" },
                  { key: "currentGrade", label: "Current Grade" },
                  { key: "targetGrade", label: "Target Grade" },
                  { key: "difficulty", label: "Difficulty" },
                  { key: "examDate", label: "Exam Date" },
                  { key: "delta", label: "Performance Delta" },
                ].map(({ key, label }) => (
                  <th 
                    key={key}
                    onClick={() => handleSort(key as SortKey)}
                    className="p-4 font-semibold text-sm text-foreground uppercase tracking-wider cursor-pointer hover:bg-secondary transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      {label}
                      <ArrowUpDown size={14} className={cn("text-muted-foreground", sortKey === key && "text-accent")} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No subjects in ledger. Add subjects in the Planner.
                  </td>
                </tr>
              ) : (
                sortedData.map(subject => (
                  <tr key={subject.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-medium text-foreground">{subject.name}</td>
                    <td className="p-4 text-muted-foreground">{subject.currentGrade}%</td>
                    <td className="p-4 text-muted-foreground">{subject.targetGrade}%</td>
                    <td className="p-4 text-muted-foreground">Level {subject.difficulty}</td>
                    <td className="p-4 text-muted-foreground">{format(parseISO(subject.examDate), "MMM d, yyyy")}</td>
                    <td className="p-4">
                      <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", getUrgencyColor(subject.delta))}>
                        {subject.delta > 3 && <AlertCircle size={14} />}
                        {subject.delta.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
