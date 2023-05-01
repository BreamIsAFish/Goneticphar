const admin = require("firebase-admin");
const serviceAccount = require("serviceAccountKey.json");
const googleVisionKey = require("googleVisionKey.json");
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient({
	credentials: googleVisionKey,
});

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const checkScore = async (imageData) => {
	const [result] = await client.annotateImage({
		// image: { source: { filename: imagePath}},
		image: { content: imageData },
		features: [{ type: 'OBJECT_LOCALIZATION', maxResults: 10 }]
	});
	const objects = result.localizedObjectAnnotations;
	return objects
}

exports.handler = async (event, context, callback) => {

	const room = admin.firestore().collection("room");

	const decodedImageData = Buffer.from(event.imageData, 'base64');
	const result = await checkScore(decodedImageData);

	var score, array, index;
	await room.where("room_num", '==', event.room_num).get().then((querySnapshot) => {
		const doc = querySnapshot.docs[0];
		id = doc.data().id;
		array = doc.data().players_score[event.player_id] || [];
        index = doc.data().question_list.indexOf(event.current_question);
	})
	result.forEach(obj => {
		if (obj.name == event.current_question) {
			score = (obj.score * 100).toFixed(2);
		}
	})
	if ( score == null) score = 0;
	if (index < array.length) {
		callback(null, {
			statusCode: 400,
			message: "This question has already been submitted",
		});
	} else {
		array.push(score);
		await room.doc(id).update({
			["players_score." + event.player_id] : array
		}).then(() => {
			callback(null, {
				statusCode: 200,
				message: "submission successfully",
				score: score
			});
		});
	}

};