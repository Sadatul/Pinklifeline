'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { LoaderCircle, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { Client } from '@stomp/stompjs';
import { Separator } from "@/components/ui/separator"
import { generatePDF, getImage } from "@/utils/generatePdf"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSessionContext } from "@/app/context/sessionContext"
import { addReportUrl, convertCmtoFeetInch, convertFtIncToCm, generateFormattedDate, joinVideoCall, livePrescriptionSendUrl, livePrescriptionSubscribe, livePrescriptionSubscribeErrors, locationOnline, roles, stompBrokerUrl } from "@/utils/constants"
import { useParams } from "next/navigation"
import axiosInstance from "@/utils/axiosInstance"
import Loading from "./loading"
import { debounce } from "lodash"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import firebase_app from "@/utils/firebaseConfig"


export function DoctorLivePrescriptionPage() {
    const [medications, setMedications] = useState([]);
    const [tests, setTests] = useState([]);
    const [analysis, setAnalysis] = useState();
    const socketRef = useRef(null)
    const sessionContext = useSessionContext()
    const initialized = useRef(false)
    const [prescriptionData, setPrescriptionData] = useState(null)
    const [height, setHeight] = useState({
        feet: 0,
        inch: 0
    })


    useEffect(() => {
        if (sessionContext.sessionData && !initialized.current) {
            axiosInstance.get(joinVideoCall).then((res) => {
                setAnalysis(res?.data?.prescription?.analysis)
                setMedications(res?.data?.prescription?.medications)
                setTests(res?.data?.prescription?.tests)
                setPrescriptionData(res?.data)
                initialized.current = true
            }).catch((error) => {
                console.log("error fetching prescription data ", error)
                toast.error("Error connecting.")
            })
        }
    }, [sessionContext.sessionData])

    useEffect(() => {
        if (sessionContext.sessionData && !socketRef.current && initialized.current) {
            socketRef.current = new Client({
                brokerURL: stompBrokerUrl,
                debug: function (str) {
                    console.log(str)
                },
                reconnectDelay: 0,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            })
            socketRef.current.onConnect = (frame) => {
                socketRef.current.subscribe(livePrescriptionSubscribe(sessionContext.sessionData.userId), (response) => {
                    console.log(response)
                    const message = JSON.parse(response.body)
                    console.log('Received message')
                    console.log(message)
                })
                socketRef.current.subscribe(livePrescriptionSubscribeErrors(sessionContext.sessionData.userId), (error) => {
                    console.log(error)
                    console.log(JSON.parse(error.body))
                })
            }
            socketRef.current.onStompError = (frame) => {
                console.log('Broker reported error: ' + frame.headers['message'])
                console.log('Additional details: ' + frame.body)
            }
            socketRef.current.activate()
        }

        return () => {
            socketRef.current?.deactivate()
            console.log('Disconnected')
        }
    }, [sessionContext.sessionData, initialized.current])


    const sendPrescription = useCallback(debounce((message) => {
        console.log('Sending message', message)
        socketRef.current?.publish({
            destination: livePrescriptionSendUrl,
            body: JSON.stringify(message),
        });
    }, 500), [socketRef.current])

    useEffect(() => {
        setHeight({
            feet: Math.floor(Number(prescriptionData?.prescription.height) / 30.48),
            inch: Math.round((Number(prescriptionData?.prescription.height) - Math.floor(Number(prescriptionData?.prescription.height) / 30.48) * 30.48) / 2.54)
        })

        const updatePatient = () => {
            const messgaeObject = {
                "receiverId": prescriptionData.prescription.patientId,
                "callId": prescriptionData.callId,
                "analysis": prescriptionData.prescription.analysis,
                weight: prescriptionData.prescription.weight,
                height: prescriptionData.prescription.height,
                "medications": prescriptionData.prescription.medications,
                "tests": prescriptionData.prescription.tests
            }
            sendPrescription(messgaeObject)
        }
        if (prescriptionData && socketRef.current) {
            updatePatient()
        }
    }, [prescriptionData, sendPrescription])

    if (!prescriptionData) return <Loading chose="hand" />

    return (
        <div className="flex flex-col items-center w-full gap-10">
            <h1 className="text-2xl font-semibold mt-5 mb-5">Live Prescription</h1>
            <h1 className="text-xl font-semibold">Patient Details</h1>
            <Separator className="h-[1.5px] w-1/2" />
            <div className="flex flex-row justify-center gap-24  w-4/5">
                <div className="flex flex-col justify-evenly">
                    <h1 className="text-lg font-semibold">Name: {prescriptionData?.prescription.patientName}</h1>
                    <h1 className="text-lg font-semibold">Age: {prescriptionData?.prescription.age} yrs</h1>
                </div>
                <div className="flex flex-col justify-between">
                    <div className="text-md font-semibold m-2">Height:
                        <input type="number" min={0} value={height.feet} className="border number-input border-blue-500 rounded-md px-2 m-2 w-16" id="heightFeet" onChange={(e) => {
                            console.log("height ", e.target.value)
                            setPrescriptionData({
                                ...prescriptionData,
                                prescription: {
                                    ...prescriptionData.prescription,
                                    height: convertFtIncToCm(e.target.value, document.getElementById('heightCm')?.value || 0)
                                }
                            })
                        }} />
                        ft
                        <input type="number" min={0} value={height.inch} className="border number-input border-blue-500 rounded-md px-2 m-2 w-16" id="heightCm" onChange={(e) => {
                            console.log("height ", e.target.value)
                            setPrescriptionData({
                                ...prescriptionData,
                                prescription: {
                                    ...prescriptionData.prescription,
                                    height: convertFtIncToCm(document.getElementById('heightFeet')?.value || 0, e.target.value)
                                }
                            })
                        }} />
                        inch
                    </div>
                    <div className="text-md font-semibold m-2">Weight:
                        <input value={prescriptionData?.prescription.weight} className="border border-blue-500 rounded-md px-2 m-2 w-20" id="weight" onChange={(e) => {
                            setPrescriptionData({
                                ...prescriptionData,
                                prescription: {
                                    ...prescriptionData.prescription,
                                    weight: e.target.value
                                }
                            })
                        }} /> kg
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between w-2/3">
                <div className="flex items-center w-full">
                    <label className="text-md font-semibold m-2 text-center flex items-center w-full">Analysis:
                        <textarea value={prescriptionData?.prescription.analysis} onChange={(e) => {
                            setPrescriptionData({
                                ...prescriptionData,
                                prescription: {
                                    ...prescriptionData.prescription,
                                    analysis: e.target.value
                                }
                            })
                        }}
                            className="border border-blue-500 rounded-md px-2 m-2 flex-1" id="analysis" />
                    </label>
                </div>
            </div>
            <div className="flex flex-row items-center justify-start w-2/3">
                <div className="flex items-center w-full">
                    <label className="text-md font-semibold m-2 text-center flex items-center flex-1">Tests:
                        <textarea className="border border-blue-500 rounded-md px-2 m-2 flex-1" id="tests" />
                    </label>
                    <Button
                        onClick={() => {
                            if (!document.getElementById('tests').value) return toast.error("Irregularity field is empty")
                            setPrescriptionData({
                                ...prescriptionData,
                                prescription: {
                                    ...prescriptionData.prescription,
                                    tests: [...prescriptionData.prescription.tests, document.getElementById('tests').value]
                                }
                            })
                            document.getElementById('tests').value = ''
                        }}
                        variant={"outline"}
                        className={cn(
                            " h-7 mx-4 justify-start text-left font-normal",
                        )}>
                        <Plus className="text-gray-700" size={28} />
                    </Button>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[160px] ml-3 justify-start text-left font-normal",
                            )}>
                            Added Tests
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <ScrollArea className="rounded-md border h-52 min-w-64">
                            {prescriptionData.prescription.tests.map((irregularity, index) => (
                                <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                    <span>{irregularity}</span>
                                    <Button
                                        onClick={() => {
                                            setTests([...tests, document.getElementById('tests').value])
                                                (tests.filter((_, i) => i !== index))
                                            toast.message("Irregularity removed")
                                            setPrescriptionData({
                                                ...prescriptionData,
                                                prescription: {
                                                    ...prescriptionData.prescription,
                                                    tests: [...prescriptionData.prescription.tests.filter((_, i) => i !== index)]
                                                }
                                            })
                                        }}
                                        variant={"outline"}
                                        className={cn(
                                            " h-7 mx-4 justify-start text-left font-normal",
                                        )}>
                                        <Minus className="text-red-500" size={28} />
                                    </Button>
                                </div>
                            ))}
                        </ScrollArea >
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center justify-between w-9/12 mb-5">
                <div className="flex items-center w-full gap-2">
                    <label className="text-md font-semibold m-1 text-center flex-1" >Medicine Name
                        <textarea className="border border-blue-500 rounded-md px-2 w-full" id="medicineName" autoComplete='off' />
                    </label>
                    <label className="text-md font-semibold m-1 text-center flex-1" >Dose description
                        <textarea className="border border-blue-500 rounded-md px-2 w-full" id="doseDescription" />
                    </label>
                    <Button
                        onClick={() => {
                            if (!document.getElementById('medicineName').value || !document.getElementById('doseDescription').value) return toast.error("Both Medication fields are required")
                            setMedications([...medications,
                            {
                                name: document.getElementById('medicineName').value,
                                doseDescription: document.getElementById('doseDescription').value
                            }
                            ])
                            setPrescriptionData({
                                ...prescriptionData,
                                prescription: {
                                    ...prescriptionData.prescription,
                                    medications: [...prescriptionData.prescription.medications,
                                    {
                                        name: document.getElementById('medicineName').value,
                                        doseDescription: document.getElementById('doseDescription').value
                                    }]
                                }
                            })
                            document.getElementById('medicineName').value = ''
                            document.getElementById('doseDescription').value = ''
                        }}
                        variant={"outline"}
                        className={cn(
                            " h-7 mx-4 justify-start text-left font-normal",
                        )}>
                        <Plus className="text-gray-700" size={28} />
                    </Button>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[160px] justify-start text-left font-normal",
                            )}
                        >Added Medications</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <ScrollArea className="rounded-md border h-52 min-w-96">
                            {prescriptionData.prescription.medications.map((medication, index) => (
                                <div key={index} className="flex justify-between flex-wrap p-1 border-b border-gray-300 w-full">
                                    <span>{medication.name}</span>
                                    <Separator className="bg-pink-500  w-[2px] h-5 " orientation="vertical" />
                                    <ScrollableContainer style={{ display: 'flex', flexWrap: 'wrap', width: '10rem' }}>{medication.doseDescription}
                                    </ScrollableContainer>

                                    <Button
                                        onClick={() => {
                                            setMedications(medications.filter((_, i) => i !== index))
                                            toast.message("Medication removed")
                                        }}
                                        variant={"outline"}
                                        className={cn(
                                            " h-7 mx-4 justify-start text-left font-normal",
                                        )}>
                                        <Minus className="text-red-500" size={28} />
                                    </Button>
                                </div>
                            ))}
                        </ScrollArea >
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

export function PatientLivePrescriptionPage() {
    const params = useParams()
    const storage = getStorage(firebase_app)
    const [dataState, setDataState] = useState("FOUND")
    const [isPaidUser, setIsPaidUser] = useState(true)
    const [loading, setLoading] = useState(false)
    const [medications, setMedications] = useState([]);
    const [tests, setTests] = useState([]);
    const [analysis, setAnalysis] = useState();
    const socketRef = useRef(null)
    const sessionContext = useSessionContext()
    const initialized = useRef(false)
    const callId = useRef(null)
    const [loadingRportAdd, setLoadingReportAdd] = useState(false)
    const [prescriptionData, setPrescriptionData] = useState({
        "callId": "2417210933683308291",
        "prescription": {
            "id": 1,
            "patientId": 2,
            "patientName": "Sadatul",
            "doctorId": 3,
            "doctorName": "Dr. Rahima Begum",
            "date": "2024-08-03",
            "age": 23,
            "analysis": "Roma 1",
            "weight": 58.0,
            "height": 25.0,
            "medications": [
                {
                    "name": "Sapa",
                    "doseDescription": "Bala"
                },
                {
                    "name": "napa",
                    "doseDescription": "BaKumla"
                }
            ],
            "tests": [
                "Name",
                "Name",
                "Nani"
            ],
        }
    })

    useEffect(() => {
        if (sessionContext.sessionData) {
            axiosInstance.get(joinVideoCall).then((res) => {
                setPrescriptionData(res?.data)
                initialized.current = true
            }).catch((error) => {
                console.log("error fetching prescription data ", error)
                toast.error("Error connecting.")
                if (error.response?.status === 404) {
                    setDataState("NOT_FOUND")
                }
            })
        }
    }, [sessionContext.sessionData])

    useEffect(() => {
        if (sessionContext.sessionData && !socketRef.current && initialized.current) {
            socketRef.current = new Client({
                brokerURL: stompBrokerUrl,
                debug: function (str) {
                    console.log(str)
                },
                reconnectDelay: 0,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            })
            socketRef.current.onConnect = (frame) => {
                socketRef.current.subscribe(livePrescriptionSubscribe(sessionContext.sessionData.userId), (response) => {
                    console.log(response)
                    const message = JSON.parse(response.body)
                    console.log('Received message')
                    console.log(message)
                    if (sessionContext.sessionData.userId === message.receiverId && callId.current === message.callId) {
                        setPrescriptionData(prev => ({
                            ...prev,
                            prescription: {
                                ...prev.prescription,
                                analysis: message.analysis,
                                medications: message.medications,
                                tests: message.tests,
                                weight: message.weight,
                                height: message.height
                            }
                        }))
                    }
                    else {
                        console.log("Mismatch callId or recieverId. Refresh with correct credential")
                        console.log("user id: ", sessionContext.sessionData.userId, " reciever id", message.receiverId, " callId user", callId.current, " call id message", message.callId)
                    }
                })
                socketRef.current.subscribe(livePrescriptionSubscribeErrors(sessionContext.sessionData.userId), (error) => {
                    console.log(error)
                    console.log(JSON.parse(error.body))
                })
            }
            socketRef.current.onStompError = (frame) => {
                console.log('Broker reported error: ' + frame.headers['message'])
                console.log('Additional details: ' + frame.body)
            }
            socketRef.current.activate()
        }

        return () => {
            socketRef.current?.deactivate()
            console.log('Disconnected')
        }
    }, [sessionContext.sessionData, initialized.current])

    const addReportToVault = async () => {
        try {
            const imageDataUrl = await getImage('prescriptionSection'); // Get image data URL
            const byteCharacters = atob(imageDataUrl.split(',')[1]); // Decode the base64 string
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            // Define storage reference
            const storageRef = ref(storage, `reports/${sessionContext.sessionData.userId}/${prescriptionData.prescription.id}.png`);
            const metadata = {
                contentType: 'image/png',
              };
            // Start the upload task with blob data
            const uploadTask = uploadBytesResumable(storageRef, byteArray, metadata);

            // Monitor upload progress
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error("Error uploading image", error);
                    toast.error("Error uploading image", {
                        description: "Please try again later",
                    });
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('File available at', downloadURL);
                    toast.success("Image uploaded successfully");
                    const prescriptionSummary = `
Prescription Summary:
---------------------
Prescription ID: ${prescriptionData.prescription.id}
Date: ${prescriptionData.prescription.date}

Patient Information:
- Name: ${prescriptionData.prescription.patientName}
- ID: ${prescriptionData.prescription.patientId}
- Age: ${prescriptionData.prescription.age}
- Weight: ${prescriptionData.prescription.weight} kg
- Height: ${prescriptionData.prescription.height} cm

Doctor Information:
- Name: ${prescriptionData.prescription.doctorName}
- ID: ${prescriptionData.prescription.doctorId}

Analysis: ${prescriptionData.prescription.analysis}

Medications:
${prescriptionData.prescription.medications.map(med => `- ${med.name}: ${med.doseDescription}`).join('\n')}

Tests Ordered:
${prescriptionData.prescription.tests.join(', ')}
`;
                    const reportData = {
                        "doctorName": "Dr. Morshad Hossain",
                        "hospitalName": locationOnline,
                        "date": generateFormattedDate(new Date()),
                        "summary": prescriptionSummary,
                        "fileLink": downloadURL,
                        "keywords": [...medications.map(med => med.name), ...tests]
                    }
                    console.log("report data ", reportData.fileLink)
                    axiosInstance.post(addReportUrl, reportData).then((res) => {
                        toast.success("Report added to vault successfully")
                    }).catch((error) => {
                        console.log("error adding report to vault ", error)
                        toast.error("Error adding report to vault")
                    })
                }
            );
        } catch (error) {
            console.error("Error uploading image", error);
            toast.error("Error uploading image", {
                description: "Please try again later",
            });
        }
    };


    const handleGeneratePDF = () => {
        generatePDF('prescriptionSection');
    };

    if (sessionContext.sessionData?.role === roles.doctor) return <h1 className="font-bold text-3xl text-black w-full text-center mt-10">You are not authorized to view this page.</h1>

    if (prescriptionData === null) return <Loading chose="hand" />

    if (dataState === "NOT_FOUND") return <h1 className="font-bold text-3xl text-black w-full text-center mt-10">Prescription not found. No meeting may not be running right now.</h1>

    return (
        <div className="flex flex-col items-center gap-5 relative w-full p-3">
            <h1 className="text-2xl font-semibold text-center w-full">Live Prescription</h1>
            <div className="w-4/5 gap-6 flex flex-col bg-blue-50 p-2">
                <div className="flex flex-row fixed top-16 right-7 gap-5 items-center z-10 ">
                    <button disabled={loading} className="bg-purple-400 hover:scale-90 transition ease-in-out duration-200 text-black px-4 py-1 rounded-md" onClick={() => {
                        setLoading(true);
                        handleGeneratePDF();
                        setLoading(false);
                    }}>
                        {loading ? <LoaderCircle size={28} className="text-white animate-spin" /> : "Generate PDF"}
                    </button>
                    {isPaidUser &&
                        <button disabled={loadingRportAdd} className="bg-pink-400 hover:scale-90 transition ease-in-out duration-200 text-black px-4 py-1 rounded-md" onClick={() => {
                            setLoadingReportAdd(true);
                            addReportToVault();
                            setLoadingReportAdd(false);
                        }}>
                            {loading ? <LoaderCircle size={28} className="text-white animate-spin" /> : "Add to Vault"}
                        </button>
                    }

                </div>
                <div id="prescriptionSection" className="flex flex-col flex-1 items-center gap-5 w-full p-5">
                    <h1 className="text-2xl font-semibold">
                        {prescriptionData.prescription.doctorName.startsWith("Dr.") ? prescriptionData?.prescription?.doctorName : `Dr. ${prescriptionData?.prescription?.doctorName}`}
                    </h1>
                    <h1 className="text-xl font-semibold">Patient Details</h1>
                    <Separator className="h-[1.5px] w-1/2" />
                    <div className="flex flex-row justify-center gap-24  w-4/5">
                        <div className="flex flex-col ">
                            <h1 className="text-lg font-semibold">Name: {prescriptionData?.prescription.patientName}</h1>
                            <h1 className="text-lg font-semibold">Age: {prescriptionData?.prescription.age} yrs</h1>
                        </div>
                        <div className="flex flex-col ">
                            <h1 className="text-lg font-semibold">Height: {convertCmtoFeetInch(prescriptionData?.prescription.height)}</h1>
                            <h1 className="text-lg font-semibold">Weight: {prescriptionData?.prescription.weight} kg</h1>
                        </div>
                    </div>
                    <div className="w-full flex flex-col items-center gap-2">
                        <h2 className="w-full text-center text-2xl text-black font-semibold">
                            Analysis
                        </h2>
                        <Separator className="h-[1.5px] w-1/2" />
                        <p className="px-6 py-4 text-xl text-black break-words whitespace-normal font-semibold w-full text-left">
                            {prescriptionData?.prescription.analysis}
                        </p>
                    </div>
                    <div className="flex flex-col w-full items-center">
                        <h1 className="text-2xl font-semibold mb-5">Medications</h1>
                        <table className="min-w-full border-collapse border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-lg text-black font-semibold uppercase tracking-wider border border-gray-300">Name</th>
                                    <th className="px-3 py-2 text-left text-lg text-black font-semibold uppercase tracking-wider border border-gray-300">Description</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {prescriptionData?.prescription.medications.map((medication, index) => (
                                    <tr key={index}>
                                        <td className="px-3 pt-3 pb-7 items-center whitespace-normal break-words text-lg font-semibold text-black border border-gray-300">{medication.name}</td>
                                        <td className="px-3 pt-3 pb-7 items-center whitespace-normal break-words text-lg font-semibold text-black border border-gray-300">{medication.doseDescription}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Separator className="h-[1.5px] w-1/2" />
                    <div className="w-full flex flex-col items-center gap-4 mb-10">
                        <h2 className="w-full text-center text-2xl text-black font-semibold">
                            Tests
                        </h2>
                        <Separator className="h-[1.5px] w-1/2" />
                        <ol className="flex flex-col w-full items-center gap-2 px-5" style={{
                            listStyleType: 'radio'
                        }}>
                            {prescriptionData?.prescription.tests.map((test, index) => (
                                <li key={index} className="text-xl text-black break-words whitespace-normal font-semibold w-full text-left">
                                    {test}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}