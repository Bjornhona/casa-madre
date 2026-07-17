import { ImageResponse } from "next/og";
import { BRAND, loadSerifFont } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Casa Madre — Beyond Real Estate";

export default async function OpengraphImage() {
  const serif = await loadSerifFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BRAND.ivory,
          fontFamily: "Cormorant",
        }}
      >
        <div
          style={{
            fontSize: 120,
            lineHeight: 1,
            color: BRAND.brown,
            letterSpacing: "-0.06em",
          }}
        >
          CM
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 48,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: BRAND.deep,
            paddingLeft: "0.22em",
          }}
        >
          Casa Madre
        </div>
        <div
          style={{
            marginTop: 30,
            width: 140,
            height: 1,
            backgroundColor: BRAND.clay,
          }}
        />
        <div
          style={{
            marginTop: 26,
            fontSize: 20,
            textTransform: "uppercase",
            letterSpacing: "0.42em",
            color: BRAND.muted,
            fontFamily: "sans-serif",
            paddingLeft: "0.42em",
          }}
        >
          Beyond Real Estate
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: serif, style: "normal", weight: 600 },
      ],
    },
  );
}
