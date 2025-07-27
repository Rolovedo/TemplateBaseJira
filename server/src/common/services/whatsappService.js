import twilio from "twilio";
import dotenv from "dotenv";
import moment from "moment";
import "moment/locale/es.js"; // Importa el locale español
import { executeQuery } from "../configs/db.config.js";
moment.locale("es");
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const whatsappFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

const client = new twilio(accountSid, authToken);

export async function sendWhatsAppTemplateMessage(
  to,
  {
    nombrePaciente = "Paciente",
    empresa = "Ponto",
    tipoCita,
    fecha = new Date(),
    hora = "una hora",
    tipoAgendamiento,
    usuId,
    citId,
    connection = null,
  },
  contentSid = null,
  contentVariables = null
) {
  if (!to || !usuId || !citId)
    return { success: false, error: "Datos incompletos." };

  const NormalizeDate = moment(fecha).format("DD [de] MMMM");
  const NormalizeHour = moment(hora, "HH:mm").format("hh:mm A");

  try {
    const response = await client.messages.create({
      from: `whatsapp:+18148920223`,
      to: `whatsapp:+57${to}`,
      contentSid: "HXc76ea4c1c44e66761155fb68d8280996",
      contentVariables: JSON.stringify({
        1: nombrePaciente,
        2: empresa,
        3: tipoCita,
        4: NormalizeDate,
        5: NormalizeHour,
        6: tipoAgendamiento,
      }),
    });

    // const response = {
    //   sid: 1,
    //   to,
    //   dateCreated: new Date(),
    // };

    // Guardar en tbl_mensajes_enviados
    await executeQuery(
      `INSERT INTO tbl_mensajes_enviados (cit_id, usu_id, msg_medio, msg_id_envio)
       VALUES (?, ?, 'whatsapp', ?)`,
      [citId, usuId, response.sid],
      connection
    );

    console.log({ response });
    return {
      success: true,
      sid: response.sid,
      to: response.to,
      date: response.dateCreated,
    };
  } catch (error) {
    console.error("❌ Error al enviar plantilla:", error.message || error);
    return { success: false, error: error.message || error };
  }
}

export const sendWhatsAppMessage = async ({
  to,
  from = `whatsapp:+18148920223`,
  contentSid,
  contentVariables,
  twilioAccountSid,
  twilioAuthToken,
  connection = null,
  citId = null,
  usuId = null,
  saveToDb = false,
}) => {
  if (
    !to ||
    !from ||
    !contentSid ||
    !contentVariables ||
    !twilioAccountSid ||
    !twilioAuthToken
  ) {
    return { success: false, error: "Faltan parámetros obligatorios." };
  }

  const client = new twilio(twilioAccountSid, twilioAuthToken);

  try {
    const response = await client.messages.create({
      from,
      to,
      contentSid,
      contentVariables: JSON.stringify(contentVariables),
    });

    if (saveToDb && citId && usuId) {
      await executeQuery(
        `INSERT INTO tbl_mensajes_enviados (cit_id, usu_id, msg_medio, msg_id_envio)
         VALUES (?, ?, 'whatsapp', ?)`,
        [citId, usuId, response.sid],
        connection
      );
    }

    return {
      success: true,
      sid: response.sid,
      to: response.to,
      date: response.dateCreated,
    };
  } catch (error) {
    return { success: false, error: error.message || error };
  }
};
