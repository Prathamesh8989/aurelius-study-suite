import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Calculate Performance Delta
// higher = more urgent
export function calculatePerformanceDelta(
  current: number,
  target: number,
  difficulty: number,
  examDate: string
): number {
  const now = new Date();
  const exam = new Date(examDate);
  const daysUntilExam = Math.max(1, Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  const gap = Math.max(0, target - current);
  return (gap * difficulty) / daysUntilExam;
}
