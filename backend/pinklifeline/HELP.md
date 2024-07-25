# Pinklifeline API Docs

### Database startup
```bash
docker run -d -e MYSQL_ROOT_PASSWORD=sadi -e MYSQL_USER=pinklifeline -e MYSQL_PASSWORD=pinklifeline -e MYSQL_DATABASE=pinklifeline --name mysql-basic -p 3306:3306 mysql:latest
```

### Redis Startup
```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

## Basic User Information Register
``` Endpoint: POST /v1/infos/ROLE_BASICUSER/{id}```
### Sample Body
```
 {
    "fullName": "Sadi",
    "weight": 58,
    "height": 25,
    "dob": "2000-08-08",
    "cancerHistory": "Y",
    "cancerRelatives": ["Aunt", "Samiha"],
    "profilePicture": "businessman",
    "lastPeriodDate": "2000-08-08",
    "avgCycleLength": 5,
    "periodIrregularities": ["Higher pain", "Longer than    average cycles"],
    "allergies": ["Peanut"],
    "organsWithChronicCondition": ["Heart", "Throat"],
    "medications": [{"name": "Napa Extra", "doseDescription": "3 times a day"},
    {"name": "Napa Extra", "doseDescription": "3 times a day"}]
 }
```

## Patient Information Register
``` Endpoint: POST /v1/infos/ROLE_PATIENT/{id}```
### Sample Body
```
{
	"fullName": "Sadi",
	"weight": 58,
	"height": 25,
	"dob": "2000-08-08",
	"cancerHistory": "Y",
	"cancerRelatives": ["Aunt", "Samiha"],
	"profilePicture": "aussieman",
	"lastPeriodDate": "2000-08-08",
	"avgCycleLength": 5,
	"periodIrregularities": ["Higher pain", "Longer than average cycles"],
	"allergies": ["Peanut"],
  	"cancerStage": "SURVIVOR",
  	"diagnosisDate": "2000-08-08",
  	"location": "sdfjlsdjflsjfljsf",
	"organsWithChronicCondition": ["Heart", "Throat"],
	"medications": [{"name": "Napa Extra", "doseDescription": "3 times a day"},
   				 {"name": "Napa Extra", "doseDescription": "3 times a day"}]
 }
```
## Update Profile Picture
``` Endpoint: PUT /v1/infos/profile_picture/{id}```
### Sample Body
```
{
  "profilePicture": "kaka"
}
```
## Update Basic User Info
``` Endpoint: PUT /v1/infos/ROLE_BASICUSER/{id}```
### Sample Body
```
{
    "fullName": "Sadatul",
    "weight": 55,
    "height": 25,
    "cancerHistory": "N",
    "cancerRelatives": [],
    "lastPeriodDate": "2000-07-08",
    "avgCycleLength": 5,
    "periodIrregularities": [],
    "allergies": ["Peanut"],
    "organsWithChronicCondition": ["Heart", "Throat", "Lung"],
    "medications": [{"name": "Napa Extra", "doseDescription": "3 times a day"},
                    {"name": "Napa Extend", "doseDescription": "3 times a day"}]
}
```
## Update Patient Info
``` Endpoint: PUT /v1/infos/ROLE_PATIENT/{id}```
### Sample Body
```
{
    "fullName": "Sadatul",
    "weight": 55,
    "height": 25,
    "cancerHistory": "Y",
    "cancerRelatives": ["Aunt"],
    "lastPeriodDate": "2000-07-08",
    "avgCycleLength": 5,
    "periodIrregularities": [],
    "allergies": ["Peanut"],
    "cancerStage": "STAGE_1",
    "diagnosisDate": "2000-09-08",
    "location": "bagerhat",
    "organsWithChronicCondition": ["Heart", "Throat", "Lung"],
    "medications": [{"name": "Napa Extra", "doseDescription": "3 times a day"},
                    {"name": "Napa Extend", "doseDescription": "3 times a day"}]
}
```
**<span style="color:red">Notes: This Note is applicable to almost all of the endpoints above except for 
profile update</span>**
* See how some members take lists like allergies, cancerStage etc. If no elements 
need to be passed, then pass an empty list like this:
```allergies:[]```
* If ```cancerHistory: "N"```, remember cancerRelatives must be an empty list.

## Get Nearby Users
``` Endpoint: GET /v1/ROLE_PATIENT/nearby/{id}```
### Sample Return Object
```
[
    {"id":4,"fullName":"Dimtri Islam","location":"883cf17603fffff"},
    {"id":7,"fullName":"Samiha Islam","location":"883cf17601fffff"},
    {"id":3,"fullName":"Faria Islam","location":"883cf1760bfffff"}
]
```

## Get Chat Rooms
``` Endpoint: GET /v1/chat/{id}```
### Sample Return Object
```
[
    {
        "roomId": 1,
        "userId": 3,
        "name": "Sadi",
        "profilePicture": "kaka"
    }
]

```
**<span style="color:red">Notes:</span>**
* if profile picture doesn't exist then ```"profilePicture": null```

## Get Chat Messages
``` Endpoint: GET /v1/chat/messages/{room_id}```
### Sample Return Object
```
[
    {
        "sender": 3,
        "message": "afzal king",
        "timestamp": "2024-07-01T17:02:03",
        "type": "TEXT"
    },
    {
        "sender": 3,
        "message": "afzal king",
        "timestamp": "2024-07-01T17:02:46",
        "type": "TEXT"
    }
]
```
**<span style="color:red">Notes:</span>**
* First call get rooms endpoint
* Then use the roomId from the first call to get the messages of the room

## Chat
```Socket Endpoint: /ws``` <br>
```Message Subscription Endpoint: /user/{id}/queue/messages``` <br>
```Error Subscription Endpoint: /user/{id}/queue/errors``` <br>
```Chat Endpoint: /app/chat``` <br>
### Sample Message Request Object
```
{
    "receiverId": 3,
    "message": "afzal king",
    "timestamp": "2024-07-01T17:02:03",
    "type": "TEXT"
}
```
**<span style="color:red">Notes:</span>**
* Remember we are using STOMP protocol, for js you must use @stomp/stompjs library
* For authorization, we are using STOMP connect headers. So, when CONNECT request is sent you must also provide Authorization: Bearer {JWT_TOKEN} header with the connect headers, otherwise connection won't be established
* During SEND request you must provide a json object. Here very the timestamp must be in ISO 8061 format. For JS, you can use this to set the timestamp new ```new Date().toISOString()```
* If you are using JS use the reference javaScriptCode that was provided to you.

## Doctor Information Register
``` Endpoint: POST /v1/infos/ROLE_DOCTOR/{id}```
### Sample Body
```
 {
	"fullName": "Dr. Adil",
  	"qualifications": ["MBBS", "DO"],
  	"workplace": "Khulna Medical College",
  	"department": "Cancer",
  	"designation": "Head",
  	"contactNumber": "01730445524",
  	"registrationNumber": "dfasdfsadfsdfsdfsdfsdf",
  	"profilePicture": "Nana"
}
```
## Update Doctor Info
``` Endpoint: PUT /v1/infos/ROLE_DOCTOR/{id}```
### Sample Body
```
{
	"fullName": "Dr. Adila",
  	"qualifications": ["MBBS", "FCPS"],
  	"workplace": "Comilla Medical College",
  	"department": "Cancer",
  	"designation": "Head",
  	"contactNumber": "01730445524"
}
```
## Add Doctor Consultation Location
``` Endpoint: POST /v1/ROLE_DOCTOR/{id}/locations```
### Sample Body
```
{
    "location":"sonadanga 2nd phase, Khulna",
    "start":"07:43:23",
    "end":"16:43:23",
    "workdays":"1111110",
    "fees": 500
}
```
**<span style="color:red">Notes:</span>**
* The format of time should be HH:mm:ss, it is 24 hours format. Remember each HH or mm or ss must have two digits. Otherwise, the request will fail
* End time must be after the start time
* workdays must have length of 7 and can only contain 0 and 1
* Each of the field must be present, can't be null
* If any of these criteria fails, then the request will return a 400 Bad Request
* The response will send you a Location header of the resource created. *You won't be able to perform get request on this but. DELETE and PUT request will be allowed for deleting and updating*

## Update Doctor Consultation Location
``` Endpoint: PUT /v1/ROLE_DOCTOR/{doctor_id}/locations/{location_id}```
### Sample Body
```
{
    "location":"sonadanga 2nd phase, Khulna",
    "start":"07:43:23",
    "end":"16:43:23",
    "workdays":"1111110",
    "fees": 500
}
```

**<span style="color:red">Notes:</span>**
* The format of time should be HH:mm:ss, it is 24 hours format. Remember each HH or mm or ss must have two digits. Otherwise, the request will fail
* End time must be after the start time
* workdays must have length of 7 and can only contain 0 and 1
* Each of the field must be present, can't be null
* If any of these criteria fails, then the request will return a 400 Bad Request

## Delete Doctor Consultation Location
``` Endpoint: DELETE /v1/ROLE_DOCTOR/{doctor_id}/locations/{location_id}```

## Add Doctor Review
``` Endpoint: POST /v1/reviews/doctor/{id}``` \

**Note: Here id means the user who is providing the review**
### Sample Body
```
{
  "id":4,
  "rating":3,
  "comment": "A very good doctor"
}
```
**<span style="color:red">Notes:</span>**
* In the body "id" refers to the id of the resource that is being reviewed
* rating can be a value between 1(inclusive) and 5(inclusive).
* comments can be maximum 255 chars long.
* Here you must provide an id and rating but comment can be null
* The response will send you a Location header of the resource created. *You won't be able to perform get request on this but. DELETE and PUT request will be allowed for deleting and updating*

### Response Body
```
{
    "count": 3,
    "averageRating": 2.6666666666666665,
    "ratingCount":[
        1,
        0,
        1,
        1,
        0
    ]
}
```
**<span style="color:red">Notes:</span>**
* count -> total number of reviews for the doctor to which the review was added
* averageRating -> The average rating (after the new review was added) of the doctor to which the review was added.
* ratingCount -> 0th index refers to the number of 1-star reviews, 1st index refers to the number of 2-star reviews and so on.
* This response will be also returned for each review update and delete, the info will be the latest info after performing the update.

## Update Doctor Review
``` Endpoint: PUT /v1/reviews/doctor/{id}/{review_id}``` \

**Note: Here id means the user who is providing the review**
### Sample Body
```
{
  "rating":3,
  "comment": "A very good doctor"
}
```
**<span style="color:red">Notes:</span>**
* rating can be a value between 1(inclusive) and 5(inclusive).
* comments can be maximum 255 chars long.
* Here you must provide rating but comment can be null

### Response Body
```
{
    "count": 3,
    "averageRating": 2.6666666666666665,
    "ratingCount":[
        1,
        0,
        1,
        1,
        0
    ]
}
```
**<span style="color:red">Notes:</span>**
* count -> total number of reviews for the doctor to which the review was added
* averageRating -> The average rating (after the new review was added) of the doctor to which the review was added.
* ratingCount -> 0th index refers to the number of 1-star reviews, 1st index refers to the number of 2-star reviews and so on.

## Delete Doctor Review
``` Endpoint: DELETE /v1/reviews/doctor/{id}/{review_id}``` \

### Response Body
```
{
    "count": 3,
    "averageRating": 2.6666666666666665,
    "ratingCount":[
        1,
        0,
        1,
        1,
        0
    ]
}
```
**<span style="color:red">Notes:</span>**
* count -> total number of reviews for the doctor to which the review was added
* averageRating -> The average rating (after the new review was added) of the doctor to which the review was added.
* ratingCount -> 0th index refers to the number of 1-star reviews, 1st index refers to the number of 2-star reviews and so on.

## Add Doctor Appointment
``` Endpoint: POST /v1/appointments```
### Sample Body
```
{
    "patientId": 2,
    "doctorId": 4,
    "patientContactNumber": "01730445524",
    "locationId": 1,
    "date": "2024-08-08",
    "isOnline": true
}
```

**<span style="color:red">Notes:</span>**
* Add appointment request can be sent by any role
* None of the above fields can be null. Must provide each one.
* isOnline is not a string rather a boolean value.

##  Doctor Accept Appointment
``` Endpoint: PUT /v1/appointments/{appointment_id}/accept```
### Sample Body
```
{
    "time": "07:43:22"
}
```

**<span style="color:red">Notes:</span>**
* Only doctors can use this endpoint
* Must provide with a time

##  Doctor Decline Appointment
``` Endpoint: DELETE /v1/appointments/{appointment_id}/decline```

**<span style="color:red">Notes:</span>**
* Only doctors can use this endpoint
* Doctor can only decline appointments that are at REQUESTED status or at ACCEPTED status

##  Patient Cancel Appointment
``` Endpoint: DELETE /v1/appointments/{appointment_id}/cancel```

**<span style="color:red">Notes:</span>**
* Patient can only cancel appointments that are at REQUESTED status or at ACCEPTED status

## Payment for Doctor Appointment
``` Endpoint: POST /v1/payment/appointment/{appointment_id}/initiate```
### Sample Body
```
{
  "customerName": "Sadatul Islam Sadi",
  "customerEmail": "sadatulislamsadi@gmail.com",
  "customerPhone": "0171231213"
}
```
**<span style="color:red">Notes:</span>**
* Each of the field must be provided
* customerEmail must be a valid email

### Response Body
```
{
    "transactionId": "17208953344777288",
    "gatewayUrl": "https://sandbox.sslcommerz.com/EasyCheckOut/testcdebca74f4c2f037c2e974a06d9dac94c4a"
}

```
**<span style="color:red">Notes:</span>**
* This only initiates the payment request. To complete payment, the transaction must be validated. To validate the transaction you will need the transactionId
* "gatewayUrl" is a the url to the sslcommerz gateway, where you will find different options to pay.

## Validate Payment for Doctor Appointment
``` Endpoint: GET /v1/payment/appointment/{appointment_id}/validate```
### Query Parameters
```
transId=17208953344777288
```
**<span style="color:red">Notes:</span>**
* Note this is a get request. You don't need to send a body but need to send a query parameter named transId
* "transId" is the transactionId that we got when we initiated the payment
* From the get request you will get three different HttpStatus codes
  * **400** : means transaction has failed user needs to retry by initiating the payment again
  * **202** : transaction is still pending. User hasn't made any payment via the gateway
  * **200** : payment has been completed. Nice

## Get getStream user token
``` Endpoint: GET /v1/meeting/user/token```
### Response Body
```
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMiIsImV4cCI6MTcyMTAzOTgxMCwiaWF0IjoxNzIwOTUzNDEwfQ.4XOYbXjt4-vBDIiErqmf-4sp9_SuvhLKRUgAord8rPY"
}
```

## Create a online meeting
``` Endpoint: POST /v1/online-meeting/start```
<br><br>
```Response status: created(201)```
### Sample Body
```
{
  "appointmentId": 2
}
```
**<span style="color:red">Notes:</span>**
* Appointment id must be provided and appointment must be in ACCEPTED status.
* Appoint also has tobe online and payment should be complete
### Response Body
```
status: create(201)
{
    "callId": "21324141412"
}
```
## Join a online meeting
``` Endpoint: GET /v1/online-meeting/join```
<br><br>
```Response status: ok(200)```
### Response Body
```
{
  "callId": "2417210933683308291",
  "prescription":{
    "analysis": "Roma 1",
    "medications":[
      {
        "name": "Sapa",
        "doseDescription": "Bala"
      },
      {
        "name": "napa",
        "doseDescription": "BaKumla"
      }
    ],
    "tests":[
        "Name",
        "Name",
        "Nani"
     ]
  }
}
```
## Close a online meeting
``` Endpoint: DELETE /v1/online-meeting/close```
<br><br>
```Response status: noContent(204)```
## Live Prescription
```Socket Endpoint: /ws``` <br>
```LivePrescription Subscription Endpoint: /user/{id}/queue/live-prescription``` <br>
```Error Subscription Endpoint: /user/{id}/queue/live-prescription/errors``` <br>
```Send Endpoint: /app/live-prescription``` <br>
### Sample LivePrescription Request Object
```
{
      "receiverId": 2,
      "callId": "2417210933683308291",
      "analysis": "You are paralyzed",
      "medications": [
          { "name": "Sapa", "doseDescription": "Bala" },
          { "name": "napa", "doseDescription": "BaKumla" }
        ],
      "tests": ["Name", "Name", "Nani"]
}
```
## Get request for appointments both for doctors and patients
``` Endpoint: GET /v1/appointments```
### Response Body for doctors
```
[
  {
    "date": "2024-08-08",
    "fees": 700,
    "patientFullName:": "Sadi",
    "locationName": "Rule 2nd phase, Khulna",
    "patientContactNumber": "01730445524",
    "patientID": 2,
    "locationId": 1,
    "isOnline": true,
    "id": 1,
    "time": "07:43:22",
    "isPaymentComplete": true,
    "status": "RUNNING"
  }
]
```
### Response Body for Patients
```
[
  {
    "date": "2024-08-08",
    "fees": 700,
    "locationName": "Rule 2nd phase, Khulna",
    "patientContactNumber": "01730445524",
    "doctorId": 4,
    "locationId": 1,
    "isOnline": true,
    "id": 1,
    "time": "07:43:22",
    "doctorFullName:": "Dr. Adil",
    "isPaymentComplete": true,
    "status": "RUNNING"
  }
]
```
## Get request for DoctorDetails for guest Users
``` Endpoint: GET /v1/infos/guest/doctor/{doc_id}```
```
{
  "qualifications":[
    "MBBS",
    "DO"
  ],
  "profilePicture": null,
  "isVerified": "Y",
  "contactNumber": "01730445524",
  "fullName": "Dr. Adil",
  "designation": "Head",
  "department": "Cancer",
  "workplace": "Khulna Medical College"
}
```
## Get info for BASICUSER/PATIENTS for guest Users
``` Endpoint: GET /v1/infos/guest/basic/{id}```
```
{
  "profilePicture": null,
  "roles":[
    "ROLE_PATIENT"
  ],
  "diagnosisDate": "2000-08-08",
  "cancerStage": "SURVIVOR",
  "fullName": "Sadi",
  "username": "2005077@ugrad.cse.buet.ac.bd"
}
```
## Get locations for doctors for owner/guest users
``` Endpoint: GET /v1/ROLE_DOCTOR/{doc_id}/locations```
```
[
  {
    "workdays": "1110110",
    "fees": 700,
    "start": "07:43:23",
    "location": "Rule 2nd phase, Khulna",
    "end": "17:43:23",
    "id": 1
  },
  {
    "workdays": "1111110",
    "fees": 500,
    "start": "07:43:23",
    "location": "sonadanga 2nd phase, Khulna",
    "end": "12:43:23",
    "id": 2
  }
]
```
## Get profile_picture for user
``` Endpoint: GET /v1/infos/profile_picture```
```
{
  "profilePicture": "kaka"
}
```
## Get reviews for doctors
``` Endpoint: GET /v1/reviews/doctor/{id}```
```
[
  {
    "id": 33,
    "reviewerId": 3,
    "reviewerName": "2005077@ugrad.cse.buet.ac.bd",
    "rating": 3,
    "comment": "A very good doctor",
    "timestamp": "2024-07-16T11:46:20"
  },
  {
    "id": 32,
    "reviewerId": 2,
    "reviewerName": "sadatulislamsadi@gmail.com",
    "rating": 4,
    "comment": "Sultan is back",
    "timestamp": "2024-07-14T11:22:44"
  }
]
```
**<span style="color:red">Notes:</span>** <br>
* Reviews will be sorted based on time**

## Add Report
``` Endpoint: POST /v1/reports```
<br>
<br>
```Response status: created(201)```
### Sample Body
```
{
	"doctorName": "Dr. Morshad Hossain",
	"hospitalName": "Gazi Medical, Khulna",
	"date": "2024-08-08",
	"summary": "ljdflasldfsldfjlsdflsdfjlsdfjsldfjsldfjsldfjsldfjlasdjf",
  	"fileLink": "google.com",
	"keywords": ["Heart", "Lungs"]
 }
```

**<span style="color:red">Notes:</span>**
* Add report request can be sent by any role
* None of the above fields can be null. Must provide each one.
* if you have no keywords than send an empty list ( [ ] )
* Summary must be limited to 1000 characters.

## Update Report
``` Endpoint: PUT /v1/reports/{report_id}```
<br>
<br>
```Response status: noContent(204)```
### Sample Body
```
{
	"doctorName": "Dr. Morshad Hossain",
	"hospitalName": "Gazi Medical, Khulna",
	"date": "2024-08-08",
	"summary": "ljdflasldfsldfjlsdflsdfjlsdfjsldfjsldfjsldfjsldfjlasdjf",
  	"fileLink": "google.com",
	"keywords": ["Heart", "Lungs"]
 }
```

**<span style="color:red">Notes:</span>**
* None of the above fields can be null. Must provide each one.
* if you have no keywords than send an empty list ( [ ] )
* Summary must be limited to 1000 characters.
*  Remember whatever you send here will directly replace in database. So if you want to keep some fields with previous data you must send that previous data.

##  Delete report
``` Endpoint: DELETE /v1/reports/{report_id}```
<br>
<br>
```Response status: noContent(204)```


## Filter Reports
``` Endpoint: GET /v1/reports```
```Response status: ok(200)```
<br><br>
``` Query params: doctorName=Morshad```
<br>
``` Query params: hospitalName=hospital```
<br>
``` Query params: keywords=heart,kidney```
<br>
``` Query params: startDate=2024-08-22```
<br>
``` Query params: endDate=2024-08-31```
<br>
``` Query params: sort=ASC```
<br><br>
**<span style="color:red">Notes:</span>**
* You can omit any one without any issues.
* if you omit sort param then reports will be returned in descending order of last update time
* keywords must be comma separated.
* The relationships between keywords in and. If you have 5 keywords then all 5 will be keywords must be present in a report to show it in the filter result.

### Response Body
```
[
  {
    "date": "2024-08-08",
    "summary": "ljdflasldfsldfjlsdflsdfjlsdfjsldfjsldfjsldfjsldfjlasdjf",
    "doctorName": "Dr. Morshad Hossain",
    "fileLink": "google.com",
    "keywords":[
    "Heart",
    "Lungs"
      ],
    "id": 3,
    "hospitalName": "Gaza Medical, Khulna"
  }
]
```