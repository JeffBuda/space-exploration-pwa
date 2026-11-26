export function StarMapBackground() {
  return (
    <div className="absolute inset-0 h-full w-full opacity-[0.03]">
      <svg width="100%" height="100%">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
