/**
 * Placeholder tiles shown while a grid loads.
 * Varying heights mimic the real masonry layout so the page doesn't
 * visibly jump when the content arrives.
 */
export function SkeletonGrid({ count = 12 }: { count?: number }) {
  const heights = [220, 300, 260, 340, 200, 280];
  return (
    <div className="masonry" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton rounded-2xl"
          style={{ height: heights[i % heights.length] }}
        />
      ))}
    </div>
  );
}
