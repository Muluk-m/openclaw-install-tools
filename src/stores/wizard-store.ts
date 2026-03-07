import { create } from "zustand";
import type { StepTree } from "@/lib/install-steps";

interface WizardState {
  stepTree: StepTree | null;
  currentStepId: string;
  history: string[];
  branchSelections: Record<string, string>;
  setStepTree: (tree: StepTree) => void;
  goToStep: (stepId: string) => void;
  goBack: () => void;
  selectBranch: (stepId: string, nextStepId: string) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  stepTree: null,
  currentStepId: "",
  history: [],
  branchSelections: {},

  setStepTree: (tree) =>
    set({
      stepTree: tree,
      currentStepId: tree.startStepId,
      history: [],
      branchSelections: {},
    }),

  goToStep: (stepId) =>
    set((state) => ({
      history: [...state.history, state.currentStepId],
      currentStepId: stepId,
    })),

  goBack: () =>
    set((state) => {
      const history = [...state.history];
      const previousStepId = history.pop();
      if (!previousStepId) return state;
      return { history, currentStepId: previousStepId };
    }),

  selectBranch: (stepId, nextStepId) => {
    const { goToStep } = get();
    set((state) => ({
      branchSelections: { ...state.branchSelections, [stepId]: nextStepId },
    }));
    goToStep(nextStepId);
  },

  reset: () =>
    set((state) => ({
      currentStepId: state.stepTree?.startStepId ?? "",
      history: [],
      branchSelections: {},
    })),
}));
