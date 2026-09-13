interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  accentColor = "cyan",
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className={`text-2xl font-bold text-${accentColor}-400`}>{title}</h2>
        {subtitle && (
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
