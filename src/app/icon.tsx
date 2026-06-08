import { ImageResponse } from "next/og";
import { BRAND, loadSerifFont } from "@/lib/og-font";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const serif = await loadSerifFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BRAND.ivory,
          color: BRAND.brown,
          fontFamily: "Cormorant",
          fontSize: 18,
          letterSpacing: "-0.03em",
          fontWeight: 600,
        }}
      >
        CM
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Cormorant", data: serif, style: "normal", weight: 600 }],
    },
  );
}
