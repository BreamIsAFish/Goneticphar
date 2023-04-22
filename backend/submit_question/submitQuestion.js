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

const obj = async (imagePath) => {
	const [result] = await client.annotateImage({
		image: { source: { filename: imagePath}},
		features: [{ type: 'OBJECT_LOCALIZATION', maxResults: 10 }]
	});
	const objects = result.localizedObjectAnnotations;
	return objects
}

exports.handler = async (event, context, callback) => {

	const room = admin.firestore().collection("room");
	const result = await obj("Crab-body-7f9ae78.jpg"); // example image

	var current_question;
	var score;
	var array;
	await room.where("room_num", '==', event.room_num).get().then((querySnapshot) => {
		const doc = querySnapshot.docs[0];
		id = doc.data().id;
		current_question = doc.data().current_question;
		array = doc.data().players_score[event.player_id] || [];
	})
	result.forEach(obj => {
		if (obj.name == current_question) {
			score = (obj.score * 100).toFixed(2);
		}
	})
	if ( score == null) score = 0;
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

};