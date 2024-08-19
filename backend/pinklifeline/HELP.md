# Pinklifeline API Docs
### Generating public and private keys
```bash
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private.pem -out public.pub
```

### Database startup
```bash
docker run -d -e MYSQL_ROOT_PASSWORD=sadi -e MYSQL_USER=pinklifeline -e MYSQL_PASSWORD=pinklifeline -e MYSQL_DATABASE=pinklifeline --name mysql-basic -p 3306:3306 mysql:latest
```

### Redis Startup
```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 -v `pwd`/redis-stack.conf:/redis-stack.conf redis/redis-stack:latest
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

## Update LocationShare status
``` Endpoint: PUT /v1/ROLE_PATIENT/toggle-location-share```
<br><br>
```Response status: ok(200)```
### Sample Return Object
```
{
  "locationShare": false
}
```
**<span style="color:red">Notes:</span>**
* "locationShare" is the latest status of the locationShare. This endpoint works like a toggle.


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
* For authorization, we are using httpOnly cookie. If the cookie is not available then websocket will not be opened.
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
  "callId": "2317226806956981703",
  "prescription":{
    "id": 1,
    "patientId": 2,
    "patientName": "Sadatul",
    "doctorId": 3,
    "doctorName": "Dr. Rahima Begum",
    "weight": 58.0,
    "height": 25.0,
    "age": 23,
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
     ],
    "date": "2024-08-03"
  }
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
    "id": 1,
    "patientId": 2,
    "patientName": "Sadatul",
    "doctorId": 3,
    "doctorName": "Dr. Rahima Begum",
    "weight": 58.0,
    "height": 25.0,
    "age": 23,
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
     ],
    "date": "2024-08-03"
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
      "weight": 55.0,
      "height": 50.0,
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
      "FCPS"
    ],
  "profilePicture": "Nana",
  "isVerified": "Y",
  "contactNumber": "01730445524",
  "fullName": "Dr. Anika",
  "designation": "Head",
  "department": "Cancer",
  "workplace": "Comilla Medical College",
  "reviewSummary":{
      "count": 3,
      "averageRating": 3.3333333333333335,
      "ratingCount":[0, 0, 2, 1, 0]
  }
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
    "id": 4,
    "reviewerId": 5,
    "reviewerName": "Dr. Rahima Begum",
    "profilePicture": "Nana",
    "rating": 3,
    "comment": "A very good doctor",
    "timestamp": "2024-07-29T22:42:45"
  },
  {
    "id": 3,
    "reviewerId": 4,
    "reviewerName": "Biva Ahmed",
    "profilePicture": "google.com",
    "rating": 4,
    "comment": "A very good doctor",
    "timestamp": "2024-07-29T22:20:51"
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
``` Query params: force=true```
<br>
```Response status: noContent(204) or badRequest(400)```
<br><br>
**<span style="color:red">Notes:</span>**
* By default, force is false. If a report is shared with any doctor, you will get badRequest.
* If force is true, the report will be deleted even if it is shared with another doctor.
## Paginated Responses
```
{
  "content":[<Actual Response body. Should be a list>],
  "page":{
    "size": 2,
    "number": 0,
    "totalElements": 1,
    "totalPages": 1
  }
}
```
**<span style="color:red">Notes:</span>**
* Every paginated response will have this structure
* In the title if you see :Paginated. That means this response has pagination
* Any title with ": Paginated" will have a response body. That body will found in the "content" field
* page.size -> means the size of each page
* page.number -> page number (starts with 0)
* totalElements -> Number of total elements
* totalPages -> Number of totalPages

## GET Reports: Paginated
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
<br>
``` Query params: pageNo=0```
<br><br>
**<span style="color:red">Notes:</span>**
* You can filter result based on the query parameters
* You can omit any one without any issues.
* if you omit sort param then reports will be returned in descending order of last update time
* keywords must be comma separated.
* The relationships between keywords in and. If you have 5 keywords then all 5 will be keywords must be present in a report to show it in the filter result.
* Here PageNo. is the number of page you want to load in a paginated response. If pageNo. is omitted, 0 index or first page will be sent. Remember pageNo. must be 0 indexed meaning fist page starts at zero.

### Response Body.content
**<span style="color:red">Note: This is paginated. You will find this list inside "content" field</span>**
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

## Share Report
``` Endpoint: POST /v1/reports/share```
<br>
<br>
```Response status: created(201)```
### Sample Body
```
{
  "reportId": 14,
  "doctorId": 3,
  "period": 72
}
```

**<span style="color:red">Notes:</span>**
* reportId and doctorId is mandatory.
* period is optional. Here the report will be shared for 72 hours
* If period is omitted then the report will be shared for infinite time until user revokes it.

## Revoke Report
``` Endpoint: DELETE /v1/reports/share/{sharedReportId}```
<br>
<br>
```Response status: noContent(204)```

**<span style="color:red">Notes:</span>**
* "sharedReportId" is not same as reportId. You can find this when you GetSharedReport or you get a share info for report.

## GET Shared reports for user: Paginated
``` Endpoint: GET /v1/reports/share```
<br><br>
```Response status: ok(200)```
<br><br>
``` Query params: username=Morshad```
<br>
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
``` Query params: type=ALL```
<br>
``` Query params: pageNo=0```
<br><br>
**<span style="color:red">Notes:</span>**
* "username" is doctors username.
* You can filter result based on the query parameters
* You can omit any one without any issues.
* Shared reports will be sorted based on username
* keywords must be comma separated.
* The relationships between keywords in and. If you have 5 keywords then all 5 will be keywords must be present in a report to show it in the filter result.
* "type" can have three values ALL(for all reports), UNLIMITED(the reports that are shared for infinite time) and LIMITED(the reports that are shared for limited amount of time)"
* Here PageNo. is the number of page you want to load in a paginated response. If pageNo. is omitted, 0 index or first page will be sent. Remember pageNo. must be 0 indexed meaning fist page starts at zero.

### Response Body.content
**<span style="color:red">Note: This is paginated. You will find this list inside "content" field</span>**
```
[
  {
    "id": 8,
    "username": "bfb38043@doolk.com",
    "fullName": "bfagbb",
    "expirationTime": "2024-07-30T09:08:12",
    "reportId": 12,
    "doctorName": "Dr. Sadi Kaka",
    "hospitalName": "Belgium Medical, Belgium",
    "date": "2021-10-08",
    "summary": "ljdflasldfsldfjlsdflsdfjlsdfjsldfjsldfjsldfjsldfjlasdjf",
    "fileLink": "google.com"
  }
]
```
**<span style="color:red">Notes:</span>**
* "id" is sharedReportId, this can be used to revoke share.
* "username" is doctors username. "fullName" is doctor fullName.
* "expirationTime" is the time when the share will be expired. If null it means the share will exist for infinite time. 
* The rest of the information are about the report that was shared.

## GET Shared reports for doctors: Paginated
``` Endpoint: GET /v1/reports/share```
<br><br>
```Response status: ok(200)```
<br><br>
``` Query params: username=Morshad```
<br>
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
``` Query params: type=ALL```
<br>
``` Query params: pageNo=0```
<br><br>
**<span style="color:red">Notes:</span>**
* "username" is username of the user who owns the report.
* You can filter result based on the query parameters
* You can omit any one without any issues.
* Shared reports will be sorted based on username
* keywords must be comma separated.
* The relationships between keywords in and. If you have 5 keywords then all 5 will be keywords must be present in a report to show it in the filter result.
* "type" can have three values ALL(for all reports), UNLIMITED(the reports that are shared for infinite time) and LIMITED(the reports that are shared for limited amount of time)"
* Here PageNo. is the number of page you want to load in a paginated response. If pageNo. is omitted, 0 index or first page will be sent. Remember pageNo. must be 0 indexed meaning fist page starts at zero.

### Response Body.content
**<span style="color:red">Note: This is paginated. You will find this list inside "content" field</span>**
```
[
  {
    "id": 8,
    "username": "bfb38043@doolk.com",
    "fullName": "bfagbb",
    "expirationTime": "2024-07-30T09:08:12",
    "reportId": 12,
    "doctorName": "Dr. Sadi Kaka",
    "hospitalName": "Belgium Medical, Belgium",
    "date": "2021-10-08",
    "summary": "ljdflasldfsldfjlsdflsdfjlsdfjsldfjsldfjsldfjsldfjlasdjf",
    "fileLink": "google.com"
  }
]
```
**<span style="color:red">Notes:</span>**
* "id" is sharedReportId
* "username" is username of the user who owns the report. "fullName" is owner's fullName.
* "expirationTime" is the time when the share will be expired. If null it means the share will exist for infinite time.
* The rest of the information are about the report that was shared.

## Get share info for reports
``` Endpoint: GET /v1/reports/{reportId}/share```
<br><br>
```Response status: ok(200)```

### Response Body
```
[
  {
    "id":1,
    "username":"14@gmail.com",
    "fullName":"Raka Vai",
    "expirationTime":null
  }
]
```
**<span style="color:red">Notes:</span>**
* "id" is sharedReportId, this can be used to revoke share.
* "username" is doctors username. "fullName" is doctor fullName.
* "expirationTime" is the time when the share will be expired. If null it means the share will exist for infinite time.

## Get PatientInfo For Doctor with appointments
```Endpoint: /v1/appointments/user-data/{appointment_id}```
<br><br>
```Response status: ok(200)```
### Response Body
```
{
  "allergies":["Peanut"],
  "organsWithChronicConditions":["Heart","Throat"],
  "diagnosisDate": "2000-08-08",
  "cancerRelatives":["Aunt","Samiha"],
  "fullName": "Sadatul",
  "weight": 58.0,
  "avgCycleLength": 5,
  "cancerHistory": "Y",
  "lastPeriodDate": "2000-08-08",
  "medications":[
   {
    "name": "Napa Extra",
    "doseDescription": "3 times a day"
   },
   {
    "name": "Napa Extra",
    "doseDescription": "3 times a day"
   }
  ],
  "cancerStage": "SURVIVOR",
  "periodIrregularities":["Higher pain","Longer than average cycles"],
  "age": 23,
  "height": 25.0
  }
```
**<span style="color:red">Notes:</span>**
* if the patient is a basicUser then cancerStage, diagnosisDate will not be present, be very careful

## Get User info For Doctor
```Endpoint: /v1/infos/ROLE_DOCTOR/{user_id}```
<br><br>
```Response status: ok(200)```
### Response Body
```
{
  "qualifications":["MBBS","FCPS"],
  "isVerified": "N",
  "registrationNumber": "dfasdfsadfsdfsdfsdfsdf",
  "contactNumber": "01730445524",
  "fullName": "Dr. QQW Ahmed",
  "designation": "Head",
  "department": "Cancer",
  "workplace": "Dhaka Medical College"
}
```

## Get User info For Basic User
```Endpoint: /v1/infos/ROLE_BASICUSER/{user_id}```
<br><br>
```Response status: ok(200)```
### Response Body
```
{
  "allergies":["Peanut"],
  "organsWithChronicConditions":["Heart", "Throat"],
  "cancerRelatives":["Aunt", "Samiha"],
  "fullName": "Sadatul",
  "weight": 58.0,
  "avgCycleLength": 5,
  "cancerHistory": "Y",
  "lastPeriodDate": "2000-08-08",
  "dob": "2000-08-08",
  "medications":[
  {
    "name": "Napa Extra",
    "doseDescription": "3 times a day"
  },
  {
    "name": "Napa Extra",
    "doseDescription": "3 times a day"
  }
],
  "periodIrregularities":[ "Higher pain", "Longer than average cycles"],
  "height": 25.0
}
```

## Get User info For patient
```Endpoint: /v1/infos/ROLE_PATIENT/{user_id}```
<br><br>
```Response status: ok(200)```
### Response Body
```
{
  "allergies":["Peanut"],
  "organsWithChronicConditions":["Heart", "Throat"],
  "cancerRelatives":["Aunt", "Samiha"],
  "fullName": "Sadatul",
  "weight": 58.0,
  "avgCycleLength": 5,
  "cancerHistory": "Y",
  "lastPeriodDate": "2000-08-08",
  "dob": "2000-08-08",
  "medications":[
  {
    "name": "Napa Extra",
    "doseDescription": "3 times a day"
  },
  {
    "name": "Napa Extra",
    "doseDescription": "3 times a day"
  }
],
  "periodIrregularities":[ "Higher pain", "Longer than average cycles"],
  "height": 25.0,
  "cancerStage": "SURVIVOR",
  "diagnosisDate": "2020-08-03",
  "location": "sdfasdfdsfsdfjsdfjfds"
}
```
## Get a Report By Id
```Endpoint: /v1/reports/{report_id}```
<br><br>
```Response status: ok(200)```
### Response Body
```
{
  "date": "2022-10-08",
  "summary": "ljdflasldfsldfjlsdflsdfjlsdfjsldfjsldfjsldfjsldfjlasdjf",
  "doctorName": "Dr. Isa Hossai",
  "fileLink": "google.com",
  "shareInfo":[
    {
      "id": 1,
      "username": "acy06289@nowni.com",
      "fullName": "Dr. Rahima Begum",
      "expirationTime": "2024-08-11T20:40:21"
    }
   ],
  "keywords":["Blood", "Body"],
  "id": 1,
  "hospitalName": "American Medical, Belgium"
}
```
## Get Balance for User
```Endpoint: /v1/infos/balance```
<br><br>
```Response status: ok(200)```
### Response Body
```
{
  "balance": 900
}
```
## Get balance history for user: Paginated
```Endpoint: /v1/infos/balance/history```
<br><br>
```Response status: ok(200)```
### Response Body
```
[
  {
    "description": "Payment of 450 received for appointment",
    "id": 3,
    "value": 450,
    "timestamp": "2024-08-11T12:11:02"
  },
  {
    "description": "Payment of 450 received for appointment",
    "id": 1,
    "value": 450,
    "timestamp": "2024-08-11T10:19:23"
  }
]
```
**<span style="color:red">Notes:</span>**
* *THIS BODY IS PAGINATED*. Check paginated Request.

## Add Blog
``` Endpoint: POST /v1/blogs```
<br>
<br>
```Response status: created(201)```
### Sample Body
```
{
  "title": "Basic Cancer Surgery",
  "content": "Lorem ipsum odor amet, consectetuer adipiscing elit. s. ligula."
}
```

**<span style="color:red">Notes:</span>**
* Add blog request can be sent only by doctors
* None of the above fields can be null. Must provide each one.
* Title is limited to 255 characters and body is limited to 65535 characters

## Update Blog
``` Endpoint: PUT /v1/blogs/{blog_id}```
<br>
<br>
```Response status: noContent(204)```
### Sample Body
```
{
  "title": "Basic Cancer Surgery",
  "content": "Lorem ipsum odor amet, consectetuer adipiscing elit. s. ligula."
}
```

**<span style="color:red">Notes:</span>**
* Add blog request can be sent only by doctors
* None of the above fields can be null. Must provide each one.
* Title is limited to 255 characters and body is limited to 65535 characters
* Remember whatever you send here will directly replace in database. So if you want to keep some fields with previous data you must send that previous data.

##  Delete blog
``` Endpoint: DELETE /v1/blogs/{blog_id}```
<br>
<br>
```Response status: noContent(204)```

## Vote or Un-Vote Blog
``` Endpoint: PUT /v1/blogs/{blog_id}/vote```
<br>
<br>
```Response status: ok(200)```
### Sample Return Body
```
{
  "voteChange": -1
}
```

**<span style="color:red">Notes:</span>**
* This endpoint works like a toggle. If a vote for this blog_id with current user already exists it will remove the vote, and you will get a -1 as response. But if you a vote doesn't exist for the blog_id by the current user, then a vote will be added to the blog and you will get a 1 as response.

## GET Blogs: Paginated
```
Endpoint: GET
    registered user: /v1/blogs
    anonymous user: /v1/anonymous/blogs
```
```Response status: ok(200)```
<br><br>
``` Query params: docId=1```
<br>
``` Query params: doctorName=Morshad```
<br>
``` Query params: title=lsfjsldfj```
<br>
``` Query params: startDate=2024-08-22```
<br>
``` Query params: endDate=2024-08-31```
<br>
``` Query params: sortType=TIME```
<br>
``` Query params: sortDirection=ASC```
<br>
``` Query params: pageNo=0```
<br><br>
**<span style="color:red">Notes:</span>**
* You can filter result based on the query parameters
* You can omit any one without any issues.
* sorType can have two values ```TIME or VOTES```. By default, TIME will be selected. You can sort based on creation time or votes by using this parameter.
* sortDirection can have two values ```ASC or DESC```. By default, DESC is selected.
* If sortType and sortDirection is omitted, the result will be sorted in descending order of creation time.
* Here PageNo. is the number of page you want to load in a paginated response. If pageNo. is omitted, 0 index or first page will be sent. Remember pageNo. must be 0 indexed meaning fist page starts at zero.

### Response Body.content
**<span style="color:red">Note: This is paginated. You will find this list inside "content" field</span>**
```
[
  {
    "id": 4,
    "title": "Basic Cancer Surgery",
    "content": "Lorem ipsum odor amet, consectetuer adipiscing eli",
    "voteId": null,
    "author": "Dr. QQW Ahmed",
    "authorId": 4,
    authorProfilePicture": null,
    "upvoteCount": 0,
    "createdAt": "2024-08-15T12:46:33"
   }
]
```
**<span style="color:red">Notes:</span>**
* Here we are only returning the first 100 chars of the content via the content field.
* If voteId is null that means the current user hasn't voted for this blog. If it has a value(Long), then the user has voted for this blog. 

## Get Blog info by Id
```
Endpoints: GET 
    registered users: /v1/blogs/{blog_id}
    anonymous users: /v1/anonymous/blogs/{blog_id}
```
```Response status: ok(200)```
### Response Body
```
{
  "id": 3,
  "title": "Basic Cancer Surgery",
  "content": "Vel tincidunt ligula egestas neque praesent consequat venenatis.",
  "voteId": null,
  "authorId": 3,
  "authorName": "Dr. Rahima Begum",
  "authorProfilePicture": "Nana",
  "authorDepartment": "Cancer",
  "authorWorkplace": "Rajshahi Medical College",
  "authorDesignation": "Head",
  "authorQualifications":["MBBS", "DO"],
  "upvoteCount": 0,
  "createdAt": "2024-08-16T09:00:51"
}
```
**<span style="color:red">Notes:</span>**
* If voteId is null that means the current user hasn't voted for this blog. If it has a value(Long), then the user has voted for this blog.

## Add Forum Question
``` Endpoint: POST /v1/forum```
<br>
<br>
```Response status: created(201)```
### Sample Body
```
{
  "title": "Basic Cancer Surgery",
  "body": "Lorem ipsum odor amet, consectetuer adipiscing elit. s. ligula.",
  "tags": ["Digital", "Social Media"]
}
```

**<span style="color:red">Notes:</span>**
* None of the above fields can be null. Must provide each one.
* Title is limited to 255 characters and body is limited to 65535 characters

## Update Forum Question
``` Endpoint: PUT /v1/forum/{forum_id}```
<br>
<br>
```Response status: noContent(204)```
### Sample Body
```
{
  "title": "Basic Cancer Surgery",
  "body": "Lorem ipsum odor amet, consectetuer adipiscing elit. s. ligula.",
  "tags": ["Digital", "Social Media"]
}
```
**<span style="color:red">Notes:</span>**
* None of the above fields can be null. Must provide each one.
* Title is limited to 255 characters and body is limited to 65535 characters
* Remember whatever you send here will directly replace in database. So if you want to keep some fields with previous data you must send that previous data.

##  Delete Forum Question
``` Endpoint: DELETE /v1/forum/{forum_id}```
<br>
<br>
```Response status: noContent(204)```

## Vote or Un-Vote Forum Question
``` Endpoint: PUT /v1/forum/{forum_id}/vote```
<br>
<br>
```Response status: ok(200)```
### Sample Body
```
{
  "voteType":"DOWNVOTE"
}
```
### Sample Return Body
```
{
  "voteChange": -1
}
```
**<span style="color:red">Notes:</span>**
* There are three voteType
  * UPVOTE
  * DOWNVOTE
  * UNVOTE (Removes existing vote)
* "voteChange" specifies the amount of change you should see in the voteCount
## GET Forum Questions: Paginated
``` 
Endpoints: GET
    registered users: /v1/forum
    anonymous users: /v1/anonymous/forum
```
```Response status: ok(200)```
<br><br>
``` Query params: userId=1```
<br>
``` Query params: tags=cancer,hospital```
<br>
``` Query params: title=lsfjsldfj```
<br>
``` Query params: startDate=2024-08-22```
<br>
``` Query params: endDate=2024-08-31```
<br>
``` Query params: sortType=TIME```
<br>
``` Query params: sortDirection=ASC```
<br>
``` Query params: pageNo=0```
<br><br>
**<span style="color:red">Notes:</span>**
* You can filter result based on the query parameters
* You can omit any one without any issues.
* "tags" comma separated tags with no spaces in between. A result will only be shown once all the tags are present the forum quesiton.
* sortType can have two values ```TIME or VOTES```. By default, TIME will be selected. You can sort based on creation time or votes by using this parameter.
* sortDirection can have two values ```ASC or DESC```. By default, DESC is selected.
* If sortType and sortDirection is omitted, the result will be sorted in descending order of creation time.
* Here PageNo. is the number of page you want to load in a paginated response. If pageNo. is omitted, 0 index or first page will be sent. Remember pageNo. must be 0 indexed meaning fist page starts at zero.

### Response Body.content
**<span style="color:red">Note: This is paginated. You will find this list inside "content" field</span>**
```
[
  {
    "id": 3,
    "title": "Cancer Patient Diet",
    "voteByUser": null,
    "author": "Sadatul",
    "authorId": 2,
    "authorProfilePicture": "aussieman",
    "voteCount": 0,
    "createdAt": "2024-03-16T20:59:42"
  }
]
```
**<span style="color:red">Notes:</span>**
* If voteByUser is null that means the current user hasn't voted for this blog. If it is one 1 then, the user has up-voted and if -1, then down-voted

## Get Forum Question Info by Id
```
Endpoints: GET
    registered users: /v1/forum/{forum_id}
    anonymous users: /v1/anonymous/forum/{forum_id}
```
```Response status: ok(200)```
### Response Body
```
  "id": 4,
  "title": "Istanbul Complex Treatment",
  "body": "m libero natoque hac hendrerit nibh amet, torquent ornare.",
  "voteByUser": null,
  "author": "Sadatul",
  "authorId": 2,
  "authorProfilePicture": "aussieman",
  "voteCount": 1,
  "createdAt": "2024-06-16T21:00:06",
  "tags":["Hospital", "Heart"]
```
**<span style="color:red">Notes:</span>**
* If "voteByUser" is null that means the current user hasn't voted for this blog. If it is one 1 then, the user has up-voted and if -1, then down-voted
## Add Forum Answer
``` Endpoint: POST /v1/forum/answers```
<br>
<br>
```Response status: created(201)```
### Sample Body
```
{
  "questionId": 4,
  "parentId": 1,
  "body": "Very good Reply to 10"
}
```

**<span style="color:red">Notes:</span>**
* If parentId is omitted or null, then the answer will be registered as a root answer. If it has a answerId that refers to another answer in the same question, then it will be registered as an reply.
* "body" is limited to 65535 characters

## Update Forum Answer
``` Endpoint: PUT /v1/forum/answers/{answer_id}```
<br>
<br>
```Response status: noContent(204)```
### Sample Body
```
{
  "body": "Lorem ipsum odor amet, consectetuer adipiscing elit. s. ligula."
}
```
**<span style="color:red">Notes:</span>**
* None of the above fields can be null. Must provide each one.
* "body" is limited to 65535 characters
##  Delete Forum Answer
``` Endpoint: DELETE /v1/forum/answers/{answer_id}```
<br>
<br>
```Response status: noContent(204)```

## Vote or Un-Vote Forum Answer
``` Endpoint: PUT /v1/forum/answers/{answer_id}/vote```
<br>
<br>
```Response status: ok(200)```
### Sample Body
```
{
  "voteType":"DOWNVOTE"
}
```
### Sample Return Body
```
{
  "voteChange": -1
}
```
**<span style="color:red">Notes:</span>**
* There are three voteType
  * UPVOTE
  * DOWNVOTE
  * UNVOTE (Removes existing vote)
* "voteChange" specifies the amount of change you should see in the voteCount
## GET Forum Answers by QuestionId
```
Endpoints: GET
    registered users: /v1/forum/answers
    anonymous users: /v1/anonymous/forum/answers
```
```Response status: ok(200)```
<br><br>
``` Query params: questionId=1 (required)```
<br>
``` Query params: parentId=2```
<br>
``` Query params: sortType=TIME```
<br>
``` Query params: sortDirection=ASC```
<br><br>
**<span style="color:red">Notes:</span>**
* "questionId" is required but parentId can be omitted. If parentId is omitted, you will get the direct answers. And If you provide a valid parentId, then you will get the replies to the parent
* Remember you can't put null in parentId, if you want to get root answers you must omit parentId.
* sortType can have two values ```TIME or VOTES```. By default, TIME will be selected. You can sort based on creation time or votes by using this parameter.
* sortDirection can have two values ```ASC or DESC```. By default, DESC is selected.
* If sortType and sortDirection is omitted, the result will be sorted in descending order of creation time.

### Response Body.content
```
[
  {
    "id": 10,
    "body": "Very good Reply to 8",
    "parentId": 8,
    "voteByUser": null,
    "author": "Dr. QQW Ahmed",
    "authorId": 4,
    "authorProfilePicture": null,
    "voteCount": 1,
    "createdAt": "2024-08-17T07:56:27",
    "numberOfReplies": 1
  }
]
```
**<span style="color:red">Notes:</span>**
* If "voteByUser" is null that means the current user hasn't voted for this blog. If it is one 1 then, the user has up-voted and if -1, then down-voted
* "numberOfReplies" says the number of reply this particular answer had.
