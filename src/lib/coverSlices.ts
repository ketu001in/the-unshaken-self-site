// Shared math for slicing one "wraparound" book cover image (back cover +
// spine + front cover, laid out side by side) into the three panels used by
// the 3D book component and its admin preview.
//
// Each panel is described by its start position and width as a percentage
// (0-100) of the full image's width. Given that, we compute the CSS
// background-size / background-position needed to show *only* that panel,
// scaled to fill its container.

export type CoverLayout = "back-spine-front" | "front-spine-back";

export type CoverProportions = {
  spinePct: number; // width of the spine panel, as % of total image width
  backPct: number; // width of the back-cover panel, as % of total image width
  layout: CoverLayout;
};

export type CoverSegment = "front" | "spine" | "back";

export type CoverSliceStyle = {
  backgroundSize: string;
  backgroundPosition: string;
};

function segmentBounds(seg: CoverSegment, { spinePct, backPct, layout }: CoverProportions) {
  const frontPct = Math.max(0, 100 - spinePct - backPct);
  const order: CoverSegment[] =
    layout === "front-spine-back" ? ["front", "spine", "back"] : ["back", "spine", "front"];
  const widths: Record<CoverSegment, number> = { back: backPct, spine: spinePct, front: frontPct };

  let start = 0;
  for (const s of order) {
    if (s === seg) return { start, width: widths[s] };
    start += widths[s];
  }
  return { start: 0, width: widths[seg] };
}

/**
 * Returns the backgroundSize / backgroundPosition needed to isolate one
 * panel of a wraparound cover image inside its own box.
 */
export function getCoverSliceStyle(
  seg: CoverSegment,
  proportions: CoverProportions
): CoverSliceStyle {
  const { start, width } = segmentBounds(seg, proportions);
  const safeWidth = Math.min(99.9, Math.max(0.1, width));

  const backgroundSizeX = (10000 / safeWidth).toFixed(3); // (100*100)/segPct
  const backgroundPositionX = ((100 * start) / (100 - safeWidth || 1)).toFixed(3);

  return {
    backgroundSize: `${backgroundSizeX}% 100%`,
    backgroundPosition: `${backgroundPositionX}% center`,
  };
}

export const DEFAULT_COVER_PROPORTIONS: CoverProportions = {
  spinePct: 8,
  backPct: 46,
  layout: "back-spine-front",
};
