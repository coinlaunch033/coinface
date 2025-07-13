import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTokenSchema, updateTokenThemeSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create token endpoint
  app.post("/api/tokens", upload.single('logo'), async (req, res) => {
    try {
      const { tokenName, tokenAddress, chain, theme = "dark", buttonStyle = "rounded", fontStyle = "sans" } = req.body;
      
      // Validate required fields
      if (!tokenName || !tokenAddress || !chain) {
        return res.status(400).json({ 
          message: "Missing required fields: tokenName, tokenAddress, chain" 
        });
      }

      // Check if token name already exists
      const existingToken = await storage.getTokenByName(tokenName);
      if (existingToken) {
        return res.status(409).json({ 
          message: "Token name already exists" 
        });
      }

      // Handle logo upload
      let logoUrl = null;
      if (req.file) {
        const logoFileName = `${Date.now()}-${req.file.originalname}`;
        const logoPath = path.join('uploads', logoFileName);
        fs.renameSync(req.file.path, logoPath);
        logoUrl = `/uploads/${logoFileName}`;
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
      res.status(201).json(token);
    } catch (error) {
      console.error("Error creating token:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid token data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get token by name
  app.get("/api/tokens/:tokenName", async (req, res) => {
    try {
      const { tokenName } = req.params;
      const token = await storage.getTokenByName(tokenName);
      
      if (!token) {
        return res.status(404).json({ message: "Token not found" });
      }

      res.json(token);
    } catch (error) {
      console.error("Error fetching token:", error);
      res.status(500).json({ message: "Internal server error" });
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

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
