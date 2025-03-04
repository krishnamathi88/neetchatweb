import React, { useState, useCallback, useEffect, useRef, CSSProperties } from "react";
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
    <div style={styles.container}>
      <h1 style={styles.heading}>neet.ai</h1>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={{ ...styles.message, alignSelf: msg.sender === "user" ? "flex-end" : "flex-start" }}>
            {msg.image && <img src={msg.image} alt="User Upload" style={styles.image} />}
            <p style={msg.sender === "user" ? styles.userMessage : styles.botMessage}>{msg.text}</p>
          </div>
        ))}
        {isLoading && (
          <div style={styles.loading}>
            <FaSpinner style={styles.spinner} /> Typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <p style={styles.errorText}>{error}</p>}
      <div style={styles.inputContainer}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImage(e.target.files[0]);
            }
          }}
          style={{ display: "none" }}
          id="fileInput"
        />
        <label htmlFor="fileInput" style={styles.iconButton}>
          <FaImage />
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
          placeholder="Ask me anything about NEET..."
          style={styles.input}
        />
        <button
          onClick={handleSend}
          style={styles.sendButton}
          disabled={isLoading}
        >
          {isLoading ? <FaSpinner style={styles.spinner} /> : <FaPaperPlane />}
        </button>
      </div>
      <div style={styles.watermark}>constructiveai.in</div>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    padding: "16px",
    width: "100%",
    height: "100vh",
    margin: "0",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#f8f8f8",
  },
  message: {
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column",
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#007bff",
    color: "#ffffff",
    padding: "10px",
    borderRadius: "8px",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#e0e0e0",
    padding: "10px",
    borderRadius: "8px",
    alignSelf: "flex-start",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    padding: "10px",
    borderRadius: "8px",
  },
  spinner: {
    marginRight: "8px",
    animation: "spin 1s linear infinite",
  },
  image: {
    maxWidth: "150px",
    marginBottom: "8px",
    borderRadius: "4px",
  },
  inputContainer: {
    display: "flex",
    marginTop: "42px",
    alignItems: "center",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    outline: "none",
    fontSize: "16px",
  },
  iconButton: {
    backgroundColor: "#e0e0e0",
    padding: "10px",
    borderRadius: "4px 0 0 4px",
    cursor: "pointer",
  },
  sendButton: {
    backgroundColor: "#007bff",
    color: "#ffffff",
    padding: "10px",
    borderRadius: "0 4px 4px 0",
    cursor: "pointer",
    border: "none",
  },
  errorText: {
    color: "red",
    fontSize: "14px",
    marginTop: "8px",
  },
  watermark: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    fontSize: "12px",
    color: "#ccc",
  },
};
