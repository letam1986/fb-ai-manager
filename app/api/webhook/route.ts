const VERIFY_TOKEN = "tam_ai";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === VERIFY_TOKEN
  ) {
    return new Response(challenge, {
      status: 200,
    });
  }

  return new Response("Forbidden", {
    status: 403,
  });
}
const processedMessages = new Set<string>();
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("WEBHOOK DATA:", JSON.stringify(body, null, 2));

    const events = body.entry?.[0]?.messaging || [];

    for (const messaging of events) {
      if (!messaging?.message?.text) {
        console.log("BỎ QUA EVENT KHÔNG CÓ TEXT");
        continue;
      }

      if (messaging.message.is_echo) {
        console.log("BỎ QUA ECHO");
        continue;
      }

      const senderId = messaging.sender?.id;
      const pageId = body.entry?.[0]?.id;
      const messageId = messaging.message.mid;
      const messageText = messaging.message.text;

      if (senderId === pageId) {
        console.log("BỎ QUA TIN TỪ PAGE");
        continue;
      }

      if (processedMessages.has(messageId)) {
        console.log("BỎ QUA TIN NHẮN LẶP");
        continue;
      }

      processedMessages.add(messageId);

      console.log("TIN NHẮN:", messageText);

      const response = await fetch("https://fb-ai-manager.vercel.app/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();
      console.log("AI TRẢ LỜI:", data.reply);

      const fbRes = await fetch(
        `https://graph.facebook.com/v25.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: { id: senderId },
            message: { text: data.reply },
          }),
        }
      );

      const fbData = await fbRes.json();
      console.log("FACEBOOK SEND RESULT:", fbData);
    }

    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return new Response("EVENT_RECEIVED", { status: 200 });
  }
}