import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();
let sequelize;

const initDB = () => {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || "mysql",
    }
  );
};

export const getSequelize = () => {
  if (!sequelize) {
    initDB();
  }
  return sequelize;
};

export const connectDB = async () => {
  try {
    const db = getSequelize();
    await db.authenticate();
    await db.sync({ alter: true, force: false });
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};
