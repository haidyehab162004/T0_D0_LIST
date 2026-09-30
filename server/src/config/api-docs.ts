import { existsSync } from "node:fs";
import path from "node:path";

import type { Express, Request, Response } from "express";

const SWAGGER_UI_VERSION = "5.33.0";

const swaggerUiCssUrl =
  `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css`;
const swaggerUiBundleUrl =
  `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js`;
const swaggerUiStandalonePresetUrl =
  `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-standalone-preset.js`;

function resolveOpenApiPath(): string {
  const candidates = [
    path.resolve(process.cwd(), "../docs/api/openapi.yaml"),
    path.resolve(process.cwd(), "docs/api/openapi.yaml"),
  ];

  const openApiPath = candidates.find((candidate) => existsSync(candidate));

  if (!openApiPath) {
    throw new Error(
      "OpenAPI specification not found. Expected docs/api/openapi.yaml at the project root.",
    );
  }

  return openApiPath;
}

const openApiPath = resolveOpenApiPath();

const swaggerHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Todo App API Docs</title>
    <link rel="stylesheet" href="${swaggerUiCssUrl}" />
    <style>
      html {
        box-sizing: border-box;
        overflow-y: scroll;
      }

      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }

      body {
        margin: 0;
        background: #fafafa;
      }

      .swagger-ui .topbar {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="${swaggerUiBundleUrl}"></script>
    <script src="${swaggerUiStandalonePresetUrl}"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/api-docs/openapi.yaml",
          dom_id: "#swagger-ui",
          deepLinking: true,
          displayRequestDuration: true,
          filter: true,
          persistAuthorization: true,
          tryItOutEnabled: true,
          withCredentials: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset,
          ],
          layout: "StandaloneLayout",
        });
      };
    </script>
  </body>
</html>`;

export function registerApiDocs(app: Express): void {
  app.get("/api-docs/openapi.yaml", (_request: Request, response: Response) => {
    response.setHeader("Cache-Control", "no-store");
    response.type("application/yaml");
    response.sendFile(openApiPath);
  });

  app.get(["/api-docs", "/api-docs/"], (_request: Request, response: Response) => {
    response.type("html").send(swaggerHtml);
  });
}
