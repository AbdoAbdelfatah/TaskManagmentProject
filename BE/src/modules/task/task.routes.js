import { Router } from "express";
import {
  createTask,
  getUserTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./task.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

// All task routes require authentication
router.use(protect);

// Task CRUD routes
router
  .route("/")
  .post(createTask) // Create task
  .get(getUserTasks); // Get all user tasks

router
  .route("/:id")
  .get(getTaskById) // Get single task
  .put(updateTask) // Update task
  .delete(deleteTask); // Delete task

export default router;
