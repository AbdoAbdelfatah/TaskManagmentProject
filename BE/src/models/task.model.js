import { DataTypes } from "sequelize";
import { getSequelize } from "../config/db.config.js";
import User from "./user.model.js";

const Task = getSequelize().define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Title is required" },
        len: {
          args: [1, 255],
          msg: "Title must be between 1 and 255 characters",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "done"),
      defaultValue: "pending",
      validate: {
        isIn: {
          args: [["pending", "in_progress", "done"]],
          msg: "Status must be pending, in_progress, or done",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    tableName: "tasks",
  }
);

// Define relationships
User.hasMany(Task, { foreignKey: "userId", onDelete: "CASCADE" });
Task.belongsTo(User, { foreignKey: "userId" });

export default Task;
