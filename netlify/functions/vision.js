const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY_2;
console.log(apiKey);
const generator = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2);
const model = generator.getGenerativeModel({ model: "gemini-pro-vision" });

exports.handler = async (event, context) => {
	if (event.httpMethod === "OPTIONS") {
		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "https://polywcube.github.io",
				"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		};
	}
	try {
		const requestBody = JSON.parse(event.body);
		const imageDataUrl = requestBody.image;

		if (!imageDataUrl) {
			return { statusCode: 400, body: JSON.stringify({ error: "No image data provided" }) };
		}

		const imageBytes = Buffer.from(imageDataUrl.split(',')[1], 'base64');

		const result = await model.generateContent([
			"[Describe following image in detail for image understanding response]",
			{
				inlineData: {
					data: imageBytes.toString("base64"),
					mimeType: "image/jpeg",
				},
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
			},
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
			},
		};
	}
};