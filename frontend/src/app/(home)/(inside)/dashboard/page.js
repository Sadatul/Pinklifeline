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
    useEffect(() => {
        router.push("/dashboard/appointments")
    }, [router])
    return <></>
}




