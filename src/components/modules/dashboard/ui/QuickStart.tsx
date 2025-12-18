'use client';

import { ChevronRight } from 'lucide-react';
import { useQuickStart } from '@/components/modules/dashboard/hooks/useQuickStart';

export function QuickStart() {
  const { steps, onStepClick } = useQuickStart();

  return (
    <div className="space-y-5">
      {steps.map((step) => (
        <div
          key={step.number}
          onClick={() => onStepClick(step.number)}
          className="group/item flex items-start gap-5 p-5 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 cursor-pointer"
        >
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{step.number}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-base lg:text-lg font-semibold text-white mb-1 text-pretty">
              {step.title}
            </h3>
            <p className="text-sm text-gray-400 text-pretty">{step.description}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover/item:text-white transition-colors shrink-0 mt-2" />
        </div>
      ))}
    </div>
  );
}

export default QuickStart;
