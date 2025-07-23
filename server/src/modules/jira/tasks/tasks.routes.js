import express from "express";
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    addCollaborator,
    removeCollaborator,
    getTasksByDeveloper,
    getTasksByStatus,
    requestTaskChange
} from "./tasks.controller.js";
import { authenticateToken } from "../../../common/middlewares/auth.middleware.js";

const router = express.Router();

// Rutas para gestión de tareas
router.get("/", authenticateToken, getTasks);
router.get("/:id", authenticateToken, getTaskById);
router.post("/", authenticateToken, createTask);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);

// Rutas específicas para el tablero
router.put("/:id/status", authenticateToken, updateTaskStatus);
router.post("/:id/assign", authenticateToken, assignTask);
router.post("/:id/collaborators", authenticateToken, addCollaborator);
router.delete("/:id/collaborators/:userId", authenticateToken, removeCollaborator);

// Rutas para consultas específicas
router.get("/developer/:developerId", authenticateToken, getTasksByDeveloper);
router.get("/status/:status", authenticateToken, getTasksByStatus);

// Ruta para solicitar cambio de tarea
router.post("/:id/request-change", authenticateToken, requestTaskChange);

export default router;
