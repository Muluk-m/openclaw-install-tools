"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWizardStore } from "@/stores/wizard-store";
import { StepCard } from "./step-card";
import type { StepTree } from "@/lib/install-steps";

interface StepWizardProps {
  stepTree: StepTree;
}

export function StepWizard({ stepTree }: StepWizardProps) {
  const {
    currentStepId,
    history,
    branchSelections,
    setStepTree,
    goToStep,
    goBack,
    selectBranch,
    reset,
  } = useWizardStore();

  useEffect(() => {
    setStepTree(stepTree);
  }, [stepTree, setStepTree]);

  const currentStep = currentStepId ? stepTree.steps[currentStepId] : null;
  if (!currentStep) return null;

  const handleNext = () => {
    if (currentStep.nextStepId) {
      goToStep(currentStep.nextStepId);
    }
  };

  const canGoBack = history.length > 0;
  const canGoNext = !currentStep.branches && !currentStep.isFinal && currentStep.nextStepId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{stepTree.title}</h1>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="mr-1 h-4 w-4" />
          重新开始
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <StepCard
                step={currentStep}
                stepNumber={history.length + 1}
                totalSteps={Object.keys(stepTree.steps).length}
                selectedBranch={branchSelections[currentStepId]}
                onBranchSelect={(nextStepId) =>
                  selectBranch(currentStepId, nextStepId)
                }
              />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={!canGoBack}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          上一步
        </Button>

        {currentStep.isFinal ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">安装完成!</span>
          </div>
        ) : canGoNext ? (
          <Button onClick={handleNext}>
            下一步
          </Button>
        ) : null}
      </div>
    </div>
  );
}
