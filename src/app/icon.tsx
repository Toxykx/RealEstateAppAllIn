import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Gold "A" monogram matching BrandLogo's mark, rendered as the PWA/app icon.
// A generic serif fallback is used (no next/font import needed inside
// ImageResponse) since a single glyph doesn't need the full Frank Ruhl Libre
// font file loaded just for icon generation.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14110d",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "62%",
            height: "62%",
            border: "6px solid #c9a873",
            color: "#c9a873",
            fontFamily: "serif",
            fontSize: 220,
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size },
  );
}
