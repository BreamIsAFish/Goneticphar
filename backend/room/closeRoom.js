const admin = require("firebase-admin");
const serviceAccount = require("serviceAccountKey.json");


admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

exports.handler = async (event, context, callback) => {

	const room = admin.firestore().collection("room").doc(event.room_num);

	await room.delete()
	.then(() => {
		callback(null, {
			statusCode: 200,
			message: "Room deleted successfully",
		});
	});

};