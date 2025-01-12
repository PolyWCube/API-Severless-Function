const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY_4;

const generator = new GoogleGenerativeAI(apiKey);
const model = generator.getGenerativeModel({
	model: "gemini-1.5-flash",
	systemInstruction: {
		parts: [
			{ text: "If only the requested intended to using the note service or taking note a time (calculated if the user don't give the specific time, the current time will be provided in the prompt, also, if something is expired, remove it) and event, not the general chat, response the note with the following format: '\n[Event | YYYY-MM-DDThh:mm]'. For example, '\n[Math Exam | 2024-08-12T09:30]\n[Cooking Lesson | 2024-08-12T12:00]\n[Meeting with John | 2024-08-13T14:00]',..., else return ''." }
		]
	}
});

const MAX_TOKEN = 200000;
const responsetype = "text/plain";

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
		
		const prompt = requestBody.prompt;
		const history = requestBody.history;
		
		const chat = model.startChat({ history });
		const genratedContent = await chat.sendMessage(prompt);
		const note = genratedContent.response.text();

		return {
			statusCode: 200,
			body: JSON.stringify({ note: note }),
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