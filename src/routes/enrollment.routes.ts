/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import { EnrollmentService } from "../services/enrollment.service.js";

const router = Router();

/**
 * POST /api/enroll
 * Enroll student in course
 */
router.post("/", (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.body;
    
    if (!userId || !courseId) {
      return res.status(400).json({ error: "Missing userId or courseId" });
    }
    
    const user = EnrollmentService.enrollStudent(userId, courseId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/progress/update
 * Update lesson progress
 */
router.post("/progress/update", (req: Request, res: Response) => {
  try {
    const { userId, courseId, lessonId, playedSeconds, isCompleted } = req.body;
    
    if (!userId || !courseId || !lessonId) {
      return res.status(400).json({ error: "Missing required progress fields" });
    }
    
    const user = EnrollmentService.updateProgress(
      userId,
      courseId,
      lessonId,
      playedSeconds || 0,
      isCompleted || false
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/progress/user/:userId
 * Get user progress
 */
router.get("/progress/user/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const progress = EnrollmentService.getUserProgress(userId);
    
    if (progress === null) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
