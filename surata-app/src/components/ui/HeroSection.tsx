interface HeroSectionProps {
  title: string;
  description?: string;
  accentColor?: string;
  children?: React.ReactNode;
}

export function HeroSection({
  title,
  description,
  accentColor = "cyan",
  children,
}: HeroSectionProps) {
  return (
    <div
      className={`bg-gradient-to-br from-slate-900 via-${accentColor}-950 to-slate-900 border-b border-${accentColor}-900 py-10 px-4`}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-slate-400 text-lg max-w-2xl">{description}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
