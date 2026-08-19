"use client";

import { useEffect, useRef } from "react";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`فشل تحميل ${src}`));
    document.body.appendChild(script);
  });
}

export function SwaggerViewer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      await loadScript("/swagger-ui/swagger-ui-bundle.js");
      await loadScript("/swagger-ui/swagger-ui-standalone-preset.js");

      const w = window as unknown as {
        SwaggerUIBundle: any;
        SwaggerUIStandalonePreset: any;
      };

      w.SwaggerUIBundle({
        url: "/openapi.yaml",
        dom_id: "#swagger-ui",
        presets: [w.SwaggerUIBundle.presets.apis, w.SwaggerUIStandalonePreset],
        layout: "StandaloneLayout",
        deepLinking: true,
        docExpansion: "list",
      });
    })();
  }, []);

  return (
    <div dir="ltr" lang="en" style={{ background: "#fff", minHeight: "100vh" }}>
      <link rel="stylesheet" href="/swagger-ui/swagger-ui.css" />
      <div id="swagger-ui" />
    </div>
  );
}
