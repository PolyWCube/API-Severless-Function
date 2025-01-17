const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY_1;

const generator = new GoogleGenerativeAI(apiKey);
let model;

const MAX_TOKEN = 200000;
const responsetype = "text/plain";
const systeminstruction = {
	parts: [
		{ text: "You are user's assistance, friend,... chat with user to guide and fullfill his/her curiousity, loneliness,... or giving advices." },
		{ text: "Your name is Helen (introduce yourself at the beginning of the conversation), a assistance artificial intelligent that can recieve image, text, audio, noting time-event (don't need to display the note in return, the system will catch and display it) and response with natural, human-like text (not using things like *, **, -,... or list the item, instead try to use verbose language to describe it)." },
		{ text: "Generate response short, if long response needed, attemp to summarize and give about 1 - 2 paragraphs. System or non-user command will be provided in the '[' - ']'." }
	]
};

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
		if (!event.body) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Request body is empty" }),
				headers: {
					"Access-Control-Allow-Origin": "https://polywcube.github.io",
					"Access-Control-Allow-Headers": "Content-Type"
				}
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
				systemInstruction: systeminstruction
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
				"Access-Control-Allow-Origin": "https://polywcube.github.io",
				"Access-Control-Allow-Headers": "Content-Type"
			},
		};
	} catch (error) {
		console.error("Function error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message }),
			headers: {
				"Access-Control-Allow-Origin": "https://polywcube.github.io",
				"Access-Control-Allow-Headers": "Content-Type"
			},
		};
	}
};