/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { readDb, writeDb } from "./database.js";
import { User } from "../types/index.js";

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export class AuthService {
  static register(name: string, email: string, password: string): User | null {
    if (!name || !email || !password) return null;

    const db = readDb();
    const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) return null;

    const newUser: User = {
      _id: "user_" + generateId(),
      name,
      email,
      password,
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      coursesEnrolled: ["course-graphic"],
      progress: [
        {
          courseId: "course-graphic",
          lessons: [],
          completedQuiz: false
        }
      ],
      createdAt: new Date().toISOString().split("T")[0],
      isAdmin: false
    };

    db.users.push(newUser);
    writeDb(db);
    return this.sanitizeUser(newUser);
  }

  static login(email: string, password: string): User | null {
    if (!email || !password) return null;

    const db = readDb();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    return user ? this.sanitizeUser(user) : null;
  }

  static syncUser(uid: string | undefined, email: string, name: string): User {
    const db = readDb();
    let user = db.users.find(
      (u) => u._id === uid || u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      user = {
        _id: uid || "user_" + generateId(),
        name: name || "Learner",
        email,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "Learner")}`,
        coursesEnrolled: ["course-graphic"],
        progress: [],
        createdAt: new Date().toISOString().split("T")[0],
        isAdmin: false
      };
      db.users.push(user);
      writeDb(db);
    }
    return user;
  }

  private static sanitizeUser(user: User): User {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}
