"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";
import { sceneState, setFormation, type Formation } from "@/lib/scene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// A page section that tells the voxel scene which shape to form while it is centred
export function FormationSection({
  id,
  formation,
  className,
  children,
}: {
  id?: string;
  formation: Formation;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) setFormation(formation);
      },
      onUpdate: (self) => {
        if (self.isActive) sceneState.progress = self.progress;
      },
    });
  });

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}
