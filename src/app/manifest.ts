import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ALL IN Real Estate",
    short_name: "ALL IN",
    description: "בית תיווך יוקרתי — נדל״ן אקסקלוסיבי, ליווי אישי מהצגה ועד חתימה.",
    start_url: "/",
    display: "standalone",
    background_color: "#14110d",
    theme_color: "#14110d",
    dir: "rtl",
    lang: "he",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
