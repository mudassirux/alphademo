import { useState, useEffect } from 'react';
import { Select } from '@base-ui/react';
import { ChevronDown, Check } from 'lucide-react';
import { STAGES } from '../../types/contact';
import type { Stage } from '../../types/contact';
import { getStageTheme, subscribeToStageColors } from '../../utils/boardColors';

interface StageSelectProps {
  value: Stage;
  onChange: (value: Stage) => void;
}

const STAGE_DESCRIPTIONS: Record<Stage, string> = {
  Lead: 'Newly captured, exploring fit',
  Prospect: 'Engaged & active discussions',
  Qualified: 'High intent, evaluated solution',
  Customer: 'Converted, active partnership'
};

export function StageSelect({ value, onChange }: StageSelectProps) {
  const currentStage = value || 'Lead';
  const [, setVersion] = useState(0);

  useEffect(() => {
    return subscribeToStageColors(() => setVersion((v) => v + 1));
  }, []);

  const currentTheme = getStageTheme(currentStage);

  return (
    <Select.Root
      value={currentStage}
      onValueChange={(val) => {
        if (typeof val === 'string' && STAGES.includes(val as Stage)) {
          onChange(val as Stage);
        }
      }}
    >
      <Select.Trigger className="w-full flex items-center justify-between text-xs px-3 py-2 bg-white border border-[#d7d7d1] hover:border-[#b5b5ae] rounded-md text-[#2e2e2a] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all cursor-pointer">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border select-none transition-colors"
          style={{
            backgroundColor: currentTheme.pillBg,
            color: currentTheme.pillText,
            borderColor: currentTheme.swatchBorder
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: currentTheme.pillText }}
          />
          <span>{currentStage}</span>
        </span>
        <Select.Icon>
          <ChevronDown className="w-3.5 h-3.5 text-[#9b9a97] shrink-0 ml-1" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner className="select-positioner" sideOffset={4} align="start">
          <Select.Popup className="select-popup w-64">
            <div className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-wider px-2.5 py-1.5 border-b border-[#f1f1ee] mb-1">
              Select Stage
            </div>
            <Select.List>
              {STAGES.map((stage) => {
                const theme = getStageTheme(stage);
                return (
                  <Select.Item key={stage} value={stage} className="select-item py-2">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border select-none transition-colors"
                          style={{
                            backgroundColor: theme.pillBg,
                            color: theme.pillText,
                            borderColor: theme.swatchBorder
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: theme.pillText }}
                          />
                          <Select.ItemText>{stage}</Select.ItemText>
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8c8c85] pl-1">
                        {STAGE_DESCRIPTIONS[stage]}
                      </span>
                    </div>
                    <Select.ItemIndicator className="text-[#2383e2] shrink-0 ml-2">
                      <Check className="w-3.5 h-3.5" />
                    </Select.ItemIndicator>
                  </Select.Item>
                );
              })}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
