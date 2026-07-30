import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icon: same mark as icon.tsx, sized/bordered for the
// smaller apple-touch-icon slot (iOS ignores manifest icons for the home
// screen and only reads this file).
export default function AppleIcon() {
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
            width: "64%",
            height: "64%",
            border: "4px solid #c9a873",
            color: "#c9a873",
            fontFamily: "serif",
            fontSize: 78,
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size },
  );
}
