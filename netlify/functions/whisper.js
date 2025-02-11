const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY_3;

const generator = new GoogleGenerativeAI(apiKey);
const model = generator.getGenerativeModel({
	model: "gemini-1.5-pro",
	systemInstruction: {
		parts: [
			{ text: "Response a text with important details or informations for text processing model." }
		]
	}
});

exports.handler = async (event, context) => {
	if (event.httpMethod === "OPTIONS") {
		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "https://polywcube.github.io",
				"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type"
			}
		};
	}
	try {
		const requestBody = JSON.parse(event.body);
		const audioDataUrl = requestBody.audio;
		const inputprompt = requestBody.prompt;

		if (!audioDataUrl) {
			return { statusCode: 400, body: JSON.stringify({ error: "No audio data provided" }) };
		}

		const audioBytes = Buffer.from(audioDataUrl.split(',')[1], 'base64');

		const result = await model.generateContent([
			inputprompt,
			{
				inlineData: {
					data: audioBytes.toString("base64"),
					mimeType: "audio/mp3"
				}
			}
		]);

		const description = result.response.text();

		return {
			statusCode: 200,
			body: JSON.stringify({ description }),
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "https://polywcube.github.io",
				"Access-Control-Allow-Headers": "Content-Type"
			}
		};
	} catch (error) {
		console.error("Error in Gemini function:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message }),
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "https://polywcube.github.io",
				"Access-Control-Allow-Headers": "Content-Type"
			}
		};
	}
};