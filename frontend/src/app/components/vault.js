'use client'

import { useRef, useState } from "react"
import { createWorker } from 'tesseract.js';
import { FileUploader } from "react-drag-drop-files"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { toast } from "sonner"
import Image from "next/image"
import { CircularProgress } from "@mui/material"

export function PastPrescriptionPage() {
    const fileTypes = ["JPEG", "PNG", "JPG"];
    const [answerDialog, setAnswerDialog] = useState(true);
    const workerRef = useRef(null);
    const [imagePath, setImagePath] = useState(null);
    const [image, setImage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [answers, setAnswer] = useState([
        //answers
        "random answer",
        "random answer",
        "random answer",
        "random answer",
    ]);
    const questions = [
        //questions
    ]

    const genAI = new GoogleGenerativeAI("AIzaSyBvcy9QAT7bHEv9OUUrm4n45jUrYlPKilY")

    const handleFileChange = (file) => {
        if (!file) return;
        setImagePath(URL.createObjectURL(file));
        setImage(file);
    }

    const getAnswers = async () => {
        const question = document.getElementById('question').value;
        const passage = document.getElementById('extracted-text').value;
        setAnswer(null);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([`
          Context: ${passage}

          Question: 
          ${questions.join('\n')}
          Please Give only the answers sepeated by a new line dont include any other text`]);
        console.log(result.response.text());
        setAnswer(answers);
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
            document.getElementById('extracted-text').value = text;
        });
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-row justify-between items-center flex-grow mt-5">
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
                <div className="flex flex-col w-1/2 h-full items-center">
                    <h1 className="text-xl font-semibold">Extracted Text</h1>
                    <div className="relative w-full p-5">
                        <textarea id='extracted-text' className='w-full min-h-96 bg-gray-100 rounded-md border-gray-500 shadow-inner flex flex-row items-center justify-center p-5' />
                        {Number(uploadProgress) === 100 &&
                            <>
                                <span className="  text-green-500 p-1 rounded-md">Text Extracted.</span>
                                <button className="bg-purple-400 text-black px-4 py-1 rounded-md">Get Answers</button>
                            </>
                        }
                        {Number(uploadProgress) > 0 && Number(uploadProgress) < 100 &&
                            <div className="absolute inset-0 flex justify-center items-center">
                                <CircularProgress size={100} color="success" variant="determinate" value={uploadProgress} />
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-5 mt-5 items-center bg-gray-100 w-11/12 rounded-md">
                <h1 className="text-xl font-semibold">Findings</h1>
                <div className="flex flex-col gap-5">
                    {questions.map((question, index) => (
                        <div className="flex flex-row gap-5 items-center">
                            <input id={`question-${index}`} className="w-full bg-gray-100 rounded-md p-2" />
                            <button className="bg-purple-400 text-black px-4 py-1 rounded-md" onClick={getAnswers}>Get Answers</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}