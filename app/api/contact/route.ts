import { Resend } from "resend";

const RECIPIENT = "julianagrolandia@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name: string;
  email: string;
  msg: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ContactPayload>;
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const msg = body.msg?.trim() ?? "";

  if (!name || !email || !msg) {
    return Response.json({ ok: false, error: "Todos los campos son obligatorios." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "El correo electrónico no es válido." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { ok: false, error: "El servicio de correo no está configurado." },
      { status: 500 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: RECIPIENT,
    replyTo: email,
    subject: "Nuevo mensaje de contacto — Arcade Vault",
    text: `Nombre: ${name}\nCorreo: ${email}\n\n${msg}`,
  });

  if (error) {
    return Response.json({ ok: false, error: "No se pudo enviar el mensaje." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
