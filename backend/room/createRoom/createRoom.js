const admin = require("firebase-admin");
const serviceAccount = require("serviceAccountKey.json");


admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

exports.handler = async (event, context, callback) => {

	// const vocabulary = ["Crab", "Fish", "Cat", "Shirt", "Shoe",
	// 					"Book", "Hand", "House", "Money", "Clock",
	// 					"Car", "Vase", "Gun", "Cap", "Cow",
	// 					"Kite", "Road", "Snake", "Snail", "Mountain"]
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
	event.players = [event.host];
	event.players_score = {};
   	event.current_question = "";
	event.question_list = [];
	event.current_time = date;
	event.room_status = "waiting";
	const res = admin.firestore().collection("room");
	const newID = res.doc().id;
	event.id = newID;

	let isUnique = false;
	let result = '';
	while (!isUnique) {
		// gen random string
		result = generateRandomString();
		console.log(result);
		// query check result exists?
		const room = await res.where("room_num", '==', result).get();
		if (room.empty) {
			isUnique = true;
			event.room_num = result;
			await res
				.doc(newID)
				.set(event)
				.then(() => {
					callback(null, {
						statusCode: 200,
						message: "Create room successfully",
						room_num: result
					});
				});
		}
	}
};

function generateRandomString() {
	let result = '';
	const characters = '0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < 4; i++) {
	  result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}