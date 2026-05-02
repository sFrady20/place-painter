import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Place Painter",
    short_name: "Place Painter",
    icons: [
      {
        src: "/icon.svg",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "1024x1024",
        type: "image/svg",
        purpose: "maskable",
      },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
    start_url: "/?source=pwa",
    scope: "/",
    orientation: "portrait",
  };
}
