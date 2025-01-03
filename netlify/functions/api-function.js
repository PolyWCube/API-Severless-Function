const { GoogleGenerativeAI } = require("@google/generative-ai");

let generator;
let model;

const MAX_TOKEN = 200000;
const responsetype = "text/plain";

exports.handler = async (event, context) => {
	console.log("Request method:", event.httpMethod);
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
		const apiKey = process.env.GEMINI_API_KEY_1;
		if (!apiKey) {
			throw new Error("Gemini API Key not found in environment variables");
		}
		if (!generator) {
			generator = new GoogleGenerativeAI(apiKey);
		}
		if (!event.body) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Request body is empty" }),
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Headers": "Content-Type"
					},
				};
			}

		const requestBody = JSON.parse(event.body);
		const prompt = requestBody.prompt;
		let chathistory = requestBody.history || [];
		const modelconfig = requestBody.modelconfig;
		const botinstruction = "[Bot instruction: generate response short, natural, human-like] ";
		chathistory.push({ role: "user", parts: [{ text: botinstruction + prompt }] });
		if (!model || modelconfig.modelName != model.model || modelconfig.temperature != model.temperature) {
			model = generator.getGenerativeModel({ model: modelconfig.modelName, generationConfig: {
				temperature: modelconfig.temperature,
				maxOutputTokens: MAX_TOKEN,
				responseMimeType: responsetype
			} });
		}

		const chat = model.startChat({ history: chathistory });
		const genratedContent = await chat.sendMessage();
		const output = genratedContent.response.text();
		chathistory.push({ role: "model", parts: [{ text: output }] });

		return {
			statusCode: 200,
			body: JSON.stringify({ response: output, history: chathistory }),
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "Content-Type"
			},
		};
	} catch (error) {
		console.error("Function error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message }),
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "Content-Type"
			},
		};
	}
};