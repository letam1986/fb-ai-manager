export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message || body.comment || "";

    if (!message) {
      return Response.json({
        reply: "Mình chưa nhận được nội dung tin nhắn.",
      });
    }

    console.log("KEY EXISTS:", !!process.env.OPENROUTER_API_KEY);
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemma-3-4b-it",
        messages: [
          {
            role: "system",
            content:
              "Bạn là admin page Góc nhìn nam nữ. Trả lời bằng tiếng Việt, ngắn gọn, tự nhiên, thân thiện, không tranh cãi, khơi gợi thảo luận. Tối đa 2 câu.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const aiData = await aiRes.json();

    console.log("OPENROUTER DATA:", JSON.stringify(aiData, null, 2));

    const reply =
      aiData?.choices?.[0]?.message?.content ||
      "Mình chưa hiểu rõ ý bạn, bạn nói thêm giúp mình nhé 😊";

    return Response.json({ reply });
  } catch (error) {
    console.error("REPLY ERROR:", error);

    return Response.json({
      reply: "Xin lỗi, hiện tại mình đang bận một chút. Bạn nhắn lại giúp mình nhé 😊",
    });
  }
}