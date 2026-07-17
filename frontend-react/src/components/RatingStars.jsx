export function RatingStars({ rating = 0, size = 'text-sm' }) {
  const rounded = Math.round(rating);
  return (
    <span className={`${size} tracking-tight text-ink`}>
      {'★'.repeat(rounded)}
      <span className="text-ink/15">{'★'.repeat(5 - rounded)}</span>
    </span>
  );
}
