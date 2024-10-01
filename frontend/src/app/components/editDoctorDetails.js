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
import { Calendar as CalendarIcon, Check, Edit, X } from "lucide-react"
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
import { addConsultationLocationUrl, isSubset, locationOnline, pagePaths, roles, userInfoRegUrlReq } from "@/utils/constants"
import axiosInstance from "@/utils/axiosInstance"
import { Checkbox } from "@/components/ui/checkbox"
import Loading from "./loading"
import { ChambersPage } from "./ChambersPage"
import { useSessionContext } from "../context/sessionContext"

export function EditDoctorDetailsPage({ userData, setUserData, userId }) {

    const { register, handleSubmit, watch, formState: { errors } } = useForm()


    return (
        <div className="flex flex-col w-full h-full gap-5 p-5">
            <h1 className="text-2xl font-bold">Doctor Details</h1>
            <DoctorPersonalInfo userData={userData} setUserData={setUserData} userId={userId} />
            <ChambersPage />
        </div>
    )
}

function DoctorPersonalInfo({ userData, setUserData, userId }) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const [editable, setEditable] = useState(false)
    const onSubmitData = (data) => {
        if (isSubset(data, userData)) {
            console.log("No data change")
            setEditable(false)
            return
        }
        console.log("Data submitted", data)
        toast.loading("Updating doctor details")
        axiosInstance.put(userInfoRegUrlReq(userId, roles.doctor), {
            ...data,
            qualifications: data.qualifications.split(", ")
        }).then((response) => {
            console.log("Response", response)
            setUserData({ ...userData, ...data, qualifications: data.qualifications.split(", ") })
            toast.dismiss()
            setEditable(false)
        }).catch((error) => {
            console.log("Error", error)
            toast.dismiss()
            toast.error("Doctor details update failed")
        })
    }

    return (
        <div className="flex flex-col gap-3 relative bg-purple-50 p-5 rounded-md">
            <div className="flex items-center gap-3 absolute top-5 right-5">
                {editable ? (
                    <>
                        <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => {
                            handleSubmit(onSubmitData)()
                        }} >
                            <Check size={20} />
                        </button>
                        <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => {
                            setEditable(false)
                        }} >
                            <X size={20} />
                        </button>
                    </>
                ) : (
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => {
                        setEditable(true)
                    }} >
                        <Edit size={20} />
                    </button>
                )}
            </div>
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <Separator className="bg-gray-700 h-[1.5px]" />
            {editable ? (
                <div className="flex flex-col gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-base">
                                Full Name:
                            </span>
                            <input type="text" defaultValue={userData.fullName} className="px-3 py-1 rounded border border-blue-900 shadow-inner" {...register("fullName", {
                                required: "This field is required"
                            })} />
                        </div>
                        {errors.fullName && <span className="text-red-500">{errors.fullName.message}</span>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-base">
                                Designation:
                            </span>
                            <input type="text" defaultValue={userData.designation} className="px-3 py-1 rounded border border-blue-900 shadow-inner" {...register("designation", {
                                required: "This field is required"
                            })} />
                        </div>
                        {errors.designation && <span className="text-red-500">{errors.designation.message}</span>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-base">
                                Department:
                            </span>
                            <input type="text" defaultValue={userData.department} className="px-3 py-1 rounded border border-blue-900 shadow-inner" {...register("department", {
                                required: "This field is required"
                            })} />
                        </div>
                        {errors.department && <span className="text-red-500">{errors.department.message}</span>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-base">
                                Workplace:
                            </span>
                            <input type="text" defaultValue={userData.workplace} className="px-3 py-1 rounded border border-blue-900 shadow-inner" {...register("workplace", {
                                required: "This field is required"
                            })} />
                        </div>
                        {errors.workplace && <span className="text-red-500">{errors.workplace.message}</span>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-base">
                                Contact Number:
                            </span>
                            <input type="number" defaultValue={userData.contactNumber} className="px-3 py-1 rounded border border-blue-900 shadow-inner number-input" {...register("contactNumber", {
                                required: "This field is required"
                            })} />
                        </div>
                        {errors.contactNumber && <span className="text-red-500">{errors.contactNumber.message}</span>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-base">
                                Qualifications:
                            </span>
                            <textarea defaultValue={userData.qualifications.join(", ")} className="px-3 py-1 rounded border border-blue-900 shadow-inner" {...register("qualifications", {
                                required: "This field is required"
                            })} />
                        </div>
                        <span className="text-sm text-gray-500">Separate each qualification with a comma</span>
                        {errors.qualifications && <span className="text-red-500">{errors.qualifications.message}</span>}
                    </div>
                </div>
            ) : (
                <div className="flex flex-row w-full gap-5">
                    <div className="flex flex-col flex-1 gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-gray-700 w-28"> Full Name </span>
                            <span className="text-balance">: {userData.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-gray-700 w-28"> Designation </span>
                            <span className="text-balance">: {userData.designation}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-gray-700 w-28"> Department </span>
                            <span className="text-balance">: {userData.department}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-gray-700 w-28"> Workplace </span>
                            <span className="text-balance">: {userData.workplace}</span>
                        </div>
                    </div>
                    <Separator orientation="vertical" className="w-[3px] bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 rounded-t-full rounded-b-full" />
                    <div className="flex flex-col flex-1 gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-gray-700 w-28"> Contact No. </span>
                            <span className="text-balance">: {userData.contactNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-gray-700 w-28"> Reg No. </span>
                            <span className="text-balance">: {userData.registrationNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-gray-700 w-28"> Qualifications </span>
                            <span className="text-balance">: {userData.qualifications.join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-gray-700 w-28"> Verified </span>
                            <span className="text-balance">: {userData.isVerified === "Y" ? "Yes" : "No"}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
