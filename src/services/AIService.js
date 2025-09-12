// This service module handles the actual API calls to the Google Gemini API.

/**
 * Sends a message to the Gemini API and gets a response.
 * @param {string} message - The user's message.
 * @returns {Promise<string>} The chatbot's response text.
 */
export async function getAiChatResponse(message) {
  // IMPORTANT: Leave apiKey as an empty string. The environment will provide it.
  const apiKey = "AIzaSyAcxEbgjczDyOfagdOGAAAsUp2HE_fvr6A";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  // A simple system prompt to guide the AI's personality
  const systemPrompt =
    "You are MindEase, a friendly and supportive mental wellness assistant for students. Your tone is calm, encouraging, and empathetic. Do not provide medical advice, but offer helpful, supportive guidance and resources. Keep your responses concise and easy to read.";

  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        parts: [{ text: message }],
      },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("API Error Response:", errorBody);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response text found from API.");
    }

    return text;
  } catch (error) {
    console.error("Error calling AI Service:", error);
    return "I'm sorry, but I'm having a little trouble connecting right now. Please try again in a moment.";
  }
}
