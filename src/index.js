export default {
  async fetch(request) {
    const url = new URL(request.url);

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === "/") {
      return new Response(
        "Roblox Username Checker backend is running.",
        { headers: { ...headers, "Content-Type": "text/plain" } }
      );
    }

    if (url.pathname !== "/api/check") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers
      });
    }

    const username = url.searchParams.get("username") || "";

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return new Response(JSON.stringify({
        error: "Username must be 3–20 characters using letters, numbers, or underscores."
      }), { status: 400, headers });
    }

    try {
      const response = await fetch(
        "https://auth.roblox.com/v1/usernames/validate?username=" +
        encodeURIComponent(username) +
        "&birthday=2000-01-01&context=Signup",
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        return new Response(JSON.stringify({
          error: "Roblox returned HTTP " + response.status
        }), { status: 502, headers });
      }

      const data = await response.json();

      return new Response(JSON.stringify({
        username,
        code: data.code,
        message: data.message || "",
        available: data.code === 0
      }), { headers });
    } catch {
      return new Response(JSON.stringify({
        error: "Could not reach Roblox. Try again later."
      }), { status: 502, headers });
    }
  }
};
