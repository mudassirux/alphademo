import { Select } from '@base-ui/react';
import { ChevronDown, Check } from 'lucide-react';
import { OWNERS } from '../../types/contact';
import { InitialsAvatar } from './InitialsAvatar';

interface OwnerSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function OwnerSelect({ value, onChange }: OwnerSelectProps) {
  const currentOwner = value || 'Unassigned';

  return (
    <Select.Root
      value={currentOwner}
      onValueChange={(val) => {
        if (typeof val === 'string') {
          onChange(val);
        }
      }}
    >
      <Select.Trigger className="w-full flex items-center justify-between text-xs px-3 py-2 bg-white border border-[#d7d7d1] hover:border-[#b5b5ae] rounded-md text-[#2e2e2a] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all cursor-pointer">
        <div className="flex items-center gap-2 truncate">
          <InitialsAvatar name={currentOwner} variant="owner" />
          <span className={`truncate ${currentOwner === 'Unassigned' ? 'text-[#9b9a97] italic' : ''}`}>
            {currentOwner}
          </span>
        </div>
        <Select.Icon>
          <ChevronDown className="w-3.5 h-3.5 text-[#9b9a97] shrink-0 ml-1" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner className="select-positioner" sideOffset={4} align="start">
          <Select.Popup className="select-popup w-56">
            <div className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-wider px-2.5 py-1.5 border-b border-[#f1f1ee] mb-1">
              Select Owner
            </div>
            <Select.List>
              {OWNERS.map((owner) => (
                <Select.Item key={owner} value={owner} className="select-item">
                  <div className="flex items-center gap-2 min-w-0">
                    <InitialsAvatar name={owner} variant="owner" />
                    <Select.ItemText className="truncate">
                      {owner}
                    </Select.ItemText>
                  </div>
                  <Select.ItemIndicator className="text-[#2383e2] shrink-0 ml-2">
                    <Check className="w-3.5 h-3.5" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
