interface GlassProps {
  children: React.ReactNode;
  className?: string;
}

export function Glass({ children, className = "" }: GlassProps) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}
