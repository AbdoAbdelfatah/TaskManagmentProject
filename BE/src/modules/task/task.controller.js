import Task from "../../models/task.model.js";
import User from "../../models/user.model.js";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { successResponse } from "../../utils/response.util.js";

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, status } = req.body;

  // Validate required field
  if (!title) {
    throw new ErrorClass("Title is required", 400, null, "createTask");
  }

  const task = await Task.create({
    title,
    description,
    status: status || "pending",
    userId: req.user.id,
  });

  return successResponse(res, 201, "Task created successfully", { task });
});

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
export const getUserTasks = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const whereClause = { userId: req.user.id };

  // Filter by status if provided
  if (status && ["pending", "in_progress", "done"].includes(status)) {
    whereClause.status = status;
  }

  const tasks = await Task.findAll({
    where: whereClause,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
  });

  return successResponse(res, 200, "Tasks retrieved successfully", {
    count: tasks.length,
    tasks,
  });
});

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
export const getTaskById = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id, // Ensure user can only access their own tasks
    },
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
  });

  if (!task) {
    throw new ErrorClass("Task not found", 404, null, "getTaskById");
  }

  return successResponse(res, 200, "Task retrieved successfully", { task });
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
export const updateTask = asyncHandler(async (req, res, next) => {
  const { title, description, status } = req.body;

  const task = await Task.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id, // Ensure user can only update their own tasks
    },
  });

  if (!task) {
    throw new ErrorClass("Task not found", 404, null, "updateTask");
  }

  // Update task
  await task.update({
    title: title || task.title,
    description: description !== undefined ? description : task.description,
    status: status || task.status,
  });

  return successResponse(res, 200, "Task updated successfully", { task });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id, // Ensure user can only delete their own tasks
    },
  });

  if (!task) {
    throw new ErrorClass("Task not found", 404, null, "deleteTask");
  }

  await task.destroy();

  return successResponse(res, 200, "Task deleted successfully", null);
});
