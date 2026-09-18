import axios from "axios";
import { ApiError } from "./errors.js";

const PIXABAY_ENDPOINT = "https://pixabay.com/api/";

/** The subset of Pixabay's response we actually care about. */
interface PixabayHit {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  previewURL: string;
  pageURL: string;
  tags: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
}

/** Normalized shape the frontend consumes, so swapping providers later is cheap. */
export interface SearchResult {
  providerId: string;
  thumbUrl: string;
  imageUrl: string;
  sourceUrl: string;
  tags: string[];
  width: number;
  height: number;
  author: string;
}

/**
 * Searches Pixabay and maps the response into our own shape.
 * Keeping the API key server-side is the point of proxying this
 * rather than calling Pixabay straight from the browser.
 */
export async function searchImages(
  query: string,
  page = 1,
  perPage = 30,
): Promise<{ total: number; results: SearchResult[] }> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) {
    throw new ApiError(
      503,
      "PIXABAY_API_KEY is not set. Add it to server/.env — get a free key at https://pixabay.com/api/docs/",
    );
  }

  try {
    const { data } = await axios.get(PIXABAY_ENDPOINT, {
      params: {
        key,
        q: query,
        image_type: "photo",
        safesearch: true,
        page,
        per_page: perPage,
      },
      timeout: 10_000,
    });

    const results: SearchResult[] = (data.hits as PixabayHit[]).map((hit) => ({
      providerId: String(hit.id),
      thumbUrl: hit.webformatURL,
      imageUrl: hit.largeImageURL,
      sourceUrl: hit.pageURL,
      tags: hit.tags.split(",").map((t) => t.trim()).filter(Boolean),
      width: hit.imageWidth,
      height: hit.imageHeight,
      author: hit.user,
    }));

    return { total: data.totalHits ?? results.length, results };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      throw new ApiError(429, "Pixabay rate limit reached — wait a minute and try again.");
    }
    throw new ApiError(502, "Could not reach the image provider.");
  }
}
