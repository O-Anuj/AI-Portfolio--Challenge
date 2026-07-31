import { useEffect, useRef, useState } from "react";
import { analyzeJobMatch, fetchProfile, streamChat } from "./api";

const SUGGESTIONS = [
  "Tell me about this candidate.",
  "What are their strongest skills?",
  "Tell me about their projects.",
  "Do they have backend experience?",
];

function MessageBubble({ role, content }) {
  return (
    <div className={`message ${role}`}>
      <div className="message-label">{role === "user" ? "You" : "AI"}</div>
      <div className="message-content">{content}</div>
    </div>
  );
}

function JobMatchPanel({ result }) {
  if (!result) return null;

  return (
    <div className="job-match-result">
      <div className="match-header">
        <span className={`match-badge ${result.is_suitable ? "good" : "weak"}`}>
          {result.match_score}% match
        </span>
        <span className={`interview-badge ${result.should_interview ? "yes" : "no"}`}>
          {result.should_interview ? "Recommend interview" : "Not recommended"}
        </span>
      </div>
      <p className="match-summary">{result.summary}</p>
      <div className="match-columns">
        <div>
          <h4>Matching skills</h4>
          <ul>
            {result.matching_skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Missing skills</h4>
          <ul>
            {result.missing_skills.length ? (
              result.missing_skills.map((s) => <li key={s}>{s}</li>)
            ) : (
              <li className="muted">None identified</li>
            )}
          </ul>
        </div>
        <div>
          <h4>Strengths</h4>
          <ul>
            {result.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJdPanel, setShowJdPanel] = useState(false);
  const [jobMatch, setJobMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(() => setError("Could not load candidate profile."));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    setError("");
    setInput("");

    const userMessage = { role: "user", content: trimmed };
    const historyForApi = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    setLoading(true);

    try {
      await streamChat(trimmed, historyForApi, jobDescription || null, (partial) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: partial };
          return updated;
        });
      });
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleJobMatch = async () => {
    if (!jobDescription.trim() || matching) return;
    setMatching(true);
    setError("");
    try {
      const result = await analyzeJobMatch(jobDescription);
      setJobMatch(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setMatching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">AI Portfolio Challenge</p>
          <h1>{profile?.name ?? "Loading..."}</h1>
          <p className="subtitle">{profile?.headline ?? "Chat with the AI representative"}</p>
        </div>
        <button
          className="jd-toggle"
          onClick={() => setShowJdPanel((v) => !v)}
          type="button"
        >
          {showJdPanel ? "Hide JD panel" : "Job Description Matching"}
        </button>
      </header>

      {showJdPanel && (
        <section className="jd-panel">
          <h2>Job Description Matching</h2>
          <p className="jd-help">
            Paste a job description. The AI will use it during chat and you can run a structured fit analysis.
          </p>
          <textarea
            className="jd-input"
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
          />
          <button
            className="match-btn"
            onClick={handleJobMatch}
            disabled={matching || !jobDescription.trim()}
            type="button"
          >
            {matching ? "Analyzing..." : "Analyze Fit"}
          </button>
          <JobMatchPanel result={jobMatch} />
        </section>
      )}

      <main className="chat-container">
        <div className="chat-window">
          {messages.length === 0 && (
            <div className="empty-state">
              <h2>Ask anything about the candidate</h2>
              <p>Responses use only the provided profile — no hallucinations.</p>
              <div className="suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} type="button">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} role={msg.role} content={msg.content} />
          ))}

          {loading && messages[messages.length - 1]?.content === "" && (
            <div className="typing">Thinking...</div>
          )}

          <div ref={chatEndRef} />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about skills, projects, experience..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            type="button"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
