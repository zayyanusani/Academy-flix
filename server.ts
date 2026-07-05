/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

// Import middleware
import { corsMiddleware, errorHandler, requestLogger, notFoundHandler } from "./middleware/index.js";

// Import services
import { readDb } from "./services/database.js";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(corsMiddleware);
app.use(requestLogger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enroll", enrollmentRoutes);
app.use("/api/progress", enrollmentRoutes); // Reuse enrollment routes for progress
app.use("/api/quiz", quizRoutes);
app.use("/api/analytics", analyticsRoutes);

// Certificate Download Endpoint
app.get("/api/certificate/download/:userId/:courseId", (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;

    const db = readDb();
    const user = db.users.find((u) => u._id === userId);
    const course = db.courses.find((c) => c._id === courseId);

    if (!user || !course) {
      return res.status(404).json({ error: "Student or course not found" });
    }

    const progress = user.progress?.find((p: any) => p.courseId === courseId);
    const quizPassed = progress?.completedQuiz;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=certificate_${userId}_${courseId}.pdf`);

    const doc = new PDFDocument({ layout: "landscape", size: "A4" });
    doc.pipe(res);

    const primaryBg = "#0F0F10";
    const borderGold = "#C5A880";
    const accentRed = "#E50914";
    const textWhite = "#FFFFFF";
    const textGray = "#9CA3AF";

    doc.rect(0, 0, doc.page.width, doc.page.height).fill(primaryBg);
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke(borderGold);
    doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52).lineWidth(1).stroke(accentRed);

    doc.moveDown(2);
    doc.fillColor(accentRed).fontSize(20).text("ACADEMYFLIX CERTIFICATION PLATFORMS", { align: "center", characterSpacing: 1.5 });
    doc.moveDown(1.5);

    doc.fillColor(textWhite).fontSize(34).text("CERTIFICATE OF COMPLETION", { align: "center", wordSpacing: 2 });
    doc.moveDown(0.5);

    doc.fillColor(textGray).fontSize(13).text("This official credential is systematically awarded to indicate the student has successfully passed the evaluations for:", { align: "center" });
    doc.moveDown(1.2);

    doc.fillColor(borderGold).fontSize(32).text(user.name.toUpperCase(), { align: "center" });
    doc.moveDown(0.8);

    doc.fillColor(textGray).fontSize(12).text("having displayed proficient knowledge systems, lessons requirements, and passing the comprehensive test for:", { align: "center" });
    doc.moveDown(0.6);

    doc.fillColor(textWhite).fontSize(22).text(`"${course.title}"`, { align: "center" });
    doc.moveDown(2.5);

    const footerY = doc.y;
    doc.fillColor(textGray).fontSize(10);
    doc.text("VERIFIED COURSEWARE BY FACULTY", 80, footerY);
    doc.strokeColor(borderGold).lineWidth(1).moveTo(80, footerY - 5).lineTo(280, footerY - 5).stroke();

    doc.fillColor(textGray).fontSize(10);
    doc.text("AUTHORIZED SIGNATURE", doc.page.width - 280, footerY, { align: "right" });
    doc.strokeColor(accentRed).lineWidth(1).moveTo(doc.page.width - 280, footerY - 5).lineTo(doc.page.width - 80, footerY - 5).stroke();

    const stampY = footerY - 30;
    doc.circle(doc.page.width / 2, stampY, 32).fill(borderGold);
    doc.fillColor(primaryBg).fontSize(8).text("VERIFIED", doc.page.width / 2 - 20, stampY - 14, { width: 40, align: "center" });
    doc.fillColor(primaryBg).fontSize(7).text("ACADEMY", doc.page.width / 2 - 20, stampY - 2, { width: 40, align: "center" });
    doc.fillColor(primaryBg).fontSize(6).text("FLIX SECURE", doc.page.width / 2 - 20, stampY + 8, { width: 40, align: "center" });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: "Failed to generate certificate" });
  }
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), environment: NODE_ENV });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

// Vite development server or static file serving
async function startServer() {
  if (NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AcademyFlix Service] running on http://localhost:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
