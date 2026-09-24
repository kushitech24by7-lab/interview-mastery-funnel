import { ImageResponse } from "next/og";

/**
 * Apple touch icon.
 *
 * Generated as PNG rather than shipped as SVG: iOS does not support SVG for
 * apple-touch-icon, so an .svg file here is silently ignored and the home
 * screen falls back to a screenshot of the page. Matches the /icon.svg
 * monogram — navy field, white "IM", gold check.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          position: "relative",
          background: "#0b1424",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -2,
          }}
        >
          IM
        </div>
        {/*
          The checkmark is DRAWN, not typed. ImageResponse fetches a font per
          glyph at build time; "✓" is outside the default subset and failed to
          download, which would have rendered a blank box on every iOS home
          screen. Two rotated bars have no font dependency at all.
        */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 20,
            bottom: 24,
            width: 50,
            height: 50,
            borderRadius: 25,
            background: "#f0b429",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", position: "relative", width: 26, height: 26 }}>
            <div
              style={{
                position: "absolute",
                left: 2,
                top: 12,
                width: 11,
                height: 5,
                borderRadius: 3,
                background: "#0b1424",
                transform: "rotate(45deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 7,
                top: 9,
                width: 19,
                height: 5,
                borderRadius: 3,
                background: "#0b1424",
                transform: "rotate(-45deg)",
              }}
            />
          </div>
        </div>
      </div>
    ),
    size
  );
}
