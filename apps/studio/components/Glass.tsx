interface GlassProps {
  children: React.ReactNode;
  className?: string;
}

export function Glass({ children, className = "" }: GlassProps) {
  return (
    <div
      className={`rounded-2xl p-4 shadow-xl ${className}`}
      style={{
        backgroundColor: "var(--glass)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(20px)",
      }}
    >
      {children}
    </div>
  );
}
