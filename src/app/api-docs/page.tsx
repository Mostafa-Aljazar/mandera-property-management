import type { Metadata } from "next";
import { SwaggerViewer } from "./SwaggerViewer";

export const metadata: Metadata = {
  title: "API Docs — Mandera",
  description: "Swagger UI for the Mandera Owner API (/api/v1/*), served from /openapi.yaml.",
};

export default function ApiDocsPage() {
  return <SwaggerViewer />;
}
