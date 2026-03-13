import { getStore } from "@netlify/blobs";

const STORE_NAME = "leaderboard";
const KEY = "scores";
const MAX_SCORES = 20;

export default async (req, context) => {
  const store = getStore(STORE_NAME);

  // ── GET: return current scores ──
  if (req.method === "GET") {
    try {
      const raw = await store.get(KEY);
      const scores = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify(scores), {
        headers: { "Content-Type": "application/json", ...cors() },
      });
    } catch {
      return new Response("[]", {
        headers: { "Content-Type": "application/json", ...cors() },
      });
    }
  }

  // ── POST: add a new score ──
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { name, score, pct, date } = body;

      if (!name || score === undefined || pct === undefined) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...cors() },
        });
      }

      const raw = await store.get(KEY);
      const scores = raw ? JSON.parse(raw) : [];

      scores.push({ name: String(name).slice(0, 40), score, pct, date });
      scores.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
      const trimmed = scores.slice(0, MAX_SCORES);

      await store.set(KEY, JSON.stringify(trimmed));

      return new Response(JSON.stringify(trimmed), {
        headers: { "Content-Type": "application/json", ...cors() },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...cors() },
      });
    }
  }

  // ── DELETE: clear all scores ──
  if (req.method === "DELETE") {
    try {
      await store.set(KEY, "[]");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json", ...cors() },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...cors() },
      });
    }
  }

  // ── OPTIONS: CORS preflight ──
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
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
