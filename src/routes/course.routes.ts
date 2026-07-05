/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import { CourseService } from "../services/course.service.js";

const router = Router();

/**
 * GET /api/courses
 * Get all courses
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const courses = CourseService.getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/courses/:id
 * Get course by ID
 */
router.get("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = CourseService.getCourseById(id);
    
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/courses
 * Create new course (admin only)
 */
router.post("/", (req: Request, res: Response) => {
  try {
    const { title, description, thumbnail, category, instructor, price, lessons, quiz } = req.body;
    
    if (!title || !description || !thumbnail || !category) {
      return res.status(400).json({ error: "Missing required course fields" });
    }
    
    const course = CourseService.createCourse(
      title,
      description,
      thumbnail,
      category,
      instructor,
      price,
      lessons,
      quiz
    );
    
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/courses/:id
 * Update course (admin only)
 */
router.put("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail, category, instructor, price, lessons, quiz } = req.body;
    
    const course = CourseService.updateCourse(
      id,
      title,
      description,
      thumbnail,
      category,
      instructor,
      price,
      lessons,
      quiz
    );
    
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/courses/:id
 * Delete course (admin only)
 */
router.delete("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = CourseService.deleteCourse(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Course not found" });
    }
    
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
