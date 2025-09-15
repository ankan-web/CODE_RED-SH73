// This service module handles the actual API calls to the Google Gemini API.

// --- Shared Configuration ---
// IMPORTANT: The API key is provided by the environment. Leave this as an empty string.
const apiKey = "";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
const systemPrompt =
  "You are MindEase, a friendly and supportive mental wellness assistant for students. " +
  "Your tone is calm, encouraging, and empathetic. Do not provide medical advice, but offer " +
  "helpful, supportive guidance. Keep your responses concise (2-3 sentences) and easy to read.";

// List of keywords that trigger a specific supportive response.
const supportiveKeywords = [
  "depressed",
  "anxious",
  "sad",
  "stressed",
  "lonely",
  "feeling down",
  "overwhelmed",
  "hopeless",
  "suicidal",
  "worthless",
  "helpless",
  "suicide",
  "self-harm",
  "cutting",
  "panic attack",
  "nervous",
  "scared",
];

/**
 * Processes the user's message and returns an appropriate AI response.
 * @param {string} message - The user's message.
 * @returns {Promise<{message: string, showBookingButton: boolean}>} The chatbot's response object.
 */
export async function getAiChatResponse(message) {
  const lowerCaseMessage = message.toLowerCase();

  // Check if the user's message contains any of the keywords.
  const keywordDetected = supportiveKeywords.some((keyword) =>
    lowerCaseMessage.includes(keyword)
  );

  if (keywordDetected) {
    // If a keyword is detected, provide a supportive message and the option to book a session.
    return {
      message:
        "It sounds like you're going through a tough time. Please know that help is available, and you don't have to navigate this alone. If you feel you might benefit from talking to someone, please consider booking a session.",
      showBookingButton: true,
    };
  }

  // For any other message, proceed with the generative AI call.
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

    return {
      message:
        text || "I'm not sure how to respond to that, but I'm here to listen.",
      showBookingButton: false,
    };
  } catch (error) {
    console.error("Error calling AI Service:", error);
    return {
      message:
        "I'm having a little trouble connecting right now. Please try again in a moment.",
      showBookingButton: false,
    };
  }
}

/**
 * Generates supportive advice based on a detected emotion.
 * @param {string} emotion - The detected emotion (e.g., 'happy', 'sad').
 * @returns {Promise<string>} A short, supportive message.
 */
export async function getEmotionBasedAdvice(emotion) {
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

/**
 * Summarizes a given resource text or list of links.
 * @param {string} title
 * @param {Array<{title:string,url:string,type:string}>} links
 * @returns {Promise<string>} summary text
 */
export async function summarizeResource(title, links) {
  const list = (links || [])
    .map((l) => `- ${l.type}: ${l.title} (${l.url})`)
    .join("\n");
  const prompt = `Summarize the following mental health resource for students in 3-4 bullet points. Keep it supportive, neutral, and practical.\n\nTitle: ${title}\nLinks:\n${list}`;

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: prompt }] }],
  };
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      throw new Error(`API request failed with status ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "Summary unavailable.";
  } catch (e) {
    console.error("Error summarizing resource:", e);
    return "Unable to summarize right now.";
  }
}
