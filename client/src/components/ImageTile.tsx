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
      {/* Reserve the image's real aspect ratio so the masonry layout
          doesn't reflow when the picture finishes loading. */}
      {!loaded && (
        <div
          className="skeleton w-full rounded-2xl"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        />
      )}
      <img
        src={image.thumbUrl}
        alt={image.tags.slice(0, 3).join(", ") || "Search result"}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full object-cover transition duration-300 ${loaded ? "block" : "hidden"}`}
      />

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
