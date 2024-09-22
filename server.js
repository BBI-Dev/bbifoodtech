var qs = require("querystring");
const http = require("http");
const fs = require("fs");
const path = require("path");
var url = require("url");
const hostname = process.env.HOST || "127.0.0.1"; // use hostname 127.0.0.1 unless there exists a preconfigured port
const port = process.env.PORT || 3000; // use port 3000 unless there exists a preconfigured port

var htmlstart = fs.readFileSync('assets/htmlstart.html', "utf8");
var htmlend = fs.readFileSync('assets/htmlend.html', "utf8");

const server = http
  .createServer(function (request, response) {
    let reqName = url.parse(request.url, true);
    let qName = reqName.query;
    let filePath = reqName.pathname;
    if (filePath == "/") {
      filePath = "public/index.html";
    } else {
      filePath = "public" + filePath;
    }

    let extname = String(path.extname(filePath)).toLowerCase();
    let mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".woff": "application/font-woff",
      ".ttf": "application/font-ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "application/font-otf",
      ".wasm": "application/wasm",
      ".ico": "image/x-icon",
    };

    let contentType = mimeTypes[extname] || "application/octet-stream";

    fs.readFile(filePath, function (error, content) {
      if (error) {
        if (error.code == "ENOENT") {
          fs.readFile("assets/404.html", function (error, content) {
            response.writeHead(404, { "Content-Type": "text/html" });
            response.end(htmlstart + content + htmlend, "utf-8");
          });
        } else {
          fs.readFile("assets/500.html", function (error, content) {
            response.writeHead(404, { "Content-Type": "text/html" });
            response.end(htmlstart + content + htmlend, "utf-8");
          });
        }
      } else {
        if (contentType == "text/html") {
          response.writeHead(200, { "Content-Type": contentType });
          response.end(fs.readFileSync('assets/htmlstart.html', "utf8") + content + fs.readFileSync('assets/htmlend.html', "utf8"), "utf-8");
        } else {
          response.writeHead(200, { "Content-Type": contentType });
          response.end(content, "utf-8");
        }
      }
    });
  })
  .listen(port);

console.log(`Server running at http://${hostname}:${port}/`);
