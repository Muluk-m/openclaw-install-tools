"use client";

import { StepWizard } from "@/components/install/step-wizard";
import { windowsSteps } from "@/lib/install-steps";

export default function WindowsInstallPage() {
  return <StepWizard stepTree={windowsSteps} />;
}
