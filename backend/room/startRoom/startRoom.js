// import AWS from '/var/runtime/node_modules/aws-sdk/lib/aws.js';
const admin = require("firebase-admin");
const serviceAccount = require("serviceAccountKey.json");
const { Worker } = require("worker_threads");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

exports.handler = async (event, context, callback) => {
    const vocabulary = ["Crab", "Hat", "Bird", "Sheep", "Car",
						"Elephant", "Glasses", "Pants", "Turtle", "Table"]
    const room = admin.firestore().collection("room");
    const question_list = generateRandomQuestionList(vocabulary);
    await room.where("room_num", '==', event.room_num).get().then((querySnapshot) => {
      const doc = querySnapshot.docs[0];
      // question_list = doc.data().question_list;
      doc.ref.update({
        "room_status": "playing",
        "question_list": question_list
      });
	  })

    startQuestion(event.room_num, question_list, 1);

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(120000); /// waiting 120 seconds.
    console.log('continue main thread');

    // TODO: Call Get Summary

    callback(null, {
        statusCode: 200,
        message: "Game ending",
    });
};

async function startQuestion(room_num, question_list, question_no) {
  // Create a new worker thread
  console.log(`start worker ${question_no}`);

  // TODO: Push Question into firebase
  const room = admin.firestore().collection("room");
  await room.where("room_num", '==', room_num).get().then((querySnapshot) => {
    const doc = querySnapshot.docs[0];
    doc.ref.update({
      "current_question": question_list[question_no-1]
    });
  })

  const workerData = { room_num: room_num, question_list: question_list, question_no: question_no };
  const worker = new Worker('./worker.js', { workerData });

  worker.on('message', (message) => {
    console.log(`Received message from worker: ${message}`);
  });

  worker.on('error', (error) => {
    console.error(`Error in worker: ${error}`);
  });

  worker.on('exit', (code) => {
    console.log(`Worker stopped with exit code ${code}`);
  });
}

exports.nextQuestion = async (room_num, question_list, question_no) => {
  console.log(`nextQuestion called...${question_no}`);

  // TODO: Remove call createMessage
  //   const lambda = new AWS.Lambda();
  //   // Set up the input parameters for the other Lambda function
  //   const params = {
  //     FunctionName: 'arn:aws:lambda:ap-southeast-1:723746594407:function:createMessage',
  //     InvocationType: 'RequestResponse',

  //     Payload: JSON.stringify({sender: 'Buay', room_id: 2, message: `${questionList[question_no-1]}`})
  //   };
  //   // Invoke the other Lambda function
  //   const response = await lambda.invoke(params).promise();
  //   // Handle the response from the other Lambda function
  //   console.log(response);

  if(question_no == question_list.length) {
    // TODO: Change room status to "ending"
    const room = admin.firestore().collection("room");
    await room.where("room_num", '==', room_num).get().then((querySnapshot) => {
      const doc = querySnapshot.docs[0];
      doc.ref.update({
        "room_status": "ending"
      });
    })
  } else {
    startQuestion(room_num, question_list, question_no+1);
  }

};

function generateRandomQuestionList(vocabulary) {
	const randomItems = [];
	while (randomItems.length < 5) {
		const index = Math.floor(Math.random() * vocabulary.length);
		randomItems.push(vocabulary.splice(index, 1)[0]);
	}
	return randomItems;
}