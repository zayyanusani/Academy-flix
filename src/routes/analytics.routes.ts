/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service.js";

const router = Router();

/**
 * GET /api/analytics
 * Get system analytics (admin only)
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const analytics = AnalyticsService.getAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
