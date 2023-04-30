const admin = require("firebase-admin");
const serviceAccount = require("serviceAccountKey.json");
const naturalLanguageKey = require("naturalLanguageKey.json");
const language = require("@google-cloud/language");
const client = new language.LanguageServiceClient({
	credentials: naturalLanguageKey,
});

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const sentiment = async (text) => {
	const document = {
		content: text,
		type: "PLAIN_TEXT",
	};
	const [result] = await client.analyzeSentiment({ document: document });
	const sentiment = result.documentSentiment;
	return sentiment.score;
};

exports.handler = async (event, context, callback) => {
	const score = await sentiment(event.message);
	if (score >= 0) {
		const date = Date.now();
		event.created_at = date;
		await admin
			.firestore()
			.collection("messages")
			.add(event)
			.then(() => {
				callback(null, {
					statusCode: 200,
					body: {
						message: "Data added to firestore",
						score: score,
					},
				});
			});
	} else {
		callback(null, {
			statusCode: 200,
			body: {
				message: "Toxic message",
				score: score,
			},
		});
	}
};
