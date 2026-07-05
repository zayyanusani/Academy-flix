/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { readDb, writeDb } from "./database.js";
import { Course, Lesson } from "../types/index.js";

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export class CourseService {
  static getAllCourses(): Course[] {
    const db = readDb();
    return db.courses;
  }

  static getCourseById(id: string): Course | null {
    const db = readDb();
    return db.courses.find((c) => c._id === id) || null;
  }

  static createCourse(
    title: string,
    description: string,
    thumbnail: string,
    category: string,
    instructor: string = "Faculty Member",
    price: number = 0,
    lessons: any[] = [],
    quiz: any = {}
  ): Course {
    const db = readDb();
    const newCourse: Course = {
      _id: "course_" + generateId(),
      title,
      description,
      thumbnail,
      category,
      instructor,
      price: parseFloat(price.toString()) || 0,
      lessons: lessons.map((l: any, idx: number) => ({
        _id: l._id || "lesson_" + generateId(),
        courseId: "",
        title: l.title || `Lesson ${idx + 1}`,
        videoUrl: l.videoUrl || "Ke90Tje7VS0",
        duration: l.duration || "10 mins",
        order: idx + 1
      })),
      quiz: quiz._id
        ? quiz
        : {
            _id: "quiz_" + generateId(),
            courseId: "",
            questions: quiz.questions || []
          },
      createdAt: new Date().toISOString().split("T")[0]
    };

    newCourse.lessons.forEach((l) => (l.courseId = newCourse._id));
    newCourse.quiz.courseId = newCourse._id;

    db.courses.push(newCourse);
    writeDb(db);
    return newCourse;
  }

  static updateCourse(
    id: string,
    title?: string,
    description?: string,
    thumbnail?: string,
    category?: string,
    instructor?: string,
    price?: number,
    lessons?: any[],
    quiz?: any
  ): Course | null {
    const db = readDb();
    const idx = db.courses.findIndex((c) => c._id === id);
    if (idx === -1) return null;

    const updatedLessons = (lessons || []).map((l: any, lidx: number) => ({
      _id: l._id || "lesson_" + generateId(),
      courseId: id,
      title: l.title,
      videoUrl: l.videoUrl || "Ke90Tje7VS0",
      duration: l.duration || "10 mins",
      order: lidx + 1
    }));

    const updatedQuiz = quiz
      ? {
          _id: quiz._id || "quiz_" + generateId(),
          courseId: id,
          questions: quiz.questions || []
        }
      : db.courses[idx].quiz;

    db.courses[idx] = {
      ...db.courses[idx],
      title: title || db.courses[idx].title,
      description: description || db.courses[idx].description,
      thumbnail: thumbnail || db.courses[idx].thumbnail,
      category: category || db.courses[idx].category,
      instructor: instructor || db.courses[idx].instructor,
      price: price !== undefined ? parseFloat(price.toString()) : db.courses[idx].price,
      lessons: updatedLessons.length > 0 ? updatedLessons : db.courses[idx].lessons,
      quiz: updatedQuiz
    };

    writeDb(db);
    return db.courses[idx];
  }

  static deleteCourse(id: string): boolean {
    const db = readDb();
    const initialLength = db.courses.length;
    db.courses = db.courses.filter((c) => c._id !== id);

    if (db.courses.length === initialLength) return false;

    writeDb(db);
    return true;
  }
}
