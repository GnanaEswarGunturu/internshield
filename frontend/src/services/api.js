export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const HISTORY_KEY = "internshield_analysis_history";

const CONNECTION_ERROR =
  "Unable to connect to the analysis server. Please make sure the FastAPI backend is running on port 8000.";

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const analyzeJob = async (jobData) => {
  let response;
  try {
    response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: jobData.title ?? "",
        description: jobData.description ?? "",
        company: jobData.company ?? "",
        website: jobData.website ?? "",
        email: jobData.email ?? "",
        salary: jobData.salary ?? "",
        url: jobData.url ?? "",
      }),
    });
  } catch {
    throw new Error(CONNECTION_ERROR);
  }

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const detail = payload?.detail;
    throw new Error(
      typeof detail === "string"
        ? detail
        : "Analysis failed. The server returned an error."
    );
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Analysis failed. The server returned an empty response.");
  }

  return payload;
};

export const getMetrics = async () => {
  let response;
  try {
    response = await fetch(`${API_URL}/metrics`);
  } catch {
    throw new Error(CONNECTION_ERROR);
  }

  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    throw new Error("Metrics unavailable — run the training pipeline.");
  }
  return payload ?? { error: "Metrics unavailable — run the training pipeline." };
};

export const getHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) return { status: "error" };
    return (await parseJsonSafely(response)) ?? { status: "error" };
  } catch {
    return { status: "offline" };
  }
};

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function appendHistory(record) {
  try {
    const history = loadHistory();
    const next = [record, ...history].slice(0, 25);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}
