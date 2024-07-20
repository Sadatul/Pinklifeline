'use client'


import { useForm } from "react-hook-form"
import { Separator } from "@/components/ui/separator"
import { FileUploader } from "react-drag-drop-files"
import { useState, useEffect, useRef, use } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { useGeolocated } from "react-geolocated"
import MapView from "@/app/components/map"
import { format, set } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import AddIcon from '@mui/icons-material/Add';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import RemoveIcon from '@mui/icons-material/Remove';
import { red } from "@mui/material/colors"
import ScrollableContainer from '@/app/components/StyledScrollbar';
import { motion, AnimatePresence } from "framer-motion"
import firebase_app from "@/utils/firebaseConfig";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from "@/components/ui/progress"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useStompContext } from "../context/stompContext"
import { useRouter } from "next/navigation"
import { addConsultationLocationUrl, locationOnline, pagePaths, roles, userInfoRegUrlReq } from "@/utils/constants"
import axios from "axios"
import { Checkbox } from "@/components/ui/checkbox"
import { useSessionContext } from "@/app/context/sessionContext"
import Loading from "./loading"
import { ChambersPage } from "./ChambersPage"

export function EditDoctorDetailsPage() {
    const userDataRef = useRef(null)
    const sessionContext = useSessionContext()
    useEffect(() => {
        if (sessionContext.sessionData) {
            // axios.get()
            // get doctor details.
        }
    }, [sessionContext.sessionData])

    const saveForm = () => {
        const userData = userDataRef.current
        const loadingtoast = toast.loading("Updating infos")
        let form_data;
        form_data = {
            fullName: userData?.fullName,
            qualifications: userData?.qualifications.split(",").map((qualification) => qualification.trim()),
            workplace: userData?.workplace,
            department: userData?.department,
            designation: userData?.designation,
            contactNumber: userData?.contactNumber
        }
        axios.put(userInfoRegUrlReq(sessionContext.sessionData.userId, sessionContext.sessionData.role), form_data, {
            headers: sessionContext.sessionData.headers
        }).then((res) => {
            toast.dismiss(loadingtoast)
            toast.success("Data updated")
        }).catch((error) => {
            toast.dismiss(loadingtoast)
            toast.error("Error updating infos check internet or login credentials")
        })
    }
    if (!sessionContext.sessionData) return <Loading chose="hand" />

    return (
        <div className="flex flex-col w-full items-center h-full gap-10">
            <div className="flex flex-col w-full items-center rounded-md ">
                <h1 className="text-2xl font-bold w-1/2 m-2 text-center text-gray-800">Doctor info
                    <Separator className="w-full h-[1.5px] bg-gray-500 mb-5" />
                </h1>
                <DoctorInfoSection userDataRef={userDataRef} saveForm={saveForm} />
            </div>
            <div className="flex flex-col w-full items-center rounded-md ">
                <h1 className="text-2xl font-bold w-1/2 text-center">Consultation Location
                    <Separator className="w-full h-[1.5px] bg-gray-500 mb-5" />
                </h1>
                <ChambersPage />
            </div>
        </div>
    )
}

function DoctorInfoSection({ userDataRef, saveForm }) {
    const { register, handleSubmit, formState: { errors }, setValue, trigger, getValues } = useForm()
    const [editable, setEditable] = useState(false)

    useEffect(() => {
        register("doctorDocs", { required: "Document is required" });
    }, [register]);

    const onSubmit = (data) => {
        userDataRef.current = { ...userDataRef.current, ...data }
        saveForm()
        setEditable(false)
    }

    return (
        <div className="flex flex-col items-center w-10/12 h-full gap-16 bg-gray-100 p-6 relative rounded-md">
            {
                editable ? (
                    <div className="absolute top-5 right-14 gap-3">
                        <Button className=" mx-1" onClick={handleSubmit(onSubmit)}>
                            Save
                        </Button>
                        <Button variant="outline" className="mx-1" onClick={() => { setEditable(false) }}>
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button className={"absolute top-5 right-14"} onClick={() => { setEditable(true) }}>
                        Edit
                    </Button>
                )
            }
            <div className="flex flex-row justify-evenly items-center w-11/12">
                <label className="text-md font-semibold mx-2">Full Name
                    {editable ? (
                        <div className="w-full flex flex-col">
                            <input defaultValue={userDataRef.current?.fullName} type="text" className="border-2 border-blue-500 rounded-md px-2" {...register("fullName", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                            {errors.fullName && <span className="text-red-500">{errors.fullName?.message}</span>}
                        </div>
                    ) : (
                        <p className="px-2 py-1 border border-gray-400 bg-gray-50 shadow-inner rounded">{userDataRef.current?.fullName || "Empty"}</p>
                    )}
                </label>
            </div>
            <div className="flex flex-row gap-5 justify-evenly items-strech w-11/12">
                <label className="text-md font-semibold mx-2 ">Qualifications
                    {
                        editable ? (
                            <div className="w-full flex flex-col">
                                <input type="text" defaultValue={userDataRef.current?.qualifications} className="border-2 border-blue-500 rounded-md px-2" {...register("qualifications", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.qualifications && <span className="text-red-500">{errors.qualifications?.message}</span>}
                                <span className="text-sm text-gray-500">Add your qualifications separated by commas. Eg: MBBS, MD, DM</span>
                            </div>
                        ) : (
                            <p className="px-2 py-1 border border-gray-400 bg-gray-50 shadow-inner rounded">{userDataRef.current?.qualifications || "Empty"}</p>
                        )
                    }
                </label>
                <label className="text-md font-semibold mx-2 ">Work Place
                    {
                        editable ? (
                            <div className="w-full flex flex-col">
                                <input type="text" defaultValue={userDataRef.current?.workplace} className="border-2 border-blue-500 rounded-md px-2" {...register("workplace", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.workplace && <span className="text-red-500">{errors.workplace?.message}</span>}
                            </div>
                        ) : (
                            <p className="px-2 py-1 border border-gray-400 bg-gray-50 shadow-inner rounded">{userDataRef.current?.workplace || "Empty"}</p>
                        )
                    }
                </label>
            </div>
            <div className="flex flex-row justify-evenly items-strech w-11/12">
                <label className="text-md font-semibold mx-2 ">Department
                    {
                        editable ? (
                            <div className="w-full flex flex-col">
                                <input type="text" defaultValue={userDataRef.current?.department} className="border-2 border-blue-500 rounded-md px-2" {...register("department", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.department && <span className="text-red-500">{errors.department?.message}</span>}
                            </div>
                        ) : (
                            <p className="px-2 py-1 border border-gray-400 bg-gray-50 shadow-inner rounded">{userDataRef.current?.department || "Empty"}</p>
                        )
                    }
                </label>
                <label className="text-md font-semibold mx-2 ">Designation
                    {
                        editable ? (
                            <div className="w-full flex flex-col">
                                <input type="text" defaultValue={userDataRef.current?.designation} className="border-2 border-blue-500 rounded-md px-2" {...register("designation", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.designation && <span className="text-red-500">{errors.designation?.message}</span>}
                            </div>
                        ) : (
                            <p className="px-2 py-1 border border-gray-400 bg-gray-50 shadow-inner rounded">{userDataRef.current?.designation || "Empty"}</p>
                        )
                    }
                </label>
                <label className="text-md font-semibold mx-2">Contact Number
                    {
                        editable ? (
                            <div className="w-full flex flex-col">
                                <input type="tel" defaultValue={userDataRef.current?.contactNumber} className="border-2 border-blue-500 rounded-md px-2" {...register("contactNumber", {
                                    required: "This field is required", maxLength: { value: 32, message: "Max length 32" },
                                    validate: (value) => {
                                        return (value.length === 11 && /^\d+$/.test(value) && String(value).startsWith("01")) || "Invalid contact number"
                                    }
                                })} />
                                {errors.contactNumber && <span className="text-red-500">{errors.contactNumber?.message}</span>}
                                <span className="text-sm text-gray-500">Contact number for patients</span>
                            </div>
                        ) : (
                            <p className="px-2 py-1 border border-gray-400 bg-gray-50 shadow-inner rounded">{userDataRef.current?.contactNumber || "Empty"}</p>
                        )
                    }
                </label>
            </div>
        </div>

    )
}