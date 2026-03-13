import React from "react";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <div className="glass-card p-8 rounded-2xl text-center max-w-md w-full border-destructive/20">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4 opacity-80" />
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Knowledge Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The tome you are searching for does not exist in the Aurelius archives.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
