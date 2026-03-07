"use client";

import type { StepNode } from "@/lib/install-steps";
import { CommandBlock } from "./command-block";
import { BranchSelector } from "./branch-selector";
import { Badge } from "@/components/ui/badge";

interface StepCardProps {
  step: StepNode;
  stepNumber: number;
  totalSteps: number;
  selectedBranch?: string;
  onBranchSelect: (nextStepId: string) => void;
}

export function StepCard({
  step,
  stepNumber,
  totalSteps,
  selectedBranch,
  onBranchSelect,
}: StepCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Badge variant="secondary">
          {step.isFinal ? "完成" : `${stepNumber} / ${totalSteps}`}
        </Badge>
        <h2 className="text-xl font-semibold">{step.title}</h2>
      </div>

      {step.description && (
        <p className="text-muted-foreground">{step.description}</p>
      )}

      {step.commands?.map((cmd, i) => (
        <CommandBlock key={i} command={cmd.command} lang={cmd.lang} />
      ))}

      {step.branches && (
        <BranchSelector
          branches={step.branches}
          selectedNextStepId={selectedBranch}
          onSelect={onBranchSelect}
        />
      )}
    </div>
  );
}
