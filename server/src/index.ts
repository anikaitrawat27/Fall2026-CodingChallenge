import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// --- Global middleware ----------------------------------------------------
app.use(
  cors({
    // Only the Vite dev server may call this API from a browser.
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  }),
);
app.use(express.json());

// --- Routes ---------------------------------------------------------------
app.use("/api", routes);

// --- Error handling (must be registered last) -----------------------------
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
