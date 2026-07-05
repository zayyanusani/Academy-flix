/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import { QuizService } from "../services/quiz.service.js";

const router = Router();

/**
 * POST /api/quiz/submit
 * Submit quiz answers
 */
router.post("/submit", (req: Request, res: Response) => {
  try {
    const { userId, courseId, answers } = req.body;
    
    if (!userId || !courseId || !answers) {
      return res.status(400).json({ error: "Missing required quiz fields" });
    }
    
    const result = QuizService.submitQuiz(userId, courseId, answers);
    
    if (!result) {
      return res.status(404).json({ error: "User or course not found" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
