/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  profileImage: string;
  coursesEnrolled: string[];
  progress: UserProgress[];
  createdAt: string;
  isAdmin: boolean;
}

export interface UserProgress {
  courseId: string;
  lessons: LessonProgress[];
  completedQuiz: boolean;
  quizScore?: number;
}

export interface LessonProgress {
  lessonId: string;
  playedSeconds: number;
  isCompleted: boolean;
  updatedAt: string;
}

export interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  duration: string;
  order: number;
}

export interface Quiz {
  _id: string;
  courseId: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  instructor: string;
  price: number;
  lessons: Lesson[];
  quiz: Quiz;
  createdAt: string;
}

export interface DBStructure {
  users: User[];
  courses: Course[];
}

export interface AnalyticsData {
  totalEnrollments: number;
  completedQuizzes: number;
  totalStudents: number;
  totalCourses: number;
  students: UserAnalytics[];
}

export interface UserAnalytics {
  _id: string;
  name: string;
  email: string;
  coursesEnrolled: string[];
  isAdmin: boolean;
  progress: UserProgress[];
  createdAt: string;
}
