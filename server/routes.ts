import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./neon-storage";
import { insertTokenSchema, updateTokenThemeSchema, insertMemeDropEntrySchema } from "@shared/schema";
import { z } from "zod";
import { upload, getImageUrl } from "./cloud-storage";

// NEON DB TOKEN CREATION CHECKLIST:
// 1. Ensure DATABASE_URL is set and valid
// 2. Validate all required fields before DB insert
// 3. Handle logo uploads robustly (file type, size, path)
// 4. Return clear errors for missing/invalid data
// 5. Index token_name and chain in Neon for fast lookups
// 6. Use parameterized queries (Neon does this)
// 7. Add logging for failed DB operations
// 8. (Optional) Add rate limiting/anti-spam for token creation
//
// ---
//
// Enhanced /api/tokens endpoint below:

// Helper to convert snake_case to camelCase for token
function toCamelCaseToken(token: any) {
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
    createdAt: token.created_at,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create token endpoint
  app.post("/api/tokens", upload.single('logo'), async (req, res) => {
    try {
      console.log("[TOKEN CREATE] Request body:", req.body);
      console.log("[TOKEN CREATE] Request file:", req.file);
      
      const { tokenName, tokenAddress, chain, theme = "dark", buttonStyle = "rounded", fontStyle = "sans" } = req.body;
      
      // Extra validation
      if (!tokenName || typeof tokenName !== 'string' || tokenName.length < 2) {
        console.error("[TOKEN CREATE] Invalid or missing tokenName:", tokenName);
        return res.status(400).json({ message: "Missing or invalid tokenName (min 2 chars)" });
      }
      if (!tokenAddress || typeof tokenAddress !== 'string' || tokenAddress.length < 8) {
        console.error("[TOKEN CREATE] Invalid or missing tokenAddress:", tokenAddress);
        return res.status(400).json({ message: "Missing or invalid tokenAddress (min 8 chars)" });
      }
      if (!chain || typeof chain !== 'string') {
        console.error("[TOKEN CREATE] Invalid or missing chain:", chain);
        return res.status(400).json({ message: "Missing or invalid chain" });
      }

      // Handle logo upload to Cloudinary
      let logoUrl = null;
      if (req.file) {
        logoUrl = getImageUrl(req.file);
        console.log("[TOKEN CREATE] Logo uploaded to Cloudinary:", logoUrl);
      }

      // Validate token data
      const validatedToken = insertTokenSchema.parse({
        tokenName,
        tokenAddress,
        chain,
        logoUrl,
        theme,
        buttonStyle,
        fontStyle,
      });

      const token = await storage.createToken(validatedToken);
      
      // Automatically enter into MemeDrop when token is created
      try {
        await storage.createMemeDropEntry({
          walletAddress: `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`,
          tokenName,
          chain,
          twitter: undefined,
          email: undefined,
        });
      } catch (memeDropError) {
        console.error("[TOKEN CREATE] Error creating MemeDrop entry:", memeDropError);
        // Continue even if MemeDrop entry fails
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
      if ((error as any).message && (error as any).message.includes('fetch failed')) {
        return res.status(503).json({ 
          message: "Database temporarily unavailable. Please try again later.",
          error: "Database connection failed"
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get token by name
  app.get("/api/tokens/:tokenName", async (req, res) => {
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
      // Return a more graceful error response
      res.status(503).json({ 
        message: "Database temporarily unavailable. Please try again later.",
        error: "Database connection failed"
      });
    }
  });

  // Update token theme
  app.patch("/api/tokens/:tokenName/theme", async (req, res) => {
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

  // Increment view count
  app.post("/api/tokens/:tokenName/view", async (req, res) => {
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

  // Get all tokens
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getAllTokens();
      res.json(tokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mock payment endpoint
  app.post("/api/payment", async (req, res) => {
    try {
      const { chain, amount, tokenName } = req.body;
      
      if (!chain || !amount || !tokenName) {
        return res.status(400).json({ 
          message: "Missing required fields: chain, amount, tokenName" 
        });
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock payment success
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

  // MemeDrop API endpoints
  app.get("/api/memedrop/entries", async (req, res) => {
    try {
      const count = await storage.getMemeDropEntryCount();
      res.json(count);
    } catch (error) {
      console.error("Error fetching MemeDrop entry count:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/memedrop/entries", async (req, res) => {
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

  app.get("/api/memedrop/entries/all", async (req, res) => {
    try {
      const entries = await storage.getAllMemeDropEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching all MemeDrop entries:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cloudinary handles image serving, no need for local static files

  const httpServer = createServer(app);
  return httpServer;
}
