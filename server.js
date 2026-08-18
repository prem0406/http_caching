const http = require("http");
const crypto = require("crypto");

let requestCount = 0;

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.setHeader("Content-Type", "text/html");

    res.end(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>HTTP Cache Lab</h1>

          <button onclick="getProducts()">
            Get Products
          </button>

          <pre id="result"></pre>

          <script>
            async function getProducts() {
              const response = await fetch("/products");

              const data = await response.json();

              document.getElementById("result").textContent =
                JSON.stringify(data, null, 2);
            }
          </script>
        </body>
      </html>
    `);

    return;
  }

  if (req.url === "/products") {
    requestCount++;

    console.log(`Request #${requestCount} : ${req.method} : ${req.url}`);

    const products = {
      products: [
        { id: 1, name: "Laptop 1", price: 50000 },
        { id: 2, name: "Keyboard", price: 2000 },
      ],
    };

    res.setHeader("Content-Type", "application/json");
    const body = JSON.stringify(products);

    /*This response can be considered fresh for 60 seconds. */
    // res.setHeader("Cache-Control", "max-age=60");

    /** ------------------------------------------------------------------------------------------------------------- */

    /**
     * Don't store this response in the cache.
     * Every refresh → server request
     */
    // res.setHeader("Cache-Control", "no-store");

    /** ------------------------------------------------------------------------------------------------------------- */

    const etag = crypto.createHash("md5").update(body).digest("hex");

    /** You can store the response, but when you want to reuse it, validate it with the server. In this case request reaches
     * to server but it won't return response if req.headers["if-none-match"] === `"${etag}". So the it would take less time as request
     * is to carrying JSON response over the network
     *
     *  ETag (server) <-> if-none-match (Brower)
     */
    // res.setHeader("Cache-Control", "no-cache");
    // res.setHeader("ETag", `"${etag}"`);

    // if (req.headers["if-none-match"] === `"${etag}"`) {
    //   res.statusCode = 304;
    //   res.end();
    //   return;
    // }

    /** ------------------------------------------------------------------------------------------------------------- */

    /**
     * Update this lastModified Date if the response (products ) is changed
     */
    const lastModified = new Date("2026-08-18T17:00:00Z");

    /**
     * Last-Modified <-> if-modified-since
     */
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Last-Modified", lastModified.toISOString());

    const ifModifiedSince = req.headers["if-modified-since"];
    if (ifModifiedSince) {
      const clientDate = new Date(ifModifiedSince);

      if (clientDate >= lastModified) {
        res.statusCode = 304;
        res.end();
        return;
      }
    }

    res.end(body);

    return;
  }

  res.statusCode = 404;
  res.end("Not Found");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
