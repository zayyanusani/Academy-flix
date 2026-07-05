/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = AuthService.register(name, email, password);
    
    if (!user) {
      return res.status(400).json({ error: "Registration failed. Email may already exist." });
    }
    
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Missing credential parameters" });
    }
    
    const user = AuthService.login(email, password);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/sync-user
 * Sync user from external platforms
 */
router.post("/sync-user", (req: Request, res: Response) => {
  try {
    const { uid, email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const user = AuthService.syncUser(uid, email, name);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
