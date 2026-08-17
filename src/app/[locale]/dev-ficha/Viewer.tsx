"use client";

import { PDFViewer } from "@react-pdf/renderer";
import {
  FichaPropiedad,
  type FichaPropiedadProps,
} from "@/sanity/ficha/FichaPropiedad";

/** Dev-only preview host. Loaded with `ssr: false` — @react-pdf/renderer and
 *  the font registration in `ficha/fonts.ts` are browser-only. */
export default function Viewer(props: FichaPropiedadProps) {
  return (
    <PDFViewer style={{ width: "100vw", height: "100vh", border: "none" }}>
      <FichaPropiedad {...props} />
    </PDFViewer>
  );
}
