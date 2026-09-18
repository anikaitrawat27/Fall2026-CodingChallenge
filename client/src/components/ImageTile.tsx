import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { SearchResult } from "../lib/types";
import { Button } from "./Button";

interface Props {
  image: SearchResult;
  onSave: (image: SearchResult) => void;
  /** Set once this image has been saved, so the button can confirm it. */
  saved?: boolean;
}

/** A search result with a hover overlay for saving it to a board. */
export function ImageTile({ image, onSave, saved = false }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className="group relative overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* The wrapper holds the image's real aspect ratio so the masonry
          layout doesn't reflow when the picture arrives.

          The image must stay in the layout (faded out, not display:none)
          while it loads: a lazy image that is display:none is never treated
          as on-screen, so the browser would never load it and onLoad would
          never fire. The skeleton is layered on top instead. */}
      <div
        className="relative w-full"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        {!loaded && <div className="skeleton absolute inset-0" aria-hidden />}
        <img
          src={image.thumbUrl}
          alt={image.tags.slice(0, 3).join(", ") || "Search result"}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          // Treat a failed load as settled too, otherwise a broken image
          // would shimmer forever.
          onError={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <figcaption
        className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t
          from-black/70 via-black/0 to-black/40 p-3 opacity-0 transition group-hover:opacity-100
          group-focus-within:opacity-100"
      >
        <div className="pointer-events-auto flex justify-end">
          <Button size="sm" variant={saved ? "secondary" : "primary"} onClick={() => onSave(image)}>
            {saved ? "Saved" : "Save"}
          </Button>
        </div>

        <div className="pointer-events-auto flex items-end justify-between gap-2">
          <span className="truncate text-xs font-medium text-white/90">{image.author}</span>
          <a
            href={image.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Open original on Pixabay"
            className="rounded-full bg-white/90 p-1.5 text-ink transition hover:bg-white"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </figcaption>
    </figure>
  );
}
