interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
}

export function NeonButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "primary",
}: NeonButtonProps) {
  const baseClass = "px-4 py-2 rounded-xl text-white font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryClass = "bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 hover:scale-105 shadow-lg hover:shadow-purple-500/25";
  const secondaryClass = "bg-white/10 border border-white/20 hover:bg-white/20";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variant === "primary" ? primaryClass : secondaryClass}`}
    >
      {children}
    </button>
  );
}
