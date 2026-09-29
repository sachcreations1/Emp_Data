
"use client";
import type { Employee } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import React from 'react';

interface EmployeeCardProps {
  employee: Employee;
  isSelected: boolean;
  isSelectionMode: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function EmployeeCard({ employee, isSelected, isSelectionMode, onClick, onContextMenu }: EmployeeCardProps) {
  const { id, name, empId, photo, department } = employee;

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "w-full bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm transition-all flex items-center gap-4 relative cursor-pointer",
        isSelected ? "ring-2 ring-primary bg-primary/10" : "hover:shadow-md"
      )}
    >
      {isSelectionMode && (
        <div className="absolute top-2 right-2 text-primary">
          {isSelected ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <div className="h-6 w-6 rounded-full border-2 border-slate-300 bg-white" />
          )}
        </div>
      )}
      <img
        src={photo || `https://api.dicebear.com/8.x/initials/svg?seed=${name}`}
        alt={name}
        className="w-14 h-14 rounded-full object-cover bg-slate-200"
      />
      <div className="flex-1">
        <h3 className="font-bold text-slate-800 uppercase tracking-wide">{name}</h3>
        <p className="text-sm text-slate-500">
          #{empId} • {department || 'N/A'}
        </p>
      </div>
      {!isSelectionMode && <ChevronRight className="h-5 w-5 text-slate-400" />}
    </div>
  );
}
