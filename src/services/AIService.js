// This service module handles the actual API calls to the Google Gemini API.

// --- Shared Configuration ---
// It's good practice to define constants that are used by multiple functions at the top.
const apiKey = "AIzaSyAcxEbgjczDyOfagdOGAAAsUp2HE_fvr6A"; // IMPORTANT: Replace with your actual key.
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
const systemPrompt =
  "You are MindEase, a friendly and supportive mental wellness assistant for students. " +
  "Your tone is calm, encouraging, and empathetic. Do not provide medical advice, but offer " +
  "helpful, supportive guidance. Keep your responses concise (2-3 sentences) and easy to read.";

/**
 * Sends a general chat message to the Gemini API.
 * @param {string} message - The user's message.
 * @returns {Promise<string>} The chatbot's response text.
 */
export async function getAiChatResponse(message) {
  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: message }] }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return (
      text || "I'm not sure how to respond to that, but I'm here to listen."
    );
  } catch (error) {
    console.error("Error calling AI Service:", error);
    return "I'm having a little trouble connecting right now. Please try again in a moment.";
  }
}

/**
 * Generates supportive advice based on a detected emotion.
 * @param {string} emotion - The detected emotion (e.g., 'happy', 'sad').
 * @returns {Promise<string>} A short, supportive message.
 */
export async function getEmotionBasedAdvice(emotion) {
  // We create a specific prompt for this task.
  const advicePrompt =
    `I just did a quick facial emotion check-in and the result was "${emotion}". ` +
    `Based on this feeling, please give me a short, encouraging, and supportive piece of advice. ` +
    `Address me directly as "you".`;

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: advicePrompt }] }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return (
      text || "No matter how you're feeling, remember to be kind to yourself."
    );
  } catch (error) {
    console.error("Error calling AI Service for advice:", error);
    return "I couldn't generate advice right now, but please know that your feelings are valid.";
  }
}
