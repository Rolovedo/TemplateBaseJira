import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";
import twilio from "twilio";
import dotenv from "dotenv";
import moment from "moment";
import "moment/locale/es.js"; // Importa el locale español
import { insertNotification } from "../../app/notifications/notifications.controller.js";

moment.locale("es");
dotenv.config();

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
// const whatsappFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

export const receiveWhatsappResponse = async (req, res) => {
  const {
    From,
    Body,
    SmsStatus,
    ButtonPayload: respuesta,
    OriginalRepliedMessageSid,
    SmsSid,
  } = req.body;

  console.log("📩 Webhook recibido desde Twilio:", req.body);

  if (!From || !Body || !SmsStatus)
    return res.type("text/xml").send("<Response></Response>");

  // const numero = From.replace("whatsapp:+57", "").trim();
  // const mensaje = Body.trim().toLowerCase();

  let connection = null;
  try {
    connection = await getConnection();

    if (SmsStatus != "received")
      return res.type("text/xml").send("<Response></Response>"); // si hubo una respuesta

    if (!OriginalRepliedMessageSid) {
      console.error("OriginalRepliedMessageSid undefined", { Body });
      return res.type("text/xml").send("<Response></Response>");
    }

    const [cita] = await executeQuery(
      `SELECT c.cit_id, c.cit_fecha AS fechaCita, c.cit_hora_inicio AS horaInicio,  c.usu_id, cit_usu_reg AS usuReg, u.usu_telefono AS usuTelefono 
       FROM tbl_citas c
       JOIN tbl_usuarios u ON u.usu_id = c.usu_id
       JOIN tbl_mensajes_enviados m ON (m.cit_id = c.cit_id)
       WHERE m.msg_id_envio = ? AND c.esc_id = 1
       ORDER BY c.cit_fecha DESC, c.cit_hora_inicio DESC LIMIT 1`,
      [OriginalRepliedMessageSid],
      connection
    );

    if (!cita) return res.type("text/xml").send("<Response></Response>");

    const NormalizeDate = moment(cita.fechaCita).format("DD [de] MMMM");
    const NormalizeHour = moment(cita.horaInicio, "HH:mm").format("hh:mm A");

    const opciones = {
      1: {
        id: 4,
        texto: "✅ Tu asistencia fue confirmada.",
        contentSid: "HX0186e364cefa7f62aa3ec07832abbe44",
        contentVariables: JSON.stringify({
          1: NormalizeDate,
          2: NormalizeHour,
          3: "Cra. 25 #12 sur - 59. Sótano 2, local 9814", // traer valor de reglas
          4: "3152277720",
        }),
      },
      2: {
        id: 3,
        texto: "🗑️ Has cancelado tu cita.",
        contentSid: "HXa31cc3d37f6278d4bde0b91708d18541",
        contentVariables: JSON.stringify({
          1: "3152277720",
        }),
      },
      3: {
        id: 7,
        texto:
          "📆 Has solicitado reprogramar la cita,  Vamos a contactarte para reprogramar tu cita.",
        contentSid: "HXa31cc3d37f6278d4bde0b91708d18541",
        contentVariables: JSON.stringify({
          1: "",
        }),
      },
    };
    const nuevoEstado = opciones[Number(respuesta)]?.id;
    const texto = opciones[Number(respuesta)]?.texto;
    const contentSid = opciones[Number(respuesta)]?.contentSid;
    const contentVariables = opciones[Number(respuesta)]?.contentVariables;
    await executeQuery(
      `UPDATE tbl_citas SET esc_id = ? WHERE cit_id = ?`,
      [nuevoEstado, cita.cit_id || 0],
      connection
    );

    await executeQuery(
      `UPDATE tbl_mensajes_enviados SET msg_id_respuesta = ?,  msg_fec_respuesta = NOW() WHERE cit_id = ?`,
      [SmsSid, cita.cit_id],
      connection
    );

    await executeQuery(
      `INSERT INTO tbl_confirmacion_asistencia (
         cit_id, usu_id, con_medio, con_estado, con_mensaje
       ) VALUES (?, ?, 'whatsapp', ?, ?)`,
      [cita.cit_id, cita.usu_id, "respondido", texto],
      connection
    );

    //Socket para notificaciones en el aplicativo para el admin.usuReg
    let titulo = "Cita";
    let mensaje = "";
    let tipo = "informativa";

    // Obtener información adicional del paciente
    const [paciente] = await executeQuery(
      `SELECT usu_nombre AS nombre, usu_telefono AS telefono, usu_correo AS correo
       FROM tbl_usuarios WHERE usu_id = ?`,
      [cita.usu_id],
      connection
    );

    // Obtener el nombre de la sesión asociada a la cita
    const [sesion] = await executeQuery(
      `SELECT sac_nombre AS nombreSesion
       FROM tbl_sesion_actividad s
       JOIN tbl_citas c ON c.sac_id = s.sac_id
       WHERE c.cit_id = ?`,
      [cita.cit_id],
      connection
    );
    const nombreSesion = sesion?.nombreSesion
      ? ` (${sesion.nombreSesion})`
      : "";

    const nombrePaciente = paciente?.nombre || "Paciente";
    const telefonoPaciente = paciente?.telefono || "N/A";
    const correoPaciente = paciente?.correo || "N/A";

    if (nuevoEstado === 4) {
      titulo = `Confirmación de asistencia: ${nombrePaciente}${nombreSesion}`;
      mensaje = `El paciente ${nombrePaciente} (Tel: ${telefonoPaciente}, Email: ${correoPaciente}) confirmó su asistencia a la cita${nombreSesion} del ${NormalizeDate} a las ${NormalizeHour}.`;
      tipo = "confirmacion";
    } else if (nuevoEstado === 3) {
      titulo = `Cancelación de cita: ${nombrePaciente}${nombreSesion}`;
      mensaje = `El paciente ${nombrePaciente} (Tel: ${telefonoPaciente}, Email: ${correoPaciente}) canceló su cita${nombreSesion} programada para el ${NormalizeDate} a las ${NormalizeHour}.`;
      tipo = "cancelacion";
    } else if (nuevoEstado === 7) {
      titulo = `Solicitud de reprogramación: ${nombrePaciente}${nombreSesion}`;
      mensaje = `El paciente ${nombrePaciente} (Tel: ${telefonoPaciente}, Email: ${correoPaciente}) solicitó reprogramar la cita${nombreSesion} del ${NormalizeDate} a las ${NormalizeHour}.`;
      tipo = "reprogramacion";
    }

    await insertNotification({
      userId: cita.usuReg, // usuario que debe recibir la notificación (ej: admin que creó la cita)
      prioridad: "media",
      titulo,
      mensaje,
      tipo,
      modulo: "Citas",
      accion: "respuesta_whatsapp",
      data: { citId: cita.cit_id, usu_id: cita.usuReg },
      connection,
    });

    await client.messages.create({
      from: `whatsapp:+18148920223`,
      to: From,
      contentSid: contentSid,
      contentVariables: contentVariables,
    });
    res.type("text/xml").send("<Response></Response>");
  } catch (err) {
    console.error("Error en webhook de WhatsApp:", err);
    return res.type("text/xml").send("<Response></Response>");
  } finally {
    if (connection) releaseConnection(connection);
  }
};
