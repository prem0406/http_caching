const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <body>
        <h1>HTTP Cache Lab</h1>

        <button onclick="getProduct()">
          Get Product
        </button>

        <pre id="result"></pre>

        <script>
          async function getProduct() {
            const response = await fetch("/product");

            const data = await response.json();

            document.getElementById("result").textContent =
              JSON.stringify(data, null, 2);
          }
        </script>
      </body>
    </html>
  `);
});

app.get("/product", (req, res) => {
  console.log("🔥 Node server was hit");

  res.setHeader("Cache-Control", "public, max-age=60");

  res.json({
    product: "Laptop",
    price: 60001,
    generatedAt: new Date().toISOString(),
  });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Node server running on port 3000");
});

/**
 * with the help of nginx.conf file
 * we ran 
 * 
 * docker run --rm \
  -p 8080:80 \
  -v ${PWD}/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx

  command to run nxginx server and then we can access the node server through nginx server
  at http://localhost:8080/product.

  Firt request will hit the node server and then nginx will cache the response for 60 seconds and then next request will be served from nginx cache and node server will not be hit.
 */
