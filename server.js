const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PUBLIC_DIR = path.join(__dirname, "public");
const ASSETS_DIR = path.join(__dirname, "assets");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
  ".ico": "image/x-icon",
};

function sendErrorPage(response, statusCode, fileName) {
  const filePath = path.join(ASSETS_DIR, fileName);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(statusCode, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end(
        statusCode === 404 ? "404 - Not Found" : "500 - Internal Server Error"
      );
      return;
    }

    response.writeHead(statusCode, {
      "Content-Type": "text/html; charset=utf-8",
    });
    response.end(content);
  });
}

function requestHandler(request, response) {
  const parsedUrl = url.parse(request.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname || "/");

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const filePath = path.resolve(PUBLIC_DIR, `.${pathname}`);

  if (
    filePath !== PUBLIC_DIR &&
    !filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)
  ) {
    sendErrorPage(response, 404, "404.html");
    return;
  }

  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT" || error.code === "EISDIR") {
        sendErrorPage(response, 404, "404.html");
      } else {
        console.error("Error reading file:", error);
        sendErrorPage(response, 500, "500.html");
      }
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentType,
    });

    response.end(content);
  });
}

if (process.env.NODE_ENV !== "production") {
  const hostname = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT) || 3000;

  http.createServer(requestHandler).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

module.exports = requestHandler;
