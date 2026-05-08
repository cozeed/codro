export const AttentionAnimation = ({ className }: { className?: string }) => {
  return (
    <span className={`absolute top-0 left-3 flex h-1.5 w-1.5 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75"></span>
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-200"></span>
    </span>
  );
};
