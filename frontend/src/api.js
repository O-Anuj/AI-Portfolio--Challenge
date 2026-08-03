const API_BASE = import.meta.env.VITE_API_URL || "";

export async function streamChat(message, history, jobDescription, onToken) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
      job_description: jobDescription || null,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Chat request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;
    onToken(fullText);
  }

  return fullText;
}

export async function fetchProfile() {
  const response = await fetch(`${API_BASE}/api/profile`);
  if (!response.ok) throw new Error("Failed to load profile");
  return response.json();
}

export async function analyzeJobMatch(jobDescription) {
  const response = await fetch(`${API_BASE}/api/job-match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_description: jobDescription }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Job match failed");
  }

  return response.json();
}



