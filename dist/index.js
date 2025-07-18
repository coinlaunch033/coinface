// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/neon-storage.ts
import { neon } from "@neondatabase/serverless";
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable");
}
var sql = neon(process.env.DATABASE_URL);
var NeonStorage = class {
  async getUser(id) {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;
    return result[0];
  }
  async createUser(insertUser) {
    const result = await sql`
      INSERT INTO users (username, password)
      VALUES (${insertUser.username}, ${insertUser.password})
      RETURNING *
    `;
    return result[0];
  }
  async createToken(insertToken) {
    const result = await sql`
      INSERT INTO tokens (
        token_name, 
        token_address, 
        chain, 
        logo_url, 
        theme, 
        button_style, 
        font_style, 
        view_count
      )
      VALUES (
        ${insertToken.tokenName},
        ${insertToken.tokenAddress},
        ${insertToken.chain},
        ${insertToken.logoUrl || null},
        ${insertToken.theme || "dark"},
        ${insertToken.buttonStyle || "rounded"},
        ${insertToken.fontStyle || "sans"},
        0
      )
      RETURNING *
    `;
    return result[0];
  }
  async getTokenByName(tokenName) {
    console.log("[STORAGE] Searching for token:", tokenName);
    const result = await sql`
      SELECT * FROM tokens 
      WHERE token_name ILIKE ${tokenName}
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    console.log("[STORAGE] Query result:", result.length, "rows");
    if (result.length > 0) {
      console.log("[STORAGE] Found token:", result[0].token_name);
    }
    return result[0];
  }
  async getAllTokens() {
    const result = await sql`
      SELECT * FROM tokens 
      ORDER BY created_at DESC
    `;
    return result;
  }
  async updateTokenTheme(tokenName, themeUpdate) {
    const result = await sql`
      UPDATE tokens 
      SET 
        theme = ${themeUpdate.theme || "dark"},
        button_style = ${themeUpdate.buttonStyle || "rounded"},
        font_style = ${themeUpdate.fontStyle || "sans"}
      WHERE token_name ILIKE ${tokenName}
      RETURNING *
    `;
    return result[0];
  }
  async incrementViewCount(tokenName) {
    const result = await sql`
      UPDATE tokens 
      SET view_count = view_count + 1
      WHERE token_name ILIKE ${tokenName}
      RETURNING *
    `;
    return result[0];
  }
  async createMemeDropEntry(insertEntry) {
    const result = await sql`
      INSERT INTO meme_drop_entries (
        wallet_address, 
        token_name, 
        chain, 
        twitter, 
        email
      )
      VALUES (
        ${insertEntry.walletAddress},
        ${insertEntry.tokenName},
        ${insertEntry.chain},
        ${insertEntry.twitter || null},
        ${insertEntry.email || null}
      )
      RETURNING *
    `;
    return result[0];
  }
  async getMemeDropEntryCount() {
    const result = await sql`
      SELECT COUNT(*) as count FROM meme_drop_entries
    `;
    return parseInt(result[0].count);
  }
  async getAllMemeDropEntries() {
    const result = await sql`
      SELECT * FROM meme_drop_entries 
      ORDER BY created_at DESC
    `;
    return result;
  }
};
var storage = new NeonStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  tokenName: text("token_name").notNull(),
  tokenAddress: text("token_address").notNull(),
  chain: text("chain").notNull(),
  logoUrl: text("logo_url"),
  theme: text("theme").notNull().default("dark"),
  buttonStyle: text("button_style").notNull().default("rounded"),
  fontStyle: text("font_style").notNull().default("sans"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertTokenSchema = createInsertSchema(tokens).pick({
  tokenName: true,
  tokenAddress: true,
  chain: true,
  logoUrl: true,
  theme: true,
  buttonStyle: true,
  fontStyle: true
});
var updateTokenThemeSchema = createInsertSchema(tokens).pick({
  theme: true,
  buttonStyle: true,
  fontStyle: true
});
var memeDropEntries = pgTable("meme_drop_entries", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  tokenName: text("token_name").notNull(),
  chain: text("chain").notNull(),
  twitter: text("twitter"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertMemeDropEntrySchema = createInsertSchema(memeDropEntries).pick({
  walletAddress: true,
  tokenName: true,
  chain: true,
  twitter: true,
  email: true
});

// server/routes.ts
import { z } from "zod";

// server/cloud-storage.ts
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";
var hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
console.log("[CLOUDINARY] Config check:", {
  hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
  hasApiKey: !!process.env.CLOUDINARY_API_KEY,
  hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
  hasFullConfig: hasCloudinaryConfig
});
if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}
var uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("[STORAGE] Created uploads directory for fallback");
}
var storage2;
if (hasCloudinaryConfig) {
  console.log("[STORAGE] Using Cloudinary storage");
  storage2 = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "mememarketer-logos",
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    }
  });
} else {
  console.log("[STORAGE] Using local storage fallback");
  storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    }
  });
}
var upload = multer({
  storage: storage2,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  }
});
var getImageUrl = (file) => {
  if (!file) return "";
  if (file.path && (file.path.startsWith("http://") || file.path.startsWith("https://"))) {
    return file.path;
  }
  if (file.filename) {
    return `/uploads/${file.filename}`;
  }
  if (file.path) {
    return file.path;
  }
  return "";
};

// server/routes.ts
function toCamelCaseToken(token) {
  if (!token) return token;
  return {
    id: token.id,
    tokenName: token.token_name,
    tokenAddress: token.token_address,
    chain: token.chain,
    logoUrl: token.logo_url,
    theme: token.theme,
    buttonStyle: token.button_style,
    fontStyle: token.font_style,
    viewCount: token.view_count,
    createdAt: token.created_at
  };
}
async function registerRoutes(app2) {
  app2.post("/api/tokens", upload.single("logo"), async (req, res) => {
    try {
      console.log("[TOKEN CREATE] Request body:", req.body);
      console.log("[TOKEN CREATE] Request file:", req.file);
      const { tokenName, tokenAddress, chain, theme = "dark", buttonStyle = "rounded", fontStyle = "sans" } = req.body;
      if (!tokenName || typeof tokenName !== "string" || tokenName.length < 2) {
        console.error("[TOKEN CREATE] Invalid or missing tokenName:", tokenName);
        return res.status(400).json({ message: "Missing or invalid tokenName (min 2 chars)" });
      }
      if (!tokenAddress || typeof tokenAddress !== "string" || tokenAddress.length < 8) {
        console.error("[TOKEN CREATE] Invalid or missing tokenAddress:", tokenAddress);
        return res.status(400).json({ message: "Missing or invalid tokenAddress (min 8 chars)" });
      }
      if (!chain || typeof chain !== "string") {
        console.error("[TOKEN CREATE] Invalid or missing chain:", chain);
        return res.status(400).json({ message: "Missing or invalid chain" });
      }
      let logoUrl = null;
      if (req.file) {
        logoUrl = getImageUrl(req.file);
        console.log("[TOKEN CREATE] Logo uploaded to Cloudinary:", logoUrl);
      }
      const validatedToken = insertTokenSchema.parse({
        tokenName,
        tokenAddress,
        chain,
        logoUrl,
        theme,
        buttonStyle,
        fontStyle
      });
      const token = await storage.createToken(validatedToken);
      try {
        await storage.createMemeDropEntry({
          walletAddress: `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`,
          tokenName,
          chain,
          twitter: void 0,
          email: void 0
        });
      } catch (memeDropError) {
        console.error("[TOKEN CREATE] Error creating MemeDrop entry:", memeDropError);
      }
      res.status(201).json(token);
    } catch (error) {
      console.error("[TOKEN CREATE] Error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid token data",
          errors: error.errors
        });
      }
      if (error.message && error.message.includes("fetch failed")) {
        return res.status(503).json({
          message: "Database temporarily unavailable. Please try again later.",
          error: "Database connection failed"
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tokens/:tokenName", async (req, res) => {
    try {
      const { tokenName } = req.params;
      console.log("[TOKEN FETCH] Looking for token:", tokenName);
      const token = await storage.getTokenByName(tokenName);
      console.log("[TOKEN FETCH] Found token:", token ? token.tokenName : "null");
      if (!token) {
        console.log("[TOKEN FETCH] Token not found for:", tokenName);
        return res.status(404).json({ message: "Token not found" });
      }
      const camelCaseToken = toCamelCaseToken(token);
      console.log("[TOKEN FETCH] Returning token:", camelCaseToken.tokenName);
      res.json(camelCaseToken);
    } catch (error) {
      console.error("Error fetching token:", error);
      res.status(503).json({
        message: "Database temporarily unavailable. Please try again later.",
        error: "Database connection failed"
      });
    }
  });
  app2.patch("/api/tokens/:tokenName/theme", async (req, res) => {
    try {
      const { tokenName } = req.params;
      const validatedTheme = updateTokenThemeSchema.parse(req.body);
      const updatedToken = await storage.updateTokenTheme(tokenName, validatedTheme);
      if (!updatedToken) {
        return res.status(404).json({ message: "Token not found" });
      }
      res.json(updatedToken);
    } catch (error) {
      console.error("Error updating token theme:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid theme data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tokens/:tokenName/view", async (req, res) => {
    try {
      const { tokenName } = req.params;
      const updatedToken = await storage.incrementViewCount(tokenName);
      if (!updatedToken) {
        return res.status(404).json({ message: "Token not found" });
      }
      res.json({ viewCount: updatedToken.viewCount });
    } catch (error) {
      console.error("Error incrementing view count:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tokens", async (req, res) => {
    try {
      const tokens2 = await storage.getAllTokens();
      res.json(tokens2);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/payment", async (req, res) => {
    try {
      const { chain, amount, tokenName } = req.body;
      if (!chain || !amount || !tokenName) {
        return res.status(400).json({
          message: "Missing required fields: chain, amount, tokenName"
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      res.json({
        success: true,
        transactionId: `tx_${Date.now()}`,
        message: "Payment processed successfully"
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });
  app2.get("/api/memedrop/entries", async (req, res) => {
    try {
      const count = await storage.getMemeDropEntryCount();
      res.json(count);
    } catch (error) {
      console.error("Error fetching MemeDrop entry count:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/memedrop/entries", async (req, res) => {
    try {
      const validatedEntry = insertMemeDropEntrySchema.parse(req.body);
      const entry = await storage.createMemeDropEntry(validatedEntry);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating MemeDrop entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid entry data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/memedrop/entries/all", async (req, res) => {
    try {
      const entries = await storage.getAllMemeDropEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching all MemeDrop entries:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __dirname = path2.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "client", "src"),
      "@shared": path2.resolve(__dirname, "shared"),
      "@assets": path2.resolve(__dirname, "attached_assets")
    }
  },
  root: path2.resolve(__dirname, "client"),
  build: {
    outDir: path2.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      // Proxy WalletConnect requests to avoid CORS issues
      "/e": {
        target: "https://pulse.walletconnect.org",
        changeOrigin: true,
        secure: true,
        rewrite: (path5) => path5.replace(/^\/e/, "/e")
      }
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __dirname2 = path3.dirname(fileURLToPath2(import.meta.url));
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname2, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { fileURLToPath as fileURLToPath3 } from "url";
import path4 from "path";
var __filename = fileURLToPath3(import.meta.url);
var __dirname3 = path4.dirname(__filename);
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use("/uploads", express2.static(path4.join(__dirname3, "../uploads")));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
