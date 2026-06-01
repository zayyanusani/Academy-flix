/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  videoUrl: string; // YouTube ID or direct embed URL
  duration: string; // e.g. "12 mins"
  order: number;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number; // 0-based index
}

export interface Quiz {
  _id: string;
  courseId: string;
  questions: Question[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: 'Design' | 'Development' | 'Business' | 'Marketing';
  instructor: string;
  price: number; // 0 = Free, else premium
  lessons: Lesson[];
  quiz?: Quiz;
  createdAt: string;
}

export interface UserProgressDetails {
  lessonId: string;
  playedSeconds: number;
  isCompleted: boolean;
  updatedAt: string;
}

export interface UserProgress {
  courseId: string;
  lessons: UserProgressDetails[];
  completedQuiz: boolean;
  quizScore?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  coursesEnrolled: string[];
  progress: UserProgress[];
  createdAt: string;
  isAdmin?: boolean;
}

export interface Analytics {
  totalEnrollments: number;
  completedQuizzes: number;
  totalStudents: number;
  totalCourses: number;
}
