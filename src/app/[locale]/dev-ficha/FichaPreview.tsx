"use client";

import dynamic from "next/dynamic";
import type { FichaPropiedadProps } from "@/sanity/ficha/FichaPropiedad";

const Viewer = dynamic(() => import("./Viewer"), {
  ssr: false,
  loading: () => <p style={{ padding: 24, fontFamily: "sans-serif" }}>…</p>,
});

export function FichaPreview(props: FichaPropiedadProps) {
  return <Viewer {...props} />;
}
