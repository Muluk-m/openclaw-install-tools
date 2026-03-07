"use client";

import { StepWizard } from "@/components/install/step-wizard";
import { macSteps } from "@/lib/install-steps";

export default function MacInstallPage() {
  return <StepWizard stepTree={macSteps} />;
}
