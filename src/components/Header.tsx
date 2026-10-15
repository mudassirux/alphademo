interface HeaderProps {
  totalCount: number;
}

export function Header({ totalCount: _totalCount }: HeaderProps) {
  return (
    <header className="pt-8 pb-3 px-6 sm:px-10 lg:px-12 w-full">
      <div className="flex items-center gap-2.5 flex-wrap mb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e2e2a] tracking-tight">
          Contact Directory
        </h1>
      </div>
      <p className="text-xs sm:text-sm text-[#787774]">
        Business Contacts
      </p>
    </header>
  );
}
