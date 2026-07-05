/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { readDb } from "./database.js";
import { AnalyticsData, UserAnalytics } from "../types/index.js";

export class AnalyticsService {
  static getAnalytics(): AnalyticsData {
    const db = readDb();

    let totalEnrollments = 0;
    let completedQuizzes = 0;

    db.users.forEach((u) => {
      if (u.coursesEnrolled) {
        totalEnrollments += u.coursesEnrolled.length;
      }
      if (u.progress) {
        u.progress.forEach((p: any) => {
          if (p.completedQuiz) {
            completedQuizzes++;
          }
        });
      }
    });

    const students: UserAnalytics[] = db.users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      coursesEnrolled: u.coursesEnrolled,
      isAdmin: !!u.isAdmin,
      progress: u.progress,
      createdAt: u.createdAt
    }));

    return {
      totalEnrollments,
      completedQuizzes,
      totalStudents: db.users.filter((u) => !u.isAdmin).length,
      totalCourses: db.courses.length,
      students
    };
  }
}
