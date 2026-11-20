let groq;

// Lazy init: the client is created on first use and reused afterwards.
async function getGroqAI() {
  if (!groq) {
    const { default: Groq } = await import("groq-sdk");

    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groq;
}

module.exports = getGroqAI;
