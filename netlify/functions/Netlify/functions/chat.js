exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return respond(500, {
      error: "GEMINI_API_KEY Netlify-তে সেট করা নেই।"
    });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const message = String(body.message || "").trim();

    if (!message) {
      return respond(400, { error: "কিছু লিখে পাঠাও।" });
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return respond(response.status, {
        error: data.error?.message || "Gemini API error."
      });
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "কোনো উত্তর পাওয়া যায়নি।";

    return respond(200, { reply: answer });
  } catch (error) {
    return respond(500, { error: "Server error. আবার চেষ্টা করো।" });
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}
