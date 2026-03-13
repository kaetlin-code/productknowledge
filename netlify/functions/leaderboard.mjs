const SCORES_PATH = "scores.json";
const MAX_SCORES = 20;

async function getFile() {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${SCORES_PATH}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  if (res.status === 404) return { scores: [], sha: null };
  const data = await res.json();
  const scores = JSON.parse(atob(data.content.replace(/\n/g, "")));
  return { scores, sha: data.sha };
}

async function saveFile(scores, sha) {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const body = {
    message: "update leaderboard",
    content: btoa(JSON.stringify(scores)),
    ...(sha ? { sha } : {}),
  };
  await fetch(
    `https://api.github.com/repos/${repo}/contents/${SCORES_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}

export default async (req) => {
  const headers = cors();

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method === "GET") {
    try {
      const { scores } = await getFile();
      return new Response(JSON.stringify(scores), {
        headers: { "Content-Type": "application/json", ...headers },
      });
    } catch (e) {
      return new Response("[]", { headers: { "Content-Type": "application/json", ...headers } });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, score, pct, date } = await req.json();
      if (!name || score === undefined || pct === undefined) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400, headers: { "Content-Type": "application/json", ...headers },
        });
      }
      const { scores, sha } = await getFile();
      scores.push({ name: String(name).slice(0, 40), score, pct, date });
      scores.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
      const trimmed = scores.slice(0, MAX_SCORES);
      await saveFile(trimmed, sha);
      return new Response(JSON.stringify(trimmed), {
        headers: { "Content-Type": "application/json", ...headers },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { "Content-Type": "application/json", ...headers },
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { sha } = await getFile();
      await saveFile([], sha);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json", ...headers },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { "Content-Type": "application/json", ...headers },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const config = { path: "/api/leaderboard" };
