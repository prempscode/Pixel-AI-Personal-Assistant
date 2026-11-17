let groq;

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
