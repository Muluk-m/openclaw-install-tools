"use client";

import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CommandBlock } from "./command-block";
import { StepVerifier } from "./step-verifier";
import type { InstallStep } from "@/lib/install-steps";

interface StepBlockProps {
  step: InstallStep;
  index: number;
}

export function StepBlock({ step, index }: StepBlockProps) {
  const command = step.command;
  const hasPlatformCommands = step.platformCommands;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-6">
      <div className="flex items-baseline gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {index + 1}
        </span>
        <h3 className="text-lg font-semibold">{step.title}</h3>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {step.description}
      </p>

      {step.externalLink && (
        <a
          href={step.externalLink.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" }) + " w-fit"}
        >
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          {step.externalLink.label}
        </a>
      )}

      {command && !hasPlatformCommands && (
        <CommandBlock command={command} />
      )}

      {hasPlatformCommands && (
        <Tabs defaultValue="mac">
          <TabsList>
            <TabsTrigger value="mac">macOS</TabsTrigger>
            <TabsTrigger value="windows">Windows</TabsTrigger>
          </TabsList>
          {step.platformCommands!.mac && (
            <TabsContent value="mac">
              <CommandBlock
                command={step.platformCommands!.mac}
                lang="bash"
              />
            </TabsContent>
          )}
          {step.platformCommands!.windows && (
            <TabsContent value="windows">
              <CommandBlock
                command={step.platformCommands!.windows}
                lang="powershell"
              />
            </TabsContent>
          )}
        </Tabs>
      )}

      {step.expectedOutput && (
        <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            期望输出
          </p>
          <pre className="text-sm leading-relaxed">
            <code>{step.expectedOutput}</code>
          </pre>
        </div>
      )}

      {step.verifiable && (
        <StepVerifier step={step} />
      )}
    </div>
  );
}
