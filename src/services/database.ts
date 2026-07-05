/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import path from "path";
import fs from "fs";
import { DBStructure } from "../types/index.js";

const DB_PATH = path.join(process.cwd(), "db.json");

// Pre-seeded Course Database
const defaultDb: DBStructure = {
  users: [
    {
      _id: "user-zayyanu",
      name: "Zayyanu Sani",
      email: "user@email.com",
      password: "learning123",
      profileImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150",
      coursesEnrolled: ["course-graphic"],
      progress: [
        {
          courseId: "course-graphic",
          lessons: [
            {
              lessonId: "lesson-graphic-1",
              playedSeconds: 180,
              isCompleted: true,
              updatedAt: new Date().toISOString()
            }
          ],
          completedQuiz: false
        }
      ],
      createdAt: "2026-06-01",
      isAdmin: false
    },
    {
      _id: "user-admin",
      name: "Zayyanu (Faculty)",
      email: "admin@academyflix.com",
      password: "admin123",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      coursesEnrolled: [],
      progress: [],
      createdAt: "2026-06-01",
      isAdmin: true
    }
  ],
  courses: [
    {
      _id: "course-graphic",
      title: "Graphic Design Masterclass",
      description: "Learn professional visual communication principles, negative spacing, typographic pairings, and color systems for digital platforms.",
      thumbnail: "https://images.unsplash.com/photo-1561070791-26c113006238?w=800&auto=format&fit=crop",
      category: "Design",
      instructor: "Amanda Ross",
      price: 0,
      createdAt: "2026-06-01",
      lessons: [
        {
          _id: "lesson-graphic-1",
          courseId: "course-graphic",
          title: "Introduction to Dynamic Composition",
          videoUrl: "Ke90Tje7VS0",
          duration: "10 mins",
          order: 1
        },
        {
          _id: "lesson-graphic-2",
          courseId: "course-graphic",
          title: "Contrast, Rhythm and Typographic Hierarchy",
          videoUrl: "7K1sB05pUX0",
          duration: "14 mins",
          order: 2
        },
        {
          _id: "lesson-graphic-3",
          courseId: "course-graphic",
          title: "Color Theory in Branding & Interface Mockups",
          videoUrl: "L_g-V2-6j0g",
          duration: "12 mins",
          order: 3
        }
      ],
      quiz: {
        _id: "quiz-graphic",
        courseId: "course-graphic",
        questions: [
          {
            questionText: "Which visual rule states that elements positioned close to each other are perceived as related?",
            options: ["Rule of Thirds", "Law of Proximity", "Rule of Contrast", "Symmetrical Balancing"],
            correctAnswerIndex: 1
          },
          {
            questionText: "What is the primary function of negative space in user interface layouts?",
            options: [
              "To display hidden watermarks",
              "To optimize image compression",
              "To improve readability and reduce cognitive overload",
              "To load stylesheets asynchronously"
            ],
            correctAnswerIndex: 2
          },
          {
            questionText: "Which color combination sits directly opposite each other on the color wheel?",
            options: ["Analogous Colors", "Monochromatic Accents", "Complementary Colors", "Triadic Highlights"],
            correctAnswerIndex: 2
          }
        ]
      }
    },
    {
      _id: "course-react",
      title: "React 18 & Vite Frontend Mastery",
      description: "Master fast SPA rendering, state optimization, custom hooks, and full-stack Vite proxies with beautiful modern web styling.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop",
      category: "Development",
      instructor: "Zayyanu Sani",
      price: 29.99,
      createdAt: "2026-06-01",
      lessons: [
        {
          _id: "lesson-react-1",
          courseId: "course-react",
          title: "Scaffolding Modern Apps with Vite & Tailwind CSS",
          videoUrl: "Ke90Tje7VS0",
          duration: "15 mins",
          order: 1
        },
        {
          _id: "lesson-react-2",
          courseId: "course-react",
          title: "State, Component Life Cycles, and Callback Optimization",
          videoUrl: "T_j6078w7Is",
          duration: "18 mins",
          order: 2
        }
      ],
      quiz: {
        _id: "quiz-react",
        courseId: "course-react",
        questions: [
          {
            questionText: "Why is Vite faster than typical standard Webpack configurations during development?",
            options: [
              "Vite compiles all files to native C++ before execution",
              "Vite uses native browser ES modules (ESM) to load assets on demand",
              "Vite does not support React component states",
              "Vite forces file locks on assets"
            ],
            correctAnswerIndex: 1
          },
          {
            questionText: "Which React hook is designed to memoize heavy computational functions?",
            options: ["useCallback", "useMemo", "useEffect", "useRef"],
            correctAnswerIndex: 1
          }
        ]
      }
    },
    {
      _id: "course-marketing",
      title: "Viral Copywriting & Search Optimization",
      description: "Accelerate user acquisition using psychology-backed marketing hooks and modern SEO ranking standards.",
      thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop",
      category: "Marketing",
      instructor: "Sarah Jenkins",
      price: 0,
      createdAt: "2026-05-15",
      lessons: [
        {
          _id: "lesson-mkt-1",
          courseId: "course-marketing",
          title: "Psychology Behind Attention Hooks & High-Conversion Copy",
          videoUrl: "7_R3O7mKkU8",
          duration: "13 mins",
          order: 1
        },
        {
          _id: "lesson-mkt-2",
          courseId: "course-marketing",
          title: "SEO Audits and Technical Crawl Speed Optimization",
          videoUrl: "p9eL_W1b6j4",
          duration: "11 mins",
          order: 2
        }
      ],
      quiz: {
        _id: "quiz-market",
        courseId: "course-marketing",
        questions: [
          {
            questionText: "In marketing copy, a 'Lead Hook' is primary designed to:",
            options: [
              "Log click telemetry headers",
              "Trigger an immediate positive feedback, capture immediate curiosity, and state the value proposition",
              "Re-route traffic to database clusters",
              "Encourage the user to review site terms"
            ],
            correctAnswerIndex: 1
          }
        ]
      }
    }
  ]
};

export function readDb(): DBStructure {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
      return defaultDb;
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read database, falling back onto built-in memory state", error);
    return defaultDb;
  }
}

export function writeDb(data: DBStructure): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save database state to file", error);
  }
}
