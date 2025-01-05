const vision = require('@google-cloud/vision').v1;
const client = new vision.ImageAnnotatorClient();

exports.handler = async (event, context) => {
	try {
		const requestBody = JSON.parse(event.body);
		const imageDataUrl = requestBody.image;

		if (!imageDataUrl) {
			return { statusCode: 400, body: JSON.stringify({ error: "No image data provided" }) };
		}

		const imageBuffer = Buffer.from(imageDataUrl.split(',')[1], 'base64');

		const [result] = await client.annotateImage({
			image: { content: imageBuffer },
			features: [{ type: 'IMAGE_PROPERTIES' }]
		});

		if (!result.imagePropertiesAnnotation || !result.imagePropertiesAnnotation.dominantColors || !result.imagePropertiesAnnotation.dominantColors.colors) {
			return { statusCode: 500, body: JSON.stringify({ error: "Could not get image properties" }) };
		}

		const colors = result.imagePropertiesAnnotation.dominantColors.colors;
		let description = "The image has dominant colors of: ";
		colors.forEach(colorInfo => {
			const color = colorInfo.color;
			description += `rgb(${color.red}, ${color.green}, ${color.blue}) `;
		});

		const [captionResult] = await client.annotateImage({
			image: { content: imageBuffer },
			features: [{ type: 'WEB_DETECTION' }],
		});

		if (captionResult.webDetection && captionResult.webDetection.bestGuessLabels && captionResult.webDetection.bestGuessLabels.length > 0) {
			description += `and is likely related to: ${captionResult.webDetection.bestGuessLabels[0].label}`;
		}

		return {
			statusCode: 200,
			body: JSON.stringify({ description: description }),
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "https://polywcube.github.io",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		};
	} catch (error) {
		console.error("Function error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message }),
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "https://polywcube.github.io",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		};
	}
};