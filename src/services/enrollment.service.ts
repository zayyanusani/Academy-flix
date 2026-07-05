/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { readDb, writeDb } from "./database.js";
import { User, UserProgress } from "../types/index.js";

export class EnrollmentService {
  static enrollStudent(userId: string, courseId: string): User | null {
    const db = readDb();
    const userIdx = db.users.findIndex((u) => u._id === userId);
    if (userIdx === -1) return null;

    const user = db.users[userIdx];
    if (!user.coursesEnrolled.includes(courseId)) {
      user.coursesEnrolled.push(courseId);
    }

    const progressIdx = user.progress.findIndex((p: UserProgress) => p.courseId === courseId);
    if (progressIdx === -1) {
      user.progress.push({
        courseId,
        lessons: [],
        completedQuiz: false
      });
    }

    db.users[userIdx] = user;
    writeDb(db);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  static updateProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    playedSeconds: number,
    isCompleted: boolean
  ): User | null {
    const db = readDb();
    const userIdx = db.users.findIndex((u) => u._id === userId);
    if (userIdx === -1) return null;

    const user = db.users[userIdx];
    let courseProgress = user.progress.find((p: UserProgress) => p.courseId === courseId);

    if (!courseProgress) {
      courseProgress = {
        courseId,
        lessons: [],
        completedQuiz: false
      };
      user.progress.push(courseProgress);
    }

    let lessonProgress = courseProgress.lessons.find((l: any) => l.lessonId === lessonId);
    if (!lessonProgress) {
      lessonProgress = {
        lessonId,
        playedSeconds: parseFloat(playedSeconds.toString()) || 0,
        isCompleted: !!isCompleted,
        updatedAt: new Date().toISOString()
      };
      courseProgress.lessons.push(lessonProgress);
    } else {
      lessonProgress.playedSeconds = parseFloat(playedSeconds.toString()) || 0;
      if (isCompleted) {
        lessonProgress.isCompleted = true;
      }
      lessonProgress.updatedAt = new Date().toISOString();
    }

    db.users[userIdx] = user;
    writeDb(db);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  static getUserProgress(userId: string): UserProgress[] | null {
    const db = readDb();
    const user = db.users.find((u) => u._id === userId);
    return user ? user.progress || [] : null;
  }
}
