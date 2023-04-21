const admin = require("firebase-admin");
const serviceAccount = require("serviceAccountKey.json");


admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

exports.handler = async (event, context, callback) => {

	const date = new Date().toLocaleString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		timeZone: "Asia/Bangkok",
		timeZoneName: "short",
	});
	event.players = [];
	event.players_score = {};
   	event.current_question = "";
	event.question_list = ['Crab', 'Shirt'];
	event.current_time = date;
	event.room_status = "waiting";
	// event.host = "player_id";
	const res = admin.firestore().collection("room");
	const newID = res.doc().id;
	event.id = newID;
	// event.room_num = newID;

	const room = await res.where("room_num", '==', event.room_num).get();
	if (room.empty) {
		await res
			.doc(newID)
			.set(event)
			.then(() => {
				callback(null, {
					statusCode: 200,
					message: "Data added to firestore",
				});
			});
	} else {
		callback(null, {
			statusCode: 400,
			message: "Room_num exists",
		});
	}
};