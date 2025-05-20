import React, { useState, useCallback, useEffect, useRef } from "react";
import { FaPaperPlane, FaSpinner, FaImage } from "react-icons/fa";
import { CSSProperties } from "react";

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
  const [userApiKey, setUserApiKey] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);
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
      {
        text: trimmedInput,
        sender: "user",
        image: image ? URL.createObjectURL(image) : null,
      },
    ]);
    setInput("");
    setImage(null);

    const apiKey = userApiKey;
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { text: "API key missing.", sender: "bot", image: null },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://api.deepseek.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: trimmedInput }],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const botReply =
        data?.choices?.[0]?.message?.content || "Couldn't fetch an answer.";

      setMessages((prev) => [
        ...prev,
        { text: botReply, sender: "bot", image: null },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          sender: "bot",
          image: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, image, userApiKey]);

  return (
    <div style={styles.pageWrapper}>

      <h1 style={styles.heading}>
  Welcome to <span style={{ color: "#007bff" }}>NEET Ai</span> – An AI Assistant for your NEET Exams
</h1>

      <div style={styles.apiKeyBox}>
        <input
          type="password"
          placeholder="Enter your API Key"
          value={userApiKey}
          onChange={(e) => setUserApiKey(e.target.value)}
          style={styles.apiKeyInput}
        />
        <button
          onClick={() => {
            if (userApiKey.trim()) {
              setIsApiKeySet(true);
            }
          }}
          style={styles.unlockButton}
        >
          Unlock Chat
        </button>
      </div>

      {isApiKeySet ? (
        <div style={styles.container}>
          <div style={styles.chatBox}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="User Upload"
                    style={styles.image}
                  />
                )}
                <p
                  style={
                    msg.sender === "user"
                      ? styles.userMessage
                      : styles.botMessage
                  }
                >
                  {msg.text}
                </p>
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
              onKeyPress={(e) =>
                e.key === "Enter" && !isLoading && handleSend()
              }
              placeholder="Type your question..."
              style={styles.input}
            />
            <button
              onClick={handleSend}
              style={styles.sendButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <FaSpinner style={styles.spinner} />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>

          <div style={styles.watermark}>constructiveai.in</div>
        </div>
      ) : (
        <div style={styles.lockedMessage}>
          Chatbot locked. Enter API key above to unlock.
        </div>
      )}

      <div style={styles.contactInfo}>
        Please contact <b>krishnamathi88@gmail.com</b> or <b>+91 96296 77059</b>{" "}
        (WhatsApp) for an API Key.
      </div>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  pageWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#eef2f5",
    padding: "20px",
  },
  apiKeyBox: {
    marginBottom: "20px",
    display: "flex",
    gap: "10px",
  },
  apiKeyInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "250px",
    fontSize: "14px",
  },
  unlockButton: {
    padding: "10px 16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  container: {
    width: "400px",
    height: "600px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    backgroundColor: "#f4f6f8",
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
    padding: "10px 14px",
    borderRadius: "16px 16px 0 16px",
    fontSize: "14px",
    alignSelf: "flex-end",
    lineHeight: "1.4",
  },
  botMessage: {
    backgroundColor: "#e5e5ea",
    padding: "10px 14px",
    borderRadius: "16px 16px 16px 0",
    fontSize: "14px",
    alignSelf: "flex-start",
    lineHeight: "1.4",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
  },
  spinner: {
    marginRight: "8px",
    animation: "spin 1s linear infinite",
  },
  image: {
    maxWidth: "140px",
    marginBottom: "6px",
    borderRadius: "10px",
  },
  inputContainer: {
    display: "flex",
    padding: "12px",
    borderTop: "1px solid #ddd",
    backgroundColor: "#ffffff",
    alignItems: "center",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
  },
  iconButton: {
    backgroundColor: "#f0f0f0",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
  },
  sendButton: {
    backgroundColor: "#007bff",
    color: "#ffffff",
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
  },
  errorText: {
    color: "red",
    fontSize: "13px",
    padding: "4px 12px",
    margin: "0",
  },
  watermark: {
    position: "absolute",
    bottom: "8px",
    right: "12px",
    fontSize: "12px",
    color: "#999",
  },
  lockedMessage: {
    color: "#888",
    fontStyle: "italic",
    marginTop: "20px",
    fontSize: "14px",
  },
  contactInfo: {
    marginTop: "24px",
    fontSize: "13px",
    color: "#666",
    textAlign: "center",
    maxWidth: "360px",
    lineHeight: "1.5",
  },
};
