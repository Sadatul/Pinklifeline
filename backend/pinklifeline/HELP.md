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
