const admin = require("firebase-admin");
const serviceAccount = require("serviceAccountKey.json");


admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

exports.handler = async (event, context, callback) => {

	var max_player;
	var current_player_num;
	var id;
	const room = admin.firestore().collection("room");
	await room.where("room_num", '==', event.room_num).get().then((querySnapshot) => {
		if (querySnapshot.empty) {
			callback(null, {
				statusCode: 400,
				message: "Room_num doesn't exist",
			});
		} else {
			const doc = querySnapshot.docs[0];
			console.log(doc.data());
			id = doc.data().id;
			max_player = doc.data().max_player;
			current_player_num = doc.data().players.length;
		}
	})

	if (current_player_num < max_player) {
		await room.doc(id).update({
			"players": admin.firestore.FieldValue.arrayUnion(event.player_id)
		}).then(() => {
			callback(null, {
				statusCode: 200,
				message: "Player added to the room",
			});
		});
	} else {
		callback(null, {
			statusCode: 400,
			message: "This room is full",
		});
	}
};