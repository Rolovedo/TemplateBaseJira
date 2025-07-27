import express from "express";
import jwt from "jsonwebtoken";
import { loginController } from "./auth.controller.js";

const authRoutes = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_muy_segura_para_tablero_2024";

console.log("🔐 Configurando rutas de autenticación...");

// Ruta de login principal (la que usa PONTO)
authRoutes.post("/login", loginController);

// Login específico para tablero (temporal/simulado)
authRoutes.post("/tablero-login", async (req, res) => {
  try {
    console.log("🔐 Login tablero solicitado");
    const { usuario, clave } = req.body;

    if (!usuario || !clave) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son requeridos",
      });
    }

    // SIMULACIÓN TEMPORAL - En producción aquí iría la validación real
    if (usuario && clave) {
      // Generar token JWT
      const token = jwt.sign(
        {
          usu_id: 1,
          email: usuario.includes('@') ? usuario : 'admin@tablero.com',
          nombre: "Administrador Sistema",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      console.log("✅ Token generado para usuario:", usuario);

      res.json({
        success: true,
        message: "Login exitoso",
        token,
        usuId: 1,
        usuFoto: null,
        nombre: "Administrador Sistema",
        usuario: usuario,
        correo: usuario.includes('@') ? usuario : 'admin@tablero.com',
        telefono: null,
        documento: null,
        perfil: 1,
        agenda: 1,
        instructor: 0,
        permisos: [],
        ventanas: [],
        cambioclave: 0,
        user: {
          usu_id: 1,
          nombre: "Administrador Sistema",
          email: usuario.includes('@') ? usuario : 'admin@tablero.com',
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }
  } catch (error) {
    console.error("❌ Error en login tablero:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// Verificar token
authRoutes.get("/verify-token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token requerido",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      user: {
        usu_id: decoded.usu_id,
        nombre: decoded.nombre,
        email: decoded.email,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
});

console.log("✅ Rutas de autenticación configuradas");

export default authRoutes;
