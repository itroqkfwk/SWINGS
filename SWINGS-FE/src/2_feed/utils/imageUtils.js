import { UPLOADS_BASE_URL } from "../../config/runtime";

export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== "string" || url === "null") {
    return "/default-profile.jpg";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }

  return `${UPLOADS_BASE_URL}/${encodeURIComponent(url)}`;
};
