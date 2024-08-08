'use client'

import { useRef, useState } from "react"
import { createWorker } from 'tesseract.js';
import { FileUploader } from "react-drag-drop-files"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { toast } from "sonner"
import Image from "next/image"
import { CircularProgress } from "@mui/material"
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import firebase_app from "@/utils/firebaseConfig";
import axiosInstance from "@/utils/axiosInstance";
import { addReportUrl, pagePaths } from "@/utils/constants";
import { useSessionContext } from "@/app/context/sessionContext";
import { useRouter } from "next/navigation";

export function AddPrescriptionPage() {
    const storage = getStorage(firebase_app)
    const fileTypes = ["JPEG", "PNG", "JPG"];
    const sessionContext = useSessionContext()
    const workerRef = useRef(null);
    const [imagePath, setImagePath] = useState(null);
    const [image, setImage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [pictureUploadProgress, setPictureUploadProgress] = useState(null);
    const [gettingAnswers, setGettingAnswers] = useState(false);
    const [answers, setAnswer] = useState(null);
    const [extractedText, setExtractedText] = useState(null);
    const router = useRouter()

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

    const handleFileChange = (file) => {
        if (!file) return;
        setImagePath(URL.createObjectURL(file));
        setImage(file);
    }

    const getAnswers = async () => {
        try {
            setGettingAnswers(true)
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent([
                `
Below in context there is text extracted from a prescription or medical report with tesseract ocr
Context: ${extractedText}

Question: 
What is the doctor name found in the context ?
What is the hospital or medical or diagnostic center name found in the context ?
what is the date of the prescription ?
What are the keywords found here?(Array of Organ names and disease names comma sperated)
What is the summary of the prescription? (must not exceed 1000 characters)
Please Give the answer in a json format. Here's an example answer:
{
  "doctorName": "demo doctor name",
  "hospitalName": "demo hospital name",
  "date": "demo date",
  "summary": "demo summary",
  "keywords": ["demo organ name 1", "demo disease name 1", "Demo other organ or disease names"]
 }
If you don't find answer for a field then put null. I will parse your answer through JSON.parse(). Please stick to the format don't add a single extra character. 
`
            ]);
            setGettingAnswers(false)
            console.log(result.response.text());
            console.log("Response as json", JSON.parse(result.response.text()));
            setAnswer(JSON.parse(result.response.text()));
        } catch (error) {
            setGettingAnswers(false)
            console.log("error getting answer: ", error)
        }
    }

    const handleTextExtract = async () => {
        if (!workerRef.current) {
            workerRef.current = await createWorker(['eng', 'ben'], 1,
                {
                    logger: (m) => {
                        console.log(m);
                        setUploadProgress(Number(m.progress) * 100);
                    }
                }
            );
        }
        workerRef.current.setParameters({
            tessedit_pageseg_mode: '3'
        })

        workerRef.current.recognize(imagePath).then(({ data: { text } }) => {
            setExtractedText(text)
        });
    }

    const saveDocument = async () => {
        if (!image) return;
        const filePath = `profileImages/${sessionContext.sessionData.userId}/${new Date()}/${image.name}`;
        const storageRef = ref(storage, filePath);
        const savingToast = toast.loading("Saving document")
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            },
            (error) => {
                console.log("Error uploading ", error)
                toast.dismiss(savingToast)
                toast.error("Error uploading image", {
                    description: "Please try again later",
                });
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                function parseDate(dateString) {
                    const parts = dateString.split('/');
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript
                    const year = parseInt(parts[2], 10);
                    return new Date(year, month, day);
                }
                const tempDate = parseDate(answers?.date)
                const form = {
                    ...answers,
                    date: `${tempDate.getFullYear()}-${(tempDate.getMonth() + 1) < 10 ? `0${tempDate.getMonth() + 1}` : `${tempDate.getMonth() + 1}`}-${(tempDate.getDate()) < 10 ? `0${tempDate.getDate()}` : `${tempDate.getDate()}`}`,
                    fileLink: downloadURL
                }
                axiosInstance.post(addReportUrl, form).then((res) => {
                    console.log("Response from add report", res)
                    toast.dismiss(savingToast)
                    toast.success("Report added successfully", {
                        description: "You can view the report in your vault"
                    })
                    router.push(pagePaths.dashboardPages.prescriptionVaultPage)

                }).catch((error) => {
                    toast.dismiss(savingToast)
                    toast.error("Error saving document", {
                        description: "Please try again later"
                    })
                    console.log("error saving document", error)
                })
            }
        );
    }

    return (
        <div className="flex flex-col p-4 relative">
            <div className="flex flex-row justify-between items-center flex-grow mt-5 gap-3 ">
                <div className="flex flex-col gap-5 items-center h-full text-lg font-semibold">
                    Upload Image
                    <FileUploader handleChange={handleFileChange}
                        multiple={false}
                        types={fileTypes}
                        name="file"
                        onTypeError={() => {
                            toast.error("Invalid file type", {
                                description: "Only jpg or png files are allowed",
                            })
                        }}
                    />
                    <input hidden id="file"></input>
                    {imagePath && <Image src={imagePath} alt="Prescription" width={400} height={400} />}
                </div>
                <button hidden={!image} className="bg-purple-400 text-black px-4 py-1 rounded-md" onClick={handleTextExtract}>Extract Text</button>
                <div className="flex flex-col flex-1 px-3 h-full items-center">
                    <h1 className="text-xl font-semibold">Extracted Text</h1>
                    <div className="relative w-full p-5 gap-2 flex flex-col items-center">
                        <textarea value={extractedText} id='extracted-text' className='w-full min-h-96 bg-gray-100 rounded-md border-gray-500 shadow-inner flex flex-row items-center justify-center p-5' />
                        {extractedText &&
                            <>
                                <span className="  text-green-700 p-1 rounded-md text-lg">Text Extracted.</span>
                                <button disabled={gettingAnswers || answers} className="bg-purple-400 text-black px-4 py-1 rounded-md w-40" onClick={getAnswers}>
                                    {gettingAnswers ? "Getting Answers..." : "Get Answers"}
                                </button>
                                {gettingAnswers && <Loader2 size={32} className="text-purple-500 animate-spin" />}
                            </>
                        }
                        {Number(uploadProgress) > 0 && Number(uploadProgress) < 100 &&
                            <div className="absolute inset-0 flex justify-center items-center">
                                <CircularProgress size={100} color="success" variant="determinate" value={uploadProgress} />
                            </div>
                        }
                    </div>
                    <div className="flex flex-col gap-2 items-center bg-gray-100 w-11/12 rounded-md justify-center p-3">
                        <h1 className="text-xl font-semibold">Findings</h1>
                        {!answers &&
                            <p>Click on Get answers button after extraction</p>
                        }
                        {getAnswers === true && <Loader2 size={28} className="text-purple-500 animate-spin" />}
                        {answers !== null &&
                            <div className="flex flex-col gap-2">
                                <span>Doctor name: {answers?.doctorName}</span>
                                <span>Hospital name: {answers?.hospitalName}</span>
                                <span>Date: {answers?.date}</span>
                                <span>Key words: {answers?.keywords?.join(", ")}</span>
                                <span>Summary: {answers?.summary}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
            {answers ?
                <button className="bg-pink-400 text-black px-4 py-1 rounded-md absolute top-5 right-10 hover:scale-95" onClick={() => {
                    saveDocument()
                }}>
                    Save
                </button> :
                <TooltipProvider delayDuration={400}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="bg-pink-400 text-black px-4 py-1 rounded-md absolute top-5 right-10" disabled>
                                Save
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Save only after you got the findings
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            }
        </div>
    )
}

export function PrescriptionDescriptionComponent({ report}){
    
}