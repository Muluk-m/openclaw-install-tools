"use client";

import { installSteps, phaseLabels, type Phase } from "@/lib/install-steps";
import { StepBlock } from "@/components/install/step-block";

const phases: Phase[] = ["environment", "openclaw", "feishu"];

export default function InstallPage() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="text-3xl font-bold">安装 OpenClaw</h1>
        <p className="mt-2 text-muted-foreground">
          按顺序执行以下步骤，每一步都可以用 AI
          验证你的输出是否正确
        </p>
      </div>

      {phases.map((phase) => {
        const steps = installSteps.filter((s) => s.phase === phase);
        if (steps.length === 0) return null;

        return (
          <section key={phase} className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">
              {phaseLabels[phase]}
            </h2>
            {steps.map((step) => (
              <StepBlock
                key={step.id}
                step={step}
                index={installSteps.indexOf(step)}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
