import { useState } from "react";
import "./InopticsAI.css"
export default function InopticsAI() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  const send = async () => {
    const res = await fetch("https://inoptics.in/api/inoptics_ai.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();

    setChat([...chat, { user: msg, ai: data.reply }]);
    setMsg("");
  };

  return (
    <div className="ai-box">
      <div className="chat-area">
        {chat.map((c, i) => (
          <div key={i}>
            <b>You:</b> {c.user}<br/>
            <b>InOptics AI:</b> {c.ai}
          </div>
        ))}
      </div>
      <input value={msg} onChange={e=>setMsg(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}
