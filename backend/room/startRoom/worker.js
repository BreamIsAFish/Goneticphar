const { workerData, parentPort } = require('worker_threads');
// import AWS from '/var/runtime/node_modules/aws-sdk/lib/aws.js';
const { nextQuestion } = require('./index.js');

const worker = async (room_num, question_list, question_no) => {

    console.log('Before sleep');
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(20000); // each 20 seconds
    console.log('After sleep');

    nextQuestion(room_num, question_list, question_no);
};

const room_num = workerData.room_num;
const question_list = workerData.question_list;
const question_no = workerData.question_no;
worker(room_num, question_list, question_no);