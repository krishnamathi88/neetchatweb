import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

function renderMessage(text) {
  const isMath = text.includes("$");
  return isMath ? <BlockMath math={text.replace(/\$/g, "")} /> : text;
}

{messages.map((msg, index) => (
  <div key={index} className={msg.sender === "user" ? "text-right" : "text-left"}>
    <p className={`p-2 rounded-lg inline-block max-w-xs ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
      {renderMessage(msg.text)}
    </p>
  </div>
))}
