interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  className?: string;
}

export function NeonButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "primary",
  className = "",
}: NeonButtonProps) {
  const baseClass = "px-4 py-2 rounded-xl text-white font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70";
  const primaryClass = "bg-gradient-to-r from-purple-600 via-sky-500 to-emerald-400 hover:scale-[1.02] shadow-lg hover:shadow-purple-500/30";
  const secondaryClass = "bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variant === "primary" ? primaryClass : secondaryClass} ${className}`}
    >
      {children}
    </button>
  );
}
