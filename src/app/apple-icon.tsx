import { ImageResponse } from "next/og";
import { BRAND, loadSerifFont } from "@/lib/og-font";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
          fontSize: 104,
          letterSpacing: "-0.05em",
          borderBottom: `4px solid ${BRAND.clay}`,
        }}
      >
        CM
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
