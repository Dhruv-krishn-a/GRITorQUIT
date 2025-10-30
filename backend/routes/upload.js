//backend/routes/upload.js
import express from "express";
import XLSX from "xlsx";
import fs from "fs";
import Plan from "../models/Plan.js";
import upload, { handleUploadErrors } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Use the upload middleware with error handling
router.post("/import",
  protect,
  (req, res, next) => {
    console.log("Starting import process...");
    next();
  },
  upload.single("excelFile"),
  handleUploadErrors,
  async (req, res) => {
    console.log("Import request received");
    console.log("File:", req.file);
    console.log("Plan name:", req.body.planName);

    try {
      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Check if file exists
      if (!fs.existsSync(req.file.path)) {
        console.log("File not found at path:", req.file.path);
        return res.status(500).json({ message: "Uploaded file not found" });
      }

      console.log("Reading Excel file...");
      let workbook;
      try {
        workbook = XLSX.readFile(req.file.path);
        console.log("Excel file read successfully");
      } catch (excelError) {
        console.error("Excel read error:", excelError);
        // Clean up the invalid file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: "Invalid Excel file format or corrupted file" });
      }

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        // Clean up file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: "Excel file has no sheets" });
      }

      const worksheet = workbook.Sheets[sheetName];
      
      // CRITICAL FIX: Make sure data is defined and logged
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log("✅ Excel data loaded successfully");
      console.log("Excel data shape:", {
        rows: data.length,
        columns: data[0] ? data[0].length : 0
      });

      // Debug: Log first few rows
      console.log("=== FIRST 5 ROWS OF EXCEL DATA ===");
      data.slice(0, 5).forEach((row, index) => {
        console.log(`Row ${index}:`, row);
      });
      console.log("=== END EXCEL DATA PREVIEW ===");

      if (!data || data.length === 0) {
        // Clean up file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: "Excel file is empty" });
      }

      console.log("📖 Parsing Excel data...");
      
      // FIX: Pass the data correctly
      const planData = parseExcelData(data, req.body.planName);
      
      // Validate the parsed data
      if (!planData) {
        throw new Error("Failed to parse Excel data - parseExcelData returned null or undefined");
      }
      
      if (!planData.tasks || !Array.isArray(planData.tasks)) {
        throw new Error("Failed to parse Excel data - no tasks were generated");
      }
      
      planData.createdBy = req.user._id;
      console.log("📖 Plan data prepared:", {
        title: planData.title,
        tasks: planData.tasks.length,
        startDate: planData.startDate,
        endDate: planData.endDate
      });

      const plan = new Plan(planData);
      const savedPlan = await plan.save();

      console.log("✔️ Plan saved successfully:", savedPlan._id);

      // Clean up uploaded file
      try {
        fs.unlinkSync(req.file.path);
        console.log("📖 Temporary file cleaned up");
      } catch (cleanupError) {
        console.warn("🔴 Could not delete temporary file:", cleanupError);
      }

      res.json(savedPlan);
    } catch (error) {
      console.error("❌ Import error details:");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn("🔴 Could not delete temporary file on error:", cleanupError);
        }
      }

      // Handle specific errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: "Invalid plan data",
          details: Object.values(error.errors).map(e => e.message)
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Plan with this title already exists"
        });
      }

      res.status(500).json({
        message: error.message || "Failed to import Excel file"
      });
    }
  }
);

function parseExcelData(data, planName) {
  console.log("🔄 Starting Excel data parsing...");
  console.log("📊 Data received for parsing:", data ? `Array with ${data.length} rows` : 'NULL OR UNDEFINED');
  
  // CRITICAL FIX: Check if data is defined
  if (!data) {
    console.error("❌ parseExcelData: data parameter is null or undefined");
    throw new Error("No data provided for parsing");
  }

  if (!Array.isArray(data)) {
    console.error("❌ parseExcelData: data is not an array", typeof data);
    throw new Error("Invalid data format - expected array");
  }

  if (data.length === 0) {
    console.error("❌ parseExcelData: data array is empty");
    throw new Error("No data available for parsing");
  }

  try {
    // Log the first few rows to understand the structure
    console.log("First 3 rows of data:");
    data.slice(0, 3).forEach((row, index) => {
      console.log(`Row ${index}:`, row);
    });

    // FIX: Add null checks for data[0]
    const headers = data[0] ? data[0].slice(1) : [];
    console.log("Headers found:", headers);

    // FIX: Add proper null checks for findIndex
    const descriptionRowIndex = data.findIndex((row) => row && row[0] && row[0].toString().trim() === "Description");
    const statusRowIndex = data.findIndex((row) => row && row[0] && row[0].toString().trim() === "Status");
    const priorityRowIndex = data.findIndex((row) => row && row[0] && row[0].toString().trim() === "Priority");

    console.log("Row indices:", {
      descriptionRowIndex,
      statusRowIndex,
      priorityRowIndex
    });

    // Find task rows more robustly
    const taskRows = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i] && data[i][0] && typeof data[i][0] === 'string' && data[i][0].trim().toLowerCase().startsWith("task")) {
        taskRows.push(i);
      }
    }

    console.log("Task rows found at indices:", taskRows);

    const tasks = [];
    const startDate = new Date();
    console.log("Using start date:", startDate);

    // Process each day/column
    headers.forEach((dayHeader, dayIndex) => {
      const columnIndex = dayIndex + 1;
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayIndex);

      // FIX: Add bounds checking
      const dayDescription = (descriptionRowIndex !== -1 && data[descriptionRowIndex] && data[descriptionRowIndex][columnIndex]) || "";
      
      taskRows.forEach((taskRowIndex) => {
        // FIX: Check if data[taskRowIndex] exists
        if (!data[taskRowIndex]) return;
        
        const taskTitle = data[taskRowIndex][columnIndex];
        if (!taskTitle) return;

        const subtasks = [];
        let subtaskIndex = taskRowIndex + 1;
        
        // Find subtasks for this task
        while (
          subtaskIndex < data.length &&
          data[subtaskIndex] &&
          data[subtaskIndex][0] &&
          typeof data[subtaskIndex][0] === 'string' &&
          (data[subtaskIndex][0].trim().startsWith("-") || data[subtaskIndex][0].trim().startsWith("→"))
        ) {
          const subtaskTitle = data[subtaskIndex] && data[subtaskIndex][columnIndex];
          if (subtaskTitle) {
            subtasks.push({ title: subtaskTitle, completed: false });
          }
          subtaskIndex++;
        }

        // Get status and priority with fallbacks
        const status = (statusRowIndex !== -1 && data[statusRowIndex] && data[statusRowIndex][columnIndex]) || "Not Started";
        const priority = (priorityRowIndex !== -1 && data[priorityRowIndex] && data[priorityRowIndex][columnIndex]) || "Medium";

        tasks.push({
          title: taskTitle.toString().trim(),
          description: dayDescription.toString().trim(),
          date: currentDate,
          subtasks,
          tags: ["imported"],
          status: status.toString().trim(),
          priority: priority.toString().trim(),
          estimatedTime: 60,
          completed: status.toString().trim() === "Completed",
        });
      });
    });

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + headers.length);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    console.log("✅ Parsing completed:", {
      tasks: tasks.length,
      totalTasks,
      completedTasks,
      progress
    });

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
  } catch (parseError) {
    console.error("❌ Error in parseExcelData:", parseError);
    throw new Error(`Failed to parse Excel data: ${parseError.message}`);
  }
}

export default router;