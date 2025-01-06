const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY_1;

let generator;
let model;

const MAX_TOKEN = 200000;
const responsetype = "text/plain";

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
		if (!model || modelconfig.modelname != model.model || modelconfig.temperature != model.temperature) {
			model = generator.getGenerativeModel({
				model: modelconfig.modelname,
				generationConfig: {
					temperature: modelconfig.temperature,
					maxOutputTokens: MAX_TOKEN,
					responseMimeType: responsetype
				},
				system_instruction = [
					"You are user's assistance, friend,... chat with user to guide and fullfill his/her curiousity, loneliness,...",
					"Your name is ALAN, a chatbot can recieve image, text and output text.",
					"Generate human-like, natural response."
				]
			});
		}

		const chat = model.startChat({ history: chathistory });
		const genratedContent = await chat.sendMessage(prompt);
		const output = genratedContent.response.text();

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