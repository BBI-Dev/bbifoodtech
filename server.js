const fs = require("fs");
const path = require("path");

const MIME_TYPES = {
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

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const ASSETS_DIR = path.join(ROOT, "assets");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

const htmlStart = readFile(path.join(ASSETS_DIR, "htmlstart.html"));
const htmlEnd = readFile(path.join(ASSETS_DIR, "htmlend.html"));

function sendError(res, statusCode, fileName) {
  try {
    const content = readFile(path.join(ASSETS_DIR, fileName));

    res.statusCode = statusCode;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(htmlStart + content + htmlEnd);
  } catch {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(statusCode === 404 ? "404 Not Found" : "500 Internal Server Error");
  }
}

module.exports = (req, res) => {
  try {
    let requestPath = req.url ? req.url.split("?")[0] : "/";

    if (requestPath === "/") {
      requestPath = "/index.html";
    }

    // Prevent path traversal.
    requestPath = path.posix.normalize(requestPath);

    if (
      requestPath.includes("..") ||
      requestPath.includes("\0")
    ) {
      return sendError(res, 404, "404.html");
    }

    const filePath = path.join(PUBLIC_DIR, requestPath);

    // Make sure the resolved path remains inside /public.
    const publicRoot = path.resolve(PUBLIC_DIR);
    const resolvedPath = path.resolve(filePath);

    if (
      resolvedPath !== publicRoot &&
      !resolvedPath.startsWith(publicRoot + path.sep)
    ) {
      return sendError(res, 404, "404.html");
    }

    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
      return sendError(res, 404, "404.html");
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType =
      MIME_TYPES[ext] || "application/octet-stream";

    const content = fs.readFileSync(resolvedPath);

    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);

    if (ext === ".html") {
      res.end(htmlStart + content.toString("utf8") + htmlEnd);
    } else {
      res.end(content);
    }
  } catch (error) {
    console.error(error);
    sendError(res, 500, "500.html");
  }
};
