import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

function getClient() {
  if (!API_KEY) {
    throw new Error('Gemini API key belum diatur. Tambahkan VITE_GEMINI_API_KEY di file .env kamu.');
  }
  return new GoogleGenerativeAI(API_KEY);
}

// Menggunakan nama model terbaru sesuai instruksi error
const MODEL_NAME = 'gemini-3.6-flash';

export async function analyzeFoodImage(base64ImageData, mimeType = 'image/jpeg') {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType,
    },
  };

  const prompt = `You are a nutrition expert. Analyze the food in this image and respond with a JSON object with this exact structure:
{
  "dishName": "Name of the main dish",
  "description": "Brief description of the food (1-2 sentences)",
  "sideDishes": ["side dish 1", "side dish 2"],
  "estimatedCalories": 350,
  "nutrients": {
    "protein": "20g",
    "carbohydrates": "45g",
    "fat": "12g",
    "fiber": "5g",
    "sugar": "8g"
  },
  "healthNotes": "Brief health note or serving suggestion"
}`;

  const result = await model.generateContent([prompt, imagePart]);
  return JSON.parse(result.response.text());
}

export async function generateMealSuggestions(userProfile, mealType = 'all') {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const { name, age, gender, weight, height } = userProfile || {};
  const bmi = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : 'unknown';

  const prompt = `You are a nutrition expert. Based on the user profile below, suggest ${mealType === 'all' ? 'breakfast, lunch, and dinner' : mealType} meal recommendations.

User profile:
- Name: ${name || 'User'}
- Age: ${age || 25} years
- Gender: ${gender || 'unspecified'}
- Weight: ${weight || 60} kg
- Height: ${height || 170} cm
- BMI: ${bmi}

Respond with a JSON object with this exact structure:
{
  "breakfast": {
    "name": "Meal name",
    "description": "Brief description",
    "calories": 400,
    "nutrients": { "protein": "15g", "carbs": "55g", "fat": "10g" }
  },
  "lunch": {
    "name": "Meal name",
    "description": "Brief description",
    "calories": 600,
    "nutrients": { "protein": "25g", "carbs": "70g", "fat": "15g" }
  },
  "dinner": {
    "name": "Meal name",
    "description": "Brief description",
    "calories": 500,
    "nutrients": { "protein": "30g", "carbs": "50g", "fat": "12g" }
  }
}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function chatWithNutriBot(messages, userProfile) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const { age, gender, weight, height } = userProfile || {};
  const bmi = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : 'unknown';

  const systemContext = `You are NutriBot, a friendly nutrition assistant inside the NutriToday app. 
The user's profile: age ${age || 'N/A'}, gender ${gender || 'N/A'}, weight ${weight || 'N/A'}kg, height ${height || 'N/A'}cm, BMI ${bmi}.
Give concise, practical food and nutrition advice. Keep responses under 150 words.
When suggesting recipes, format them clearly with ingredients and brief steps.`;

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content || m.text }],
  }));

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemContext }] },
      { role: 'model', parts: [{ text: 'Understood! I am NutriBot, ready to help with nutrition advice.' }] },
      ...history,
    ],
  });

  const lastMessage = messages[messages.length - 1];
  const lastContent = lastMessage.content || lastMessage.text;
  
  const result = await chat.sendMessage(lastContent);
  return result.response.text();
}

export async function generateFoodByCategory(category, userProfile) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const { age, gender, weight, height } = userProfile || {};
  const bmi = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : 'unknown';

  const prompt = `You are a nutrition expert. Suggest 4 ${category} options for a person aged ${age || 25}, gender ${gender || 'unspecified'}, weight ${weight || 60}kg, height ${height || 170}cm, BMI ${bmi}.

Respond with a JSON array:
[
  {
    "name": "Food name",
    "description": "Brief description",
    "calories": 300,
    "prepTime": "15 min",
    "nutrients": { "protein": "10g", "carbs": "40g", "fat": "8g" }
  }
]`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}