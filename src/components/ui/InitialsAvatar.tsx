import { UserRound } from 'lucide-react';
import { getInitials } from '../../utils/initials';
import { getPastelColor } from '../../utils/avatarColor';

interface InitialsAvatarProps {
  name: string;
  variant?: 'contact' | 'owner';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InitialsAvatar({
  name,
  variant = 'contact',
  size = 'md',
  className = ''
}: InitialsAvatarProps) {
  const isUnassigned = !name || name.trim() === '' || name === 'Unassigned';

  if (isUnassigned && variant === 'owner') {
    return (
      <span
        className={`rounded-full bg-[#f1f1ee] border border-[#e4e4df] flex items-center justify-center text-[#9b9a97] shrink-0 aspect-square ${
          size === 'lg'
            ? 'w-9 h-9 min-w-9 max-w-9'
            : size === 'sm'
            ? 'w-4 h-4 min-w-4 max-w-4'
            : 'w-5 h-5 min-w-5 max-w-5'
        } ${className}`}
      >
        <UserRound className={size === 'lg' ? 'w-5 h-5' : 'w-3 h-3'} />
      </span>
    );
  }

  const inits = getInitials(name);

  // Variant: Contact (Strict fixed-size squircle with gentle padding)
  if (variant === 'contact') {
    const pastel = getPastelColor(name);
    const sizeClasses =
      size === 'lg'
        ? 'w-10 h-10 min-w-10 max-w-10 aspect-square rounded-lg text-sm font-semibold'
        : size === 'sm'
        ? 'w-[18px] h-[18px] min-w-[18px] max-w-[18px] aspect-square rounded-[5px] text-[8px] font-medium'
        : 'w-[22px] h-[22px] min-w-[22px] max-w-[22px] aspect-square rounded-[6px] text-[9.5px] font-medium p-0.5';

    return (
      <span
        className={`inline-flex items-center justify-center border tracking-normal leading-none shrink-0 select-none shadow-2xs ${sizeClasses} ${className}`}
        style={{
          backgroundColor: pastel.bg,
          color: pastel.text,
          borderColor: pastel.border
        }}
        aria-hidden="true"
      >
        {inits}
      </span>
    );
  }

  // Variant: Owner (Strict fixed-size circular badge)
  const ownerSizeClasses =
    size === 'lg'
      ? 'w-9 h-9 min-w-9 max-w-9 aspect-square rounded-full text-xs font-medium'
      : size === 'sm'
      ? 'w-4 h-4 min-w-4 max-w-4 aspect-square rounded-full text-[8px] font-medium'
      : 'w-5 h-5 min-w-5 max-w-5 aspect-square rounded-full text-[9px] font-medium';

  return (
    <span
      className={`inline-flex items-center justify-center bg-[#f0f0ed] text-[#55554e] border border-[#e4e4df] leading-none shrink-0 select-none ${ownerSizeClasses} ${className}`}
      aria-hidden="true"
    >
      {inits}
    </span>
  );
}
