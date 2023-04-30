const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

const poolData = {
	UserPoolId: "", //Cognito user pool id
	ClientId: "", //Cognito app client id
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

AWS.config.update({
	region: "ap-southeast-1",
});

async function registerUser(data) {
	const { username, password, email } = data;

	return new Promise((resolve, reject) => {
		let attributeList = [];

		attributeList.push(
			new AmazonCognitoIdentity.CognitoUserAttribute({
				Name: "email",
				Value: email,
			})
		);

		userPool.signUp(
			username,
			password,
			attributeList,
			null,
			async function (err, result) {
				if (err) {
					resolve({
						statusCode: 500,
						err,
					});
				}
				resolve({
					statusCode: 200,
					message: "User successfully registered",
				});
			}
		);
	});
}

async function loginUser(data) {
	const { username, password } = data;
	return new Promise((resolve, reject) => {
		const authenticationDetails =
			new AmazonCognitoIdentity.AuthenticationDetails({
				Username: username,
				Password: password,
			});

		const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
			Username: username,
			Pool: userPool,
		});

		cognitoUser.authenticateUser(authenticationDetails, {
			onSuccess: function (result) {
				const idToken = result.getIdToken().getJwtToken();
				const { sub } = jwt.decode(idToken);
				resolve({
					statusCode: 200,
					id: sub,
					idToken,
					message: "User successfully logged in",
				});
			},
			onFailure: function (err) {
				resolve({
					statusCode: 401,
					err,
				});
			},
		});
	});
}

exports.handler = async function (event, context, callback) {
	const data = JSON.parse(event.body);
	let result;
	if (event.path == "/user/signup") {
		result = await registerUser(data);
	} else if (event.path == "/user/signin") {
		result = await loginUser(data);
	}
	callback(null, {
		statusCode: result.statusCode,
		headers: {
			"Access-Control-Allow-Headers": "*",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "OPTIONS,POST",
		},
		body: JSON.stringify(result),
	});
};
