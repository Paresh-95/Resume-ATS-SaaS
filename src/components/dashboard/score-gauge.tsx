function getScoreColor(score: number) {
  if (score >= 80) return "var(--chart-2, #22c55e)";
  if (score >= 60) return "var(--chart-4, #eab308)";
  return "var(--destructive, #ef4444)";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Weak";
}

export function ScoreGauge({ score, size = 140 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${clamped * 3.6}deg, var(--muted) 0deg)`,
      }}
    >
      <div
        className="absolute flex flex-col items-center justify-center rounded-full bg-background"
        style={{ width: size - 18, height: size - 18 }}
      >
        <span className="text-3xl font-bold tracking-tight">{Math.round(clamped)}</span>
        <span className="text-xs font-medium text-muted-foreground">{getScoreLabel(clamped)}</span>
      </div>
    </div>
  );
}
