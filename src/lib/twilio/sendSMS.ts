export async function sendSMS(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Missing Twilio environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)");
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: fromNumber, Body: body }).toString(),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio SMS failed (${res.status}): ${text}`);
  }
}

export function buildIntakeSMSBody(firstName: string, intakeUrl: string): string {
  return `Hi ${firstName}! Tyler at Sublime Design NV here. Tap the link below to share your project details and inspiration — we'll use it to show you a visual concept before we ever start measuring. Takes about 5 minutes.\n\n${intakeUrl}`;
}
