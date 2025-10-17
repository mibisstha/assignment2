import express from "express";
import next from "next";
import cors from "cors";

const port = process.env.PORT || 4000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["*"],
      credentials: false,
    })
  );

  server.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    return res.sendStatus(200);
  });

  // Remove this line 
  // server.use(express.json());

  // Let Next.js handle everything else
  server.all("*", (req, res) => handle(req, res));

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Server running with CORS disabled on port ${port}`);
  });
});