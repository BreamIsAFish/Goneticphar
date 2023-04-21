const admin = require("firebase-admin");
const serviceAccount = require("serviceAccountKey.json");


admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

exports.handler = async (event, context, callback) => {

	var max_player;
	var current_player_num;
	const room = admin.firestore().collection("room").doc(event.room_num);
	await room.get().then((doc) => {
		max_player = doc.data().max_player;
		current_player_num = doc.data().players.length;
	})
	if (current_player_num < max_player-1) {
		await room.update({
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