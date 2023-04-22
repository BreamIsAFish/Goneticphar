const admin = require("firebase-admin");
const serviceAccount = require("serviceAccountKey.json");


admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

exports.handler = async (event, context, callback) => {

	const room = admin.firestore().collection("room");
	await room.where("room_num", '==', event.room_num).get().then((querySnapshot) => {
		const doc = querySnapshot.docs[0];
		doc.ref.delete();
		callback(null, {
			statusCode: 200,
			message: "Room deleted successfully",
		});
	})

};