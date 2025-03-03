import { useState, useCallback, useEffect, useRef } from "react";
import { FaPaperPlane, FaSpinner, FaImage } from "react-icons/fa";

export default function NeetChatbot() {
  interface Message {
    text: string;
    sender: "user" | "bot";
    image: string | null;
  }
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput && !image) {
      setError("Please enter a message or upload an image.");
      return;
    }

    setError("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { text: trimmedInput, sender: "user", image: image ? URL.createObjectURL(image) : null },
    ]);
    setInput("");
    setImage(null);

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      setMessages((prev) => [...prev, { text: "API key missing.", sender: "bot", image: null }]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://api.openai.com/v1/chat/completions?t=${new Date().getTime()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: trimmedInput }],
        }),
      });

      const responseText = await response.text();
      console.log("API Response:", responseText);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = JSON.parse(responseText);
      const botReply = data?.choices?.[0]?.message?.content || "Couldn't fetch an answer.";

      setMessages((prev) => [...prev, { text: botReply, sender: "bot", image: null }]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: `Error: ${(error as Error).message}`, sender: "bot", image: null }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, image]);

  return (
    <div className="p-4 w-full max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold text-center mb-4">NEET Chatbot</h1>
      <div className="h-80 overflow-y-auto border p-2 rounded-lg bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-3 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            {msg.image && <img src={msg.image} alt="User Upload" className="max-w-xs mb-2 rounded" />}
            <p className={`p-2 rounded-lg inline-block max-w-[80%] break-words ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>{msg.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-3">
            <p className="bg-gray-200 p-2 rounded-lg inline-block max-w-[80%] break-words flex items-center">
              <FaSpinner className="animate-spin mr-2" /> Typing...
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex mt-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImage(e.target.files[0]);
            }
          }}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="bg-gray-200 p-2 rounded-l-lg cursor-pointer">
          <FaImage />
        </label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border p-2 h-16 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask me anything about NEET..."
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
        </button>
      </div>
    </div>
  );
}
