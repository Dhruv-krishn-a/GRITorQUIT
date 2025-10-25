// backend/routes/upload.js
import express from "express";
import XLSX from "xlsx";
import fs from "fs";
import Plan from "../models/Plan.js";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/import", protect, upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const planData = parseExcelData(data, req.body.planName);
    planData.createdBy = req.user._id;
    
    const plan = new Plan(planData);
    const savedPlan = await plan.save();

    fs.unlinkSync(req.file.path);
    res.json(savedPlan);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

function parseExcelData(data, planName) {
  const headers = data[0].slice(1);
  const descriptionRowIndex = data.findIndex((row) => row[0] === "Description");
  const statusRowIndex = data.findIndex((row) => row[0] === "Status");
  const priorityRowIndex = data.findIndex((row) => row[0] === "Priority");

  const taskRows = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] && data[i][0].startsWith("Task")) {
      taskRows.push(i);
    }
  }

  const tasks = [];
  const startDate = new Date();

  headers.forEach((dayHeader, dayIndex) => {
    const columnIndex = dayIndex + 1;
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIndex);

    const dayDescription = data[descriptionRowIndex]?.[columnIndex] || "";

    taskRows.forEach((taskRowIndex) => {
      const taskTitle = data[taskRowIndex]?.[columnIndex];
      if (!taskTitle) return;

      const subtasks = [];
      let subtaskIndex = taskRowIndex + 1;
      while (
        subtaskIndex < data.length &&
        data[subtaskIndex]?.[0]?.startsWith("→")
      ) {
        const subtaskTitle = data[subtaskIndex]?.[columnIndex];
        if (subtaskTitle) {
          subtasks.push({ title: subtaskTitle, completed: false });
        }
        subtaskIndex++;
      }

      const status = data[statusRowIndex]?.[columnIndex] || "Not Started";
      const priority = data[priorityRowIndex]?.[columnIndex] || "Medium";

      tasks.push({
        title: taskTitle,
        description: dayDescription,
        date: currentDate,
        subtasks,
        tags: ["work", "development"],
        status,
        priority,
        estimatedTime: 60,
        completed: status === "Completed",
      });
    });
  });

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + headers.length);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    title: planName || "Imported Plan",
    description: "Plan imported from Excel file",
    startDate,
    endDate,
    tasks,
    progress,
    totalTasks,
    completedTasks,
  };
}

export default router;