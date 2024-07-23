const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
require('dotenv').config();

// Access your API key from the environment variable
const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function generateText(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      prompt: { text: prompt }
    });

    const response = result.response;
    const text = response.parts[0].text;
    return text;
  } catch (error) {
    console.error('Error generating text:', error);
    return 'Lo siento, hubo un problema al procesar tu solicitud.';
  }
}

async function generateMultimodal(prompt, images) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageParts = images.map(image => ({
      inlineData: {
        data: Buffer.from(image.data).toString("base64"),
        mimeType: image.mimeType
      },
    }));

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;
    const text = response.parts[0].text;
    return text;
  } catch (error) {
    console.error('Error generating multimodal content:', error);
    return 'Lo siento, hubo un problema al procesar tu solicitud.';
  }
}

async function run() {
  const textPrompt = "Write a story about a magic backpack.";
  const textResult = await generateText(textPrompt);
  console.log('Text result:', textResult);

  const multimodalPrompt = "What's different between these pictures?";
  const images = [
    { data: fs.readFileSync("image1.png"), mimeType: "image/png" },
    { data: fs.readFileSync("image2.jpeg"), mimeType: "image/jpeg" }
  ];
  const multimodalResult = await generateMultimodal(multimodalPrompt, images);
  console.log('Multimodal result:', multimodalResult);
}

run();
