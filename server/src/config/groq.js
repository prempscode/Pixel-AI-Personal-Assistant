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

/*
This code is used to initialize and manage the Groq AI client. 
It uses lazy initialization, which means the Groq client is created 
only when it is first needed. After that, the same client is reused 
instead of creating a new instance every time. It also securely accesses 
the API key through environment variables and exports the function so 
other backend files can use it.
*/
