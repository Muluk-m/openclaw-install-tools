"use client";

import type { BranchOption } from "@/lib/install-steps";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface BranchSelectorProps {
  branches: BranchOption[];
  selectedNextStepId?: string;
  onSelect: (nextStepId: string) => void;
}

export function BranchSelector({
  branches,
  selectedNextStepId,
  onSelect,
}: BranchSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {branches.map((branch) => {
        const isSelected = selectedNextStepId === branch.nextStepId;
        return (
          <button
            key={branch.nextStepId}
            onClick={() => onSelect(branch.nextStepId)}
            className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
          >
            <div>
              <div className="font-medium">{branch.label}</div>
              {branch.description && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {branch.description}
                </div>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        );
      })}
    </div>
  );
}
