/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { readDb, writeDb } from "./database.js";
import { User } from "../types/index.js";

export interface QuizSubmissionResult {
  passed: boolean;
  savedScore: number;
  correct: number;
  total: number;
  userState: User;
}

export class QuizService {
  static submitQuiz(
    userId: string,
    courseId: string,
    answers: number[]
  ): QuizSubmissionResult | null {
    const db = readDb();
    const course = db.courses.find((c) => c._id === courseId);
    if (!course || !course.quiz) return null;

    const userIdx = db.users.findIndex((u) => u._id === userId);
    if (userIdx === -1) return null;

    const user = db.users[userIdx];
    let correctCount = 0;
    const questionsList = course.quiz.questions || [];

    questionsList.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const totalQuestions = questionsList.length || 1;
    const scoreRatio = correctCount / totalQuestions;
    const passed = scoreRatio >= 0.7;

    let courseProgress = user.progress.find((p: any) => p.courseId === courseId);
    if (!courseProgress) {
      courseProgress = { courseId, lessons: [], completedQuiz: false };
      user.progress.push(courseProgress);
    }

    if (passed) {
      courseProgress.completedQuiz = true;
      courseProgress.quizScore = Math.round(scoreRatio * 100);
    }

    db.users[userIdx] = user;
    writeDb(db);

    const { password: _, ...userWithoutPassword } = user;
    return {
      passed,
      savedScore: Math.round(scoreRatio * 100),
      correct: correctCount,
      total: totalQuestions,
      userState: userWithoutPassword as User
    };
  }
}
