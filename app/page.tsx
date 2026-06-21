"use client";

import { useState } from "react";

export default function Home() {
  const [comment, setComment] = useState("");
  const [reply, setReply] = useState("");

  const generateReply = async () => {
    try {
      if (!comment.trim()) {
        setReply("Bạn hãy nhập comment trước nhé.");
        return;
      }

      const res = await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment,
        }),
      });

      const data = await res.json();

      setReply(data.reply);
    } catch (error) {
      console.log(error);
      setReply("Có lỗi xảy ra khi tạo câu trả lời.");
    }
  };

  return (
    <main style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>FB AI Manager</h1>

      <p>Trạng thái Facebook: Chưa kết nối</p>

      <h2>Test AI trả lời comment qua API</h2>

      <textarea
        rows={5}
        style={{ width: "100%", padding: 10 }}
        placeholder="Nhập comment của người xem..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <br />
      <br />

      <button onClick={generateReply}>Tạo câu trả lời</button>

      <h2>Câu trả lời AI</h2>

      <div
        style={{
          padding: 15,
          border: "1px solid #ccc",
          borderRadius: 8,
          minHeight: 80,
        }}
      >
        {reply}
      </div>

      <hr />

      <h2>Giọng đọc AI sau này</h2>
      <ul>
        <li>Giọng nam</li>
        <li>Giọng nữ</li>
        <li>Giọng thiếu niên 16 tuổi</li>
      </ul>
    </main>
  );
}