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
import axiosInstance from "@/utils/axiosInstance"
import { Checkbox } from "@/components/ui/checkbox"
import { useSessionContext } from "@/app/context/sessionContext"
import Loading from "./loading"
import { ChambersPage } from "./ChambersPage"

export function EditDoctorDetailsPage({ userData, setUserData }) {
    const [editedData, setEditedData] = useState(userData)
    const [editable, setEditable] = useState(false)
    const { register, handleSubmit, watch, formState: { errors } } = useForm()

    return (
        <div className="flex flex-col w-full h-full gap-5">
            <h1 className="text-2xl font-bold">Edit Doctor Details</h1>
            <div className="flex flex-col gap-3 relative">
                <h2 className="text-lg font-semibold">Basic Information</h2>
                <Separator className="bg-gray-700 h-[1.5px]" />
                {editable ? (
                    <div className="flex flex-col gap-3">
                        <div>
                            <div className="flex items-center gap-2">Full Name:
                                <input type="text" defaultValue={editedData.fullName} className="px-3 py-1 rounded border border-blue-900 shadow-inner" {...register("fullName", {
                                    required: "This field is required"
                                })} />
                            </div>
                            {errors.fullName && <span className="text-red-500">{errors.fullName.message}</span>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">Designation:
                                <input type="text" defaultValue={editedData.designation} className="px-3 py-1 rounded border border-blue-900 shadow-inner" {...register("designation", {
                                    required: "This field is required"
                                })} />
                            </div>
                            {errors.designation && <span className="text-red-500">{errors.designation.message}</span>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">Department:
                                <input type="text" defaultValue={editedData.department} className="px-3 py-1 rounded border border-blue-900 shadow-inner" {...register("department", {
                                    required: "This field is required"
                                })} />
                            </div>
                            {errors.department && <span className="text-red-500">{errors.department.message}</span>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">Workplace:
                                <input type="text" defaultValue={editedData.workplace} className="px-3 py-1 rounded border border-blue-900 shadow-inner" {...register("workplace", {
                                    required: "This field is required"
                                })} />
                            </div>
                            {errors.workplace && <span className="text-red-500">{errors.workplace.message}</span>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">Contact Number:
                                <input type="number" defaultValue={editedData.contactNumber} className="px-3 py-1 rounded border border-blue-900 shadow-inner number-input" {...register("contactNumber", {
                                    required: "This field is required"
                                })} />
                            </div>
                            {errors.contactNumber && <span className="text-red-500">{errors.contactNumber.message}</span>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">Qualifications:
                                <textarea defaultValue={editedData.qualifications.join(", ")} className="px-3 py-1 rounded border border-blue-900 shadow-inner" {...register("qualifications", {
                                    required: "This field is required"
                                })} />
                            </div>
                            <span className="text-sm text-gray-500">Separate each qualification with a comma</span>
                            {errors.qualifications && <span className="text-red-500">{errors.qualifications.message}</span>}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <span className="flex items-center gap-2">Full Name: {editedData.fullName}</span>
                        <span className="flex items-center gap-2">Designation: {editedData.designation}</span>
                        <span className="flex items-center gap-2">Department: {editedData.department}</span>
                        <span className="flex items-center gap-2">Workplace: {editedData.workplace}</span>
                        <span className="flex items-center gap-2">Contact Number: {editedData.contactNumber}</span>
                        <span className="flex items-center gap-2">Qualifications: {editedData.qualifications.join(", ")}</span>
                        <span className="flex items-center gap-2">Registration Number: {editedData.registrationNumber}</span>
                        <span className="flex items-center gap-2">Verified: {editedData.isVerified === "Y" ? "Yes" : "No"}</span>
                    </div>
                )}
            </div>
        </div>
    )
}