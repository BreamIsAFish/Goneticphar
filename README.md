# Goneticphar

## Table of contents

- [Set up & Deploy](#set-up-&-deploy)
  - [Frontend](#frontend)
  - [Backend](#backend)
    - [Set up Lambda](#set-up-lambda)
    - [Set up Cognito](#set-up-cognito)
    - [Set up API Gateway](#set-up-api-gateway)
    - [Set up Google Cloud Service](#set-up-google-cloud-service)
- [How to run](#how-to-run)

---

## Set up & deploy

### Frontend

Frontend is deployed using AWS Amplify using the following steps:

1. Go to AWS Amplify Console
2. Click `New app` -> `Host web app`
3. Select `GitHub`
4. Select repository and branch to deploy, then click `Next`
5. Set app name
6. In Advanced setting, add environment `REACT_APP_API_BASE_URL` with value `${YOUR_API_GATEWAY_URL}`
7. Click `Save and deploy`

   ***

### Backend

#### Set up Lambda

1. ไปที่ service Lambda > Create function จากนั้นตั้งแต่ function และเลือกภาษา ในที่นี้ใช้ Node.js 18.x แล้วกด Create function
2. Upload code ของแต่ละ function โดยไปที่ Upload from > .zip file > เลือกไฟล์ที่ต้องการ > Upload > Save
   ( แต่ละ sub-folder ใน folder backend คือ 1 Lambda function )
   ( **_ตารางด้านล่าง_** จะบอกสิ่งที่ต้องทำ ก่อนที่จะ zip file เพื่อนำไป upload ใน Lambda )

| File Location (in GitHub)                                                                                            | What you need to do before zip                                                                                        |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| /backend/auth/                                                                                                       | 1. In index.js, fill `UserPoolId`, `ClientId` <br /> 2. Run `npm i` <br /> 3. Zip all files & Upload                  |
| /backend/message/                                                                                                    | 1. Run `npm i` <br /> 2. Fill `naturalLanguageKey.json` and `serviceAccountKey.json` <br /> 3. Zip all files & Upload |
| /backend/room/closeRoom <br /> /backend/room/createRoom <br /> /backend/room/joinRoom <br /> /backend/room/leaveRoom | 1. Run `npm i` <br /> 2. Fill `serviceAccountKey.json` <br /> 3. Zip all files & Upload                               |
| /backend/submit_question                                                                                             | 1. Run `npm i` <br /> 2. Fill `googleVisionKey.json` and `serviceAccountKey.json` <br /> 3. Zip all files & Upload    |

3. หาก function นั้น เกิด Timeout ให้ไปที่ Configuration tab > Edit > เปลี่ยน Timeout เป็น 1 min > Save

<br/>

#### Set up Cognito

1. ไปที่ service Cognito > Create user pool > Cognito user pool sign-in options เลือก User name > Next
2. ตั้งค่า Password policy ตามที่ต้องการ > เลือก No MFA > Disable User account recovery > Next
3. Disable Cognito-assisted verification and confirmation > Required attributes เลือก email > Next
4. เลือก Send email with Cognito > Next
5. ตั้งชื่อ User pool > ในหัวข้อ Initial app client เลือก Confidential client และตั้งชื่อ App client > Next > Create user pool
6. เลือก User pool ที่สร้าง > User pool properties tab > Add Lambda trigger > Pre sign-up trigger > สร้าง Lambda function สำหรับ Auto verified email ดังภาพ

<br/>

#### Set up API Gateway

1. ไปที่ service API Gateway > Create API > Build REST API > ตั้งชื่อ API > Create API
2. ไปที่ API ที่สร้างขึ้น > Actions > Create Resource สำหรับแต่ละ Lambda function > Create Resource
3. เลือก Resource และ Create Method ที่ต้องการ > ใส่ชื่อ Lambda function ที่ต้องการ
4. เลือก Resource > Actions > Enable CORS > ตั้งค่าดังภาพ และใส่ 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,token' ลงใน Access-Control-Allow-Headers > Enable Cors
5. สร้าง Authorizer > เลือก Cognito type > เลือก User pool > ตั้งชื่อ Token Source สำหรับเก็บ Token ใน API Header (ในที่นี้ชื่อ ‘token’)
6. สำหรับ API ที่ต้องการใช้ token ให้เพิ่ม Authorizer ที่สร้างขึ้น ใน Method Request

**_For API Gateway connected to Lambda Function `startRoom`_**
You have to make this API Gateway to become `Asynchronous Invocation` by following these steps:

1. Choose resource and then click method that connected to Lambda Function `startRoom`
2. Go to `Method Request` > In `HTTP Request Headers`, add `InvocationType` then check `required` and go back to previous page
3. Go to `Integration Request` > In `HTTP Headers`, add `X-Amz-Invocation-Type` with the value of `method.request.header.InvocationType`
   **_(Don't forget to deploy your changes)_**

<br/>

#### Set up Google Cloud Service

- **Cloud Firestore API**
  1.  ไปที่ Firebase console และ Add project
  2.  เลือก Project ที่สร้าง > Project settings > Service accounts > Create service account > **Generate new private key**
  3.  ไปที่ Firestore Database > Create database > Next > เลือก asia-southeast1 (Singapore)
  4.  Start collection > ตั้งชื่อ collection ที่ต้องใช้ (ในที่นี้มี messages, room)
- **Google Natural Language API**
  1.  ไปที่ Google Cloud Console > เลือก Project
  2.  ไปที่ APIs & Services > ENABLE APIS AND SERVICES > ค้นหา Cloud Natural Language API > ENABLE
- **Google Vision API**
  1.  ไปที่ Google Cloud Console > เลือก Project
  2.  ไปที่ APIs & Services > ENABLE APIS AND SERVICES > ค้นหา Cloud Vision API > ENABLE

---

## How to run

### Local (Development)

1. `cd frontend`
2. `npm run start`

### Production

1. Go to the url that you get from AWS Amplify e.g.
   https://deploy-front.d1q2ccz8tdkfaw.amplifyapp.com/
