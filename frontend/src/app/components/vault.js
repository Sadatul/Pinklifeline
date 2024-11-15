'use client'

import makeAnimated from 'react-select/animated';
import { useEffect, useRef, useState } from "react"
import { createWorker } from 'tesseract.js';
import { FileUploader } from "react-drag-drop-files"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { toast } from "sonner"
import Image from "next/image"
import { CircularProgress } from "@mui/material"
import { ArrowLeft, ArrowRight, Calendar, Check, ChevronDown, ChevronUp, Loader2, LoaderCircle, MoveRight, Pencil, Share2, Trash2, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import firebase_app from "@/utils/firebaseConfig";
import axiosInstance from "@/utils/axiosInstance";
import { addReportUrl, capitalizeFirstLetter, getDoctorsUrl, getImageDimensions, getReportByIdUrl, getSharedReportByIdUrl, pagePaths, shareReportUrl, updateReportUrl } from "@/utils/constants";
import { useSessionContext } from "@/app/context/sessionContext";
import { useRouter } from "next/navigation";
import CreatableSelect from 'react-select/creatable'
import { cn } from "@/lib/utils";
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Loading from './loading';
import { debounce } from 'lodash';
import { Switch } from '@/components/ui/switch';

export function AddPrescriptionPage() {
    const storage = getStorage(firebase_app)
    const fileTypes = ["JPEG", "PNG", "JPG"];
    const sessionContext = useSessionContext()
    const workerRef = useRef(null);
    const [imagePath, setImagePath] = useState(null);
    const [image, setImage] = useState(null);
    const [gettingAnswers, setGettingAnswers] = useState(false);
    const [answers, setAnswer] = useState(null);
    const router = useRouter()
    const [verified, setVerified] = useState(false)

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

    const handleFileChange = (file) => {
        if (!file) return;
        setImagePath(URL.createObjectURL(file));
        setImage(file);
    }

    const getAnswers = async (text) => {
        try {
            setGettingAnswers(true)
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent([
                `
Below in context there is text extracted from a prescription or medical report with tesseract ocr
Context: ${text}

Question: 
What is the doctor name found in the context ? (character limit 255)
What is the hospital or medical or diagnostic center name found in the context ? (character limit 255)
what is the date of the prescription ? (must be in format yyyy-MM-dd)
What are the keywords found here?(Array of Organ names, disease names , test names etc. Each element must not exceed 255 characters)
What is the summary of the prescription? (must not exceed 1000 characters)
Please Give the answer in a json format. Here's an example answer:
{
  "doctorName": "demo doctor name",
  "hospitalName": "demo hospital name",
  "date": "demo date"(must be in format yyyy-MM-dd),
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
        try {
            setGettingAnswers(true)
            if (document.getElementById("extract-text-button")) {
                document.getElementById("extract-text-button").disabled = true
            }
            if (!workerRef.current) {
                workerRef.current = await createWorker(['eng', 'ben'], 1,
                    {
                        logger: (m) => {
                            console.log(m);
                        }
                    }
                );
            }
            workerRef.current.setParameters({
                tessedit_pageseg_mode: '3'
            })

            workerRef.current.recognize(imagePath).then(({ data: { text } }) => {
                getAnswers(text)
            });
            if (document.getElementById("extract-text-button")) {
                document.getElementById("extract-text-button").disabled = false
            }
        } catch (error) {
            setGettingAnswers(false)
            if (document.getElementById("extract-text-button")) {
                document.getElementById("extract-text-button").disabled = false
            }
        }
    }

    const saveDocument = async () => {
        if (!image) return;
        const filePath = `profileImages/${sessionContext?.sessionData.userId}/${new Date()}/${image.name}`;
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
                    // date format yyyy-MM-dd
                    const dateParts = dateString.split("-");
                    // month is 0-based, that's why we need dataParts[1] - 1
                    return new Date(+dateParts[0], dateParts[1] - 1, +dateParts[2]); // month is 0-based
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

    useEffect(() => {
        if (sessionContext?.sessionData) {
            console.log("Session data", sessionContext?.sessionData)
            if (!(Number(sessionContext?.sessionData.subscribed) > 0)) {
                // router.push(pagePaths.dashboardPages.userdetailsPage)
                window.location.href = pagePaths.dashboardPages.userdetailsPage
            }
            else {
                setVerified(true)
            }
        }
    }, [sessionContext?.sessionData])

    if (!verified) return null

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
                <button hidden={!image} disabled={gettingAnswers} id='extract-text-button' className="bg-pink-500 text-black px-2 py-1 rounded-md border border-gray-500 shadow-inner" onClick={handleTextExtract}>
                    <MoveRight size={40} className='' />
                </button>
                <div className="flex flex-col flex-1 px-3 h-full items-center">
                    <div className="flex flex-col gap-2 items-center bg-gray-100 px-7 rounded-md justify-center py-3 translate-y-10">
                        <h1 className="text-xl font-semibold">Findings</h1>
                        {!answers &&
                            <p>Click on Get answers button after extraction</p>
                        }
                        {gettingAnswers === true && <Loader2 size={28} className="text-purple-500 animate-spin" />}
                        {answers !== null && !gettingAnswers &&
                            <div className="flex flex-col gap-2">
                                <div className='flex items-center gap-2'>
                                    <span className='w-40'>Doctor name: </span>
                                    <input value={answers?.doctorName} className="border border-gray-700 rounded-md p-1 w-72" onChange={(e) => {
                                        setAnswer((prev) => ({ ...prev, doctorName: e.target.value }))
                                    }} />
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='w-40'>Hospital name: </span>
                                    <input value={answers?.hospitalName} className="border border-gray-700 rounded-md p-1 w-72" onChange={(e) => {
                                        setAnswer((prev) => ({ ...prev, hospitalName: e.target.value }))
                                    }} />
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='w-40'>Date: </span>
                                    <input value={answers?.date} type="date" className="border border-gray-700 rounded-md p-1 w-72" onChange={(e) => {
                                        setAnswer((prev) => ({ ...prev, date: e.target.value }))
                                    }} />
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='w-40'>Key words:</span>
                                    <input value={answers?.keywords?.join(", ")} className='border border-gray-700 rounded-md p-1 w-72' onChange={(e) => {
                                        setAnswer((prev) => ({ ...prev, keywords: e.target.value.split(",").map(word => word.trim()) }))
                                    }} />
                                </div>
                                <div className='flex items-start gap-2'>
                                    <span className='w-40'>Summary:</span>
                                    <textarea value={answers?.summary} className='border border-gray-700 rounded-md p-1 w-72 h-64 break-normal' onChange={(e) => {
                                        setAnswer((prev) => ({ ...prev, summary: e.target.value }))
                                    }} />
                                </div>
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
export function PrescriptionDescriptionComponent({ report, setReport, setFetchAgain }) {
    const [imageDimension, setImageDimension] = useState(null)
    const [editable, setEditable] = useState(false)
    const [defaultOptions, setDefaultOptions] = useState(report.keywords.map((keyword) => ({ label: capitalizeFirstLetter(keyword), value: keyword })))
    const [selectedOptions, setSelectedOptions] = useState(defaultOptions)
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [showShareinfo, setShowShareInfo] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const animatedComponents = makeAnimated();
    const [doctorOptions, setDoctorOptions] = useState([])
    const [loadingDoctorsOptions, setLoadingDoctorsOptions] = useState(false)
    const [selectedDoctorId, setSelectedDoctorId] = useState(null)
    const [forceDelete, setForceDelete] = useState(false)

    const loadDoctorOptions = debounce((searchText) => {
        setLoadingDoctorsOptions(true)
        axiosInstance.get(getDoctorsUrl, {
            params: {
                fullName: searchText
            }
        }).then(res => {
            setDoctorOptions(res.data?.content?.map((doctor) => ({ name: doctor.fullName, value: doctor.id, workplace: doctor.workplace })))
        }).catch(error => {
            console.log("Error fetching doctors", error)
        }).finally(() => {
            setLoadingDoctorsOptions(false)
        })
    }, 500)

    useEffect(() => {
        const fetchImageDimensions = async () => {
            try {
                const { width, height } = await getImageDimensions(report.fileLink);
                setImageDimension({ width, height });
            } catch (error) {
                console.error("Error fetching image dimensions:", error);
            }
        };
        fetchImageDimensions();
    }, [report.fileLink])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleUpdateReport = () => {
        const doctorName = document.getElementById("reportDoctorName").value
        const hospitalName = document.getElementById("reportHospitalName").value
        const date = document.getElementById("reportDate").value
        const summary = document.getElementById("reportSummary").value
        const fileLink = report.fileLink
        const form = {
            "doctorName": doctorName,
            "hospitalName": hospitalName,
            "date": date,
            "summary": summary,
            "fileLink": fileLink,
            "keywords": selectedOptions.map((option) => option.value)
        }
        toast.loading("Updating report")
        console.log("Updating report", form)
        setEditable(false)
        axiosInstance.put(updateReportUrl(report.id), form).then((res) => {
            setReport({ ...report, ...form })
            console.log("Report updated", res)
            toast.dismiss()
        }).catch((error) => {
            console.log("Error updating report", error)
            toast.dismiss()
            toast.error("Error updating report", {
                description: "Please try again later"
            })
        })
    }

    const handleShareReport = () => {
        if (!selectedDoctorId) {
            document.getElementById("error").innerText = "Must fill doctor id field"
            return
        }
        else {
            toast.loading("Sharing report")
            document.getElementById("error").innerText = ""
            const form = {
                "reportId": report.id,
                "doctorId": selectedDoctorId,
                "period": Number(document.getElementById("reportSharePeriod").value) > 0 ? document.getElementById("reportSharePeriod").value : null
            }
            axiosInstance.post(shareReportUrl, form).then((res) => {
                setShareDialogOpen(false)
                setFetchAgain(true)
                toast.dismiss()
            }).catch((error) => {
                console.log("Error sharing report", error)
                toast.dismiss()
                toast.error("Error sharing report", {
                    description: "Please try again later"
                })
            })
        }
    }


    if (!isMounted) return <Loading />

    return (
        <div className="flex flex-col gap-5 p-2 w-full">
            <h1 className="text-2xl font-semibold mt-5 flex items-center gap-4">
                <Link href={pagePaths.dashboardPages.prescriptionVaultPage}>
                    <ArrowLeft size={28} className="text-blue-500 cursor-pointer hover:scale-95" />
                </Link>
                Prescription/Report</h1>
            <div className="flex flex-col gap-7 w-full bg-blue-50 rounded-md p-2">
                <div className="flex flex-col gap-4 w-full relative">
                    <div className="flex flex-row justify-between items-center gap-2 absolute top-5 right-10">
                        {editable ?
                            <>
                                <button className="bg-green-400 text-white px-4 py-1 rounded-md flex items-center hover:scale-95" onClick={() => { handleUpdateReport() }}>
                                    <Check size={24} />
                                </button>
                                <button className="bg-red-400 text-white px-4 py-1 rounded-md flex items-center hover:scale-95" onClick={() => { setEditable(false) }}>
                                    <X size={24} />
                                </button>
                            </>
                            :
                            <>
                                <button className={cn("text-white px-4 py-1 rounded-md flex items-center bg-gray-600 hover:scale-95")} onClick={() => {
                                    setEditable(true)
                                }}>
                                    <Pencil size={24} />
                                </button>
                                <Dialog open={shareDialogOpen} onOpenChange={(e) => { setShareDialogOpen(e) }}>
                                    <DialogTrigger asChild>
                                        <button className={cn("text-gray-100 px-4 py-1 rounded-md flex items-center bg-gray-700 hover:scale-95")} >
                                            <Share2 size={24} />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>Share Report</DialogTitle>
                                            <DialogDescription>
                                                Are your sure you want to share this report with others?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex flex-col gap-2 ">
                                            <div className="flex text-lg font-semibold gap-2">
                                                <span className='w-40'>Doctor</span>
                                                <div className='relative flex-1'>
                                                    <input id='reportShareDoctorId' type="text" className="number-input rounded border border-gray-700 px-2 py-1 w-full" onChange={(e) => {
                                                        if (e.target.value.length > 0) {
                                                            setSelectedDoctorId(undefined)
                                                            loadDoctorOptions(e.target.value.trim())
                                                        }
                                                        else {
                                                            setSelectedDoctorId(null)
                                                        }
                                                    }} />
                                                    {(selectedDoctorId === undefined) && <div className='flex flex-col absolute top-full left-0 w-full bg-white rounded-b-md border border-gray-700 z-10'>
                                                        {loadingDoctorsOptions && <span className="text-center">Loading...</span>}
                                                        {doctorOptions.length === 0 && !loadingDoctorsOptions && <span className="text-center">No doctors found</span>}
                                                        {doctorOptions.map((doctor, index) => (
                                                            <button key={index} className="flex flex-col gap-1 p-1 border-b border-gray-700 hover:bg-gray-100" onClick={() => {
                                                                setSelectedDoctorId(doctor.value)
                                                                document.getElementById("reportShareDoctorId").value = doctor.name
                                                            }}>
                                                                <span className='text-sm font-normal'>{doctor.name}</span>
                                                                <span className="text-xs font-normal">{doctor.workplace}</span>
                                                            </button>
                                                        ))}
                                                    </div>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex text-lg font-semibold gap-2 items-center">
                                                    <span className='w-40'>{"Period(Hours)"}:</span>
                                                    <input id="reportSharePeriod" type="number" className="number-input rounded border border-gray-700 px-2 py-1 w-32" min={0} defaultValue={0} />
                                                    <div className='flex flex-col items-center gap-1 translate-y-1'>
                                                        <Switch defaultChecked={false} onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                document.getElementById("reportSharePeriod").value = 0
                                                                document.getElementById("reportSharePeriod").disabled = true
                                                            }
                                                            else {
                                                                document.getElementById("reportSharePeriod").value = ""
                                                                document.getElementById("reportSharePeriod").disabled = false
                                                            }
                                                        }} />
                                                        <span className="text-sm">
                                                            Share indefinitely
                                                        </span>
                                                    </div>
                                                </div>
                                                <span id="error" className="text-red-500"></span>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button className=" hover:scale-95" onClick={() => {
                                                handleShareReport()
                                            }}>
                                                Share
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        }
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="bg-red-700 px-4 py-1 rounded-md text-white hover:scale-95">
                                    <Trash2 size={24} />
                                </button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Report</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this report?
                                    </DialogDescription>
                                </DialogHeader>
                                {report.shareInfo.length > 0 && (
                                    <div className='flex flex-col gap-2'>
                                        <span className='text-lg text-red-600'>
                                            This report is shared with others. It&apos;s recommended to revoke the share before deleting the report
                                        </span>
                                        <div className='flex flex-row gap-2 items-center'>
                                            <span className='text-lg'>
                                                Force delete
                                            </span>
                                            <input type="checkbox" id="forceDelete" className=' size-5 bg-red-400' onChange={(e) => {
                                                console.log("Force delete", e.target.checked)
                                                setForceDelete(e.target.checked)
                                            }} />
                                        </div>
                                    </div>
                                )}
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button id="delete-button" disabled={!(report.shareInfo.length === 0 || forceDelete)} className={cn("bg-red-700 hover:scale-95")} onClick={() => {
                                            toast.loading("Deleting report")
                                            axiosInstance.delete(getReportByIdUrl(report.id), {
                                                params: {
                                                    force: forceDelete
                                                }
                                            }).then((res) => {
                                                console.log("Report deleted", res)
                                                window.location.href = pagePaths.dashboardPages.prescriptionVaultPage
                                                toast.dismiss()
                                            }).catch((error) => {
                                                console.log("Error deleting report", error)
                                                toast.dismiss()
                                                toast.error("Error deleting report", {
                                                    description: "Please try again later"
                                                })
                                            })
                                        }}>
                                            Delete
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {editable ? (
                        <div className="flex flex-col gap-4 w-10/12">
                            <h2 className="text-xl font-semibold">Edit Report details</h2>
                            <div className="flex flex-col gap-2 w-11/12">
                                <div className="flex text-lg font-semibold gap-2">
                                    Doctor Name:
                                    <input defaultValue={report.doctorName} id="reportDoctorName" type="text" className="border border-blue-800 shadow-inner p-1 flex-1 rounded-md" />
                                </div>
                                <div className="flex text-lg font-semibold gap-2">
                                    Hospital Name:
                                    <input defaultValue={report.hospitalName} id="reportHospitalName" type="text" className="border border-blue-800 shadow-inner p-1 flex-1 rounded-md" />
                                </div>
                                <div className="flex text-lg font-semibold gap-2">
                                    Date:
                                    <input defaultValue={report.date} id="reportDate" type="date" className="border border-blue-800 rounded-md px-2 py-1" />
                                </div>
                                <div className="flex text-lg font-semibold gap-2 w-full">
                                    Keywords:
                                    <div className="flex-1">
                                        <CreatableSelect
                                            isMulti={true}
                                            defaultValue={defaultOptions}
                                            value={selectedOptions}
                                            closeMenuOnSelect={false}
                                            components={animatedComponents}
                                            options={defaultOptions}
                                            onCreateOption={(keyword) => {
                                                setDefaultOptions([...defaultOptions, { label: capitalizeFirstLetter(keyword), value: keyword }])
                                                setSelectedOptions([...selectedOptions, { label: capitalizeFirstLetter(keyword), value: keyword }])
                                            }}
                                            onChange={(selectedOptions) => {
                                                setSelectedOptions(selectedOptions)
                                            }}
                                            className="flex-1"
                                        />
                                        <span className="text-sm">
                                            Write new keyword to add new keyword to the list
                                        </span>
                                    </div>
                                </div>
                                <div className="flex text-lg font-semibold gap-1 w-full">
                                    Summary:
                                    <textarea id="reportSummary" type="text" defaultValue={report.summary} className="flex-1 min-h-80 p-3 rounded shadow-inner" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 break-all text-wrap">
                            <h2 className="text-xl font-semibold">Details</h2>
                            <Separator className="w-1/3 h-[1.5px] bg-gray-400" />
                            <div className="flex flex-col gap-2">
                                <span className="text-lg flex gap-1 items-center">Doctor Name: {report.doctorName}</span>
                                <span className="text-lg flex gap-1 items-center">Hospital Name: {report.hospitalName}</span>
                                <span className="text-lg flex gap-1 items-center">Keywords: {report.keywords.join(", ")}</span>
                                <span className="text-lg flex gap-1 items-center"> <Calendar size={24} /> {report.date}</span>
                                <span className="text-xl font-semibold mt-2" >Summary</span>
                                <Separator className="w-1/3 h-[1.5px] bg-gray-400" />
                                <pre className="text-lg flex-col gap-1 items-center break-normal text-wrap">{report.summary}</pre>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => { setShowShareInfo(prev => !prev) }} className="flex items-center w-44 hover:scale-95">
                        See Share info {showShareinfo ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                    {!showShareinfo && <Separator className="w-28 h-[1.5px] bg-gray-400" />}
                    <div className={`transition-[max-height] duration-500 ease-in-out overflow-hidden w-2/3 bg-white rounded ${showShareinfo ? 'max-h-full p-3' : 'max-h-0 px-3'}`}>
                        {report.shareInfo.length === 0 && <span className="text-lg">No share info available</span>}
                        {report.shareInfo.map((shareInfo, index) => (
                            <div key={index} className="flex flex-col relative">
                                <div className="flex flex-col gap-2">
                                    <span className="text-lg flex gap-1 items-center">Shared with: {shareInfo.fullName}</span>
                                    <span className="text-lg flex gap-1 items-center">Shared till: {shareInfo.expirationTime || "Infinite time"}</span>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="bg-red-600 hover:scale-95 text-white px-4 py-1 rounded-md absolute top-2 right-2" >
                                            Revoke
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Revoke Report</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to revoke this report&apos;s access?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button className="bg-red-700 hover:scale-95" onClick={() => {
                                                    toast.loading("Revoking access")
                                                    axiosInstance.delete(getSharedReportByIdUrl(shareInfo.id)).then((res) => {
                                                        console.log("Report shared revoked", res)
                                                        toast.dismiss()
                                                        setReport((prev) => {
                                                            const newShareInfo = prev.shareInfo.filter((share) => share.id !== shareInfo.id)
                                                            return { ...prev, shareInfo: newShareInfo }
                                                        })
                                                    }).catch((error) => {
                                                        console.log("Error revoking share", error)
                                                        toast.dismiss()
                                                        toast.error("Error revoking share", {
                                                            description: "Please try again later"
                                                        })
                                                    })
                                                }}>
                                                    Revoke
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                {(report.shareInfo.length - 1) !== index && <Separator className="w-full h-[1.5px] bg-gray-400" />}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2 items-center">
                    <h3 className="text-2xl font-semibold">Prescription/Report Image</h3>
                    {imageDimension ?
                        <Image src={report.fileLink} alt="Prescription" width={imageDimension.width} height={imageDimension.height} className=" border-4 border-purple-200" />
                        :
                        <LoaderCircle size={44} className="text-purple-500 animate-spin" />
                    }
                </div>
            </div>
        </div>
    )
}