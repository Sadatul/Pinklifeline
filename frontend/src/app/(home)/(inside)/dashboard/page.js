'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import { locationOnline, locationResolution, roles, updateUserDetailsUrl } from "@/utils/constants"
import { use, useEffect, useRef, useState } from "react"
import { createWorker } from 'tesseract.js';
import { cn } from "@/lib/utils"
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Cross, HardDriveUploadIcon, LoaderCircle, Minus, Pencil, Plus, X } from "lucide-react"
import { useGeolocated } from "react-geolocated"
import { cellToLatLng, latLngToCell } from "h3-js"
import MapView from "@/app/components/map"
import { FileUploader } from "react-drag-drop-files"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { toast } from "sonner"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { CircularProgress } from "@mui/material"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AlertDialogContent } from "@radix-ui/react-alert-dialog"
import { Separator } from "@/components/ui/separator"
import { generatePDF } from "@/utils/generatePdf"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useForm } from "react-hook-form"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { red } from "@mui/material/colors"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import axiosInstance from "@/utils/axiosInstance"
import { useSessionContext } from "@/app/context/sessionContext"
import Loading from "@/app/components/loading"
import { EditUserDetailsPage } from "@/app/components/editUserDetails"
import { ChambersPage } from "@/app/components/ChambersPage"
import { AppointmentsPage } from "@/app/components/AppointmentsPage"
import { LocationPage } from "@/app/components/nearByLocationPage"
import { PastPrescriptionPage } from "@/app/components/vault";
import { DoctorLivePrescriptionPage } from "@/app/components/livePrescription";
import { EditDoctorDetailsPage } from "@/app/components/editDoctorDetails";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import firebase_app from "@/utils/firebaseConfig";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import React from "react";
import { useRouter } from "next/navigation";



export default function Page(){
    const router = useRouter()
    router.push("/dashboard/appointments")
    return <></>
}

function BlogWritePage() {
    const [sections, setSections] = useState([])
    const [values, setValues] = useState([])
    const [title, setTitle] = useState("")
    const countRef = useRef(0)
    const [currentTab, setCurrentTab] = useState(0)

    useEffect(() => {
        console.log("Values changed")
        console.log(values)
    }, [values])

    return (
        <div className="flex flex-col w-full justify-evenly items-center gap-3 p-5 relative">
            <div className="flex flex-row p-2 gap-2 absolute top-3 right-3">
                <button disabled={currentTab === 0} className={cn("bg-black text-white px-2 py-1 mx-1", currentTab === 0 && "bg-opacity-50")}
                    onClick={() => {
                        setCurrentTab(0)
                        console.log(values)
                    }}>
                    Edit
                </button>
                <button disabled={currentTab === 1} className={cn("bg-black text-white px-2 py-1 mx-1", currentTab === 1 && "bg-opacity-50")}
                    onClick={() => {
                        let tempValues = values
                        for (let i = 0; i < values.length; i = i + 1) {
                            if (sections[i].type === "IMAGE") {
                                tempValues[i].elementValue = document.getElementById(sections[i].id)?.innerText
                                tempValues[i].size = Number(document.getElementById(`image-size-${sections[i].id}`)?.value)
                            }
                            else {
                                tempValues[i].size = document.getElementById(`text-size-${sections[i].id}`)?.value
                                tempValues[i].elementValue = document.getElementById(sections[i].id)?.value
                            }
                        }
                        console.log(tempValues)
                        setValues([...tempValues])
                        setTitle(document.getElementById("blog-title")?.value)
                        setCurrentTab(1)
                    }}>
                    Preview
                </button>
            </div>
            {
                currentTab === 0 ?
                    <EditSection sections={sections} setSections={setSections} values={values} setValues={setValues} countRef={countRef} title={title} />
                    :
                    <PreviewSection values={values} title={title} />
            }

        </div>
    )
}

function PreviewSection({ values, title }) {
    return (
        <div className="flex flex-col items-center w-full gap-3 p-5">
            <h1 className="text-lg font-bold"> Preview </h1>
            <h1 className="text-2xl font-bold w-full text-center"> {title} </h1>
            {
                values?.map((value, index) => {
                    return (
                        <div key={index} className="flex flex-col p-3 rounded w-full">
                            {((value.type === "TEXT") && value.elementValue) ? (
                                <p className={cn("w-full p-1", value.size)}>{value?.elementValue}</p>
                            ) : (
                                <>
                                    {value.elementValue && <Image src={value.elementValue} width={Number(value.size) || 250} objectFit='scale-down' height={Number(value.size) || 250} alt="Preview" className="rounded-lg" />}
                                </>
                            )}
                        </div>
                    )
                })
            }
        </div>
    )
}

function EditSection({ sections, setSections, values, setValues, countRef, title }) {

    return (
        <div className="flex flex-col relative w-full rounded-md mt-10 p-4">
            <label className="m-3 w-full flex flex-row gap-3 items-center"> Title:
                <input id="blog-title" type="text" defaultValue={title} className="border rounded border-blue-800 px-2 py-1 flex-1" />
            </label>
            <div className="flex flex-col gap-5">
                {
                    sections?.map((section, index) => {
                        return (
                            <div key={index} className="w-full">
                                {React.createElement(section.element, {
                                    id: section.id,
                                    values: values
                                })}
                            </div>
                        )
                    })
                }
            </div>
            <div className=" flex flex-row justify-evenly items-center w-full mt-4">
                <button className=" border border-black bg-gray-100"
                    onClick={() => {
                        setSections([
                            ...sections,
                            {
                                id: countRef.current,
                                element: TextSection,
                                type: "TEXT"
                            }
                        ])
                        setValues([
                            ...values,
                            {
                                id: countRef.current,
                                elementValue: "",
                                type: "TEXT",
                                size: "text-base"
                            }
                        ])
                        countRef.current = countRef.current + 1
                    }}>
                    Add Text Section</button>
                <button className=" border border-black bg-gray-100"
                    onClick={() => {
                        setSections([
                            ...sections,
                            {
                                id: countRef.current,
                                element: ImageSection,
                                type: "IMAGE",
                                size: 250
                            }
                        ])
                        setValues([
                            ...values,
                            {
                                id: countRef.current,
                                elementValue: null,
                                type: "IMAGE",
                                size: 250
                            }
                        ])
                        countRef.current = countRef.current + 1
                    }}>
                    Add Image Section</button>
                <button className=" border border-black bg-gray-100" onClick={() => console.log(values)}> Check</button>
            </div>
        </div >
    )
}

function TextSection({ id, values }) {
    const [fontSize, setFontSize] = useState("text-base")
    const getValue = (valueId) => {
        console.log("In get value: ", values)
        for (const value of values) {
            if (value.id === valueId) {
                return value
            }
        }
        return null
    }
    const defaultValue = getValue(id)
    console.log("Default value: ", defaultValue)
    return (
        <div className="flex flex-row w-full justify-between p-2 border border-gray-600 gap-2">
            <textarea id={id} defaultValue={defaultValue?.elementValue || ""} className={cn("border border-gray-800 p-2 bg-gray-50 shadow-inner w-10/12", fontSize)} />
            <div className="flex flex-col items-end h-full gap-3 w-2/12">
                <button className="bg-gray-600 text-white w-6 rounded text-center" onClick={() => { deleteSectionById(id) }}><X /></button>
                <select id={`text-size-${id}`} defaultValue={defaultValue?.size || "text-base"} className="px-2 py-1 border border-gray-600 w-28" onChange={(value) => { setFontSize(value) }}>
                    Font-Size
                    <option value={"text-xs"}>Font-XS</option>
                    <option value={"text-sm"}>Font-SM</option>
                    <option value={"text-base"}>Font-BASE</option>
                    <option value={"text-lg"}>Font-LG</option>
                    <option value={"text-xl"}>Font-xl</option>
                </select>
            </div>
        </div>
    )
}

function ImageSection({ id, values }) {
    const getValue = (valueId) => {
        for (const value of values) {
            if (value.id === valueId) {
                return value
            }
        }
        return null
    }
    const generateOptions = (start, end, step = 1) => {
        const options = [];
        for (let i = start; i <= end; i = i + step) {
            options.push(
                <option key={i} value={i}>
                    {i}
                </option>
            );
        }
        return options;
    };
    const defaultValue = getValue(id)
    const storage = getStorage(firebase_app)
    const fileTypes = ["JPEG", "PNG", "JPG"];
    const [downloadURL, setDownloadURL] = useState(defaultValue?.elementValue || null)
    const [imagePreview, setImagePreview] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [imageUploaded, setImageUploaded] = useState(false)
    const handleFileChange = (file) => {
        if (!file) return;
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }
    const handleUpload = async () => {
        if (!imageFile) return;
        const filePath = `profileImages/${localStorage.getItem('userId') || new Date().toString()}/${imageFile.name}`;
        setImageUploaded(true)
        // const storageRef = ref(storage, filePath);
        // const uploadTask = uploadBytesResumable(storageRef, imageFile);
        // uploadTask.on(
        //     'state_changed',
        //     (snapshot) => {
        //         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //     },
        //     (error) => {
        //         toast.error("Error uploading image", {
        //             description: "Please try again later",
        //         });
        //         setImageUploaded(false)
        //     },
        //     async () => {
        //         const tempDownloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        //         setDownloadURL(tempDownloadURL)
        //         toast.dismiss(uploadingToast)
        //         toast.success("Image uploaded successfully")
        //     }
        // );
        toast.dismiss()
        toast.success("Image uploaded successfully")
        const profilePic = "https://sm.ign.com/t/ign_nordic/cover/a/avatar-gen/avatar-generations_prsz.300.jpg"
        setDownloadURL(profilePic)
    }
    return (
        <div className="flex flex-row w-full justify-between p-2 border border-gray-600 gap-2">
            {downloadURL && (
                <div className="flex flex-col justify-center items-center">
                    <div className="flex flex-col items-center m-4 p-5 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300">
                        <Image id={`image-${id}`} width={250} objectFit='scale-down' height={250} src={downloadURL} alt="Preview" className="rounded-lg" />
                    </div>
                    <p id={id}>{downloadURL}</p>
                </div>
            )}
            {!downloadURL &&
                <Dialog>
                    <DialogTrigger className="border bg-black hover:bg-opacity-75 text-white p-2 rounded-lg">
                        Add Picture
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>Add picture</DialogHeader>
                        <DialogDescription asChild>
                            <div className="flex flex-col items-center justify-evenly flex-1">
                                <div className={cn("w-96 border rounded-lg border-purple-500", imageUploaded ? "h-80" : "h-96")}>
                                    {imagePreview && (
                                        <div className="flex flex-col justify-center items-center">
                                            <div className="flex flex-col items-center m-4 p-6 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 w-full">
                                                <Image width={250} objectFit='scale-down' height={250} src={imagePreview} alt="Preview" className="rounded-lg" />
                                            </div>
                                        </div>
                                    )}
                                    {!imageUploaded &&
                                        <FileUploader handleChange={handleFileChange}
                                            multiple={false}
                                            types={fileTypes}
                                            name="file"
                                            onTypeError={() => {
                                                toast.error("Invalid file type", {
                                                    description: "Only jpg or png files are allowed",
                                                })
                                            }}
                                        />}
                                    <input hidden id="file"></input>
                                </div>
                            </div>
                        </DialogDescription>
                        <DialogFooter>
                            <DialogClose disabled={imageUploaded} onClick={() => { handleUpload() }} className="border bg-black hover:bg-opacity-75 text-white p-2 rounded-lg">
                                Upload
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            }
            <div className="flex flex-col">
                <button className="bg-gray-600 text-white w-6 rounded text-center" onClick={() => { deleteSectionById(id) }}><X /></button>
                <select id={`image-size-${id}`} defaultValue={Number(defaultValue?.size) || 300} className="px-2 py-1 border border-gray-600">
                    Image Size
                    {generateOptions(200, 500, 50)}
                </select>
            </div>
        </div>
    )
}


