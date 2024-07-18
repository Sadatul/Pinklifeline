'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import { AppointmentsPage } from "@/app/components/AppointmentsPage"
import { locationOnline, locationResolution, roles, updateUserDetailsUrl } from "@/utils/constants"
import { use, useEffect, useRef, useState } from "react"
import { createWorker } from 'tesseract.js';
import { cn } from "@/lib/utils"
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { HardDriveUploadIcon, LoaderCircle, Minus, Pencil, Plus } from "lucide-react"
import { ChambersPage } from "@/app/components/ChambersPage"
import { useGeolocated } from "react-geolocated"
import { cellToLatLng, latLngToCell } from "h3-js"
import MapView from "@/app/components/map"
import { LocationPage } from "@/app/components/nearByLocationPage"
import { FileUploader } from "react-drag-drop-files"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { toast } from "sonner"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { CircularProgress } from "@mui/material"
import { AlertDialog, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
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
import axios from "axios"
import { useSessionContext } from "@/app/context/sessionContext"
import Loading from "@/app/components/loading"
import { EditUserDetailsPage } from "@/app/components/editUserDetails"



export default function DashboardPage() {
    return (
        <div className="flex flex-1  overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 h-full bg-[#96394C] items-center flex flex-col p-4 mr-[2px] rounded-r-lg"
                style={{
                    background: 'linear-gradient(135deg, #FF69B4 25%, #FFB6C1 75%)', // Custom gradient
                }}>
                <h1 className="text-white text-2xl font-bold">Dashboard</h1>
                <div className="flex flex-col gap-6 flex-1 justify-center mb-10">
                    <button className="text-white hover:bg-opacity-75 hover:bg-darkPink px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Home</button>
                    <button className="text-white hover:bg-opacity-75 hover:bg-darkPink px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Profile</button>
                    <button className="text-white hover:bg-opacity-75 hover:bg-darkPink px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Reports</button>
                    <button className="text-white hover:bg-opacity-75 hover:bg-darkPink px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Appointments</button>
                    <button className="text-white hover:bg-opacity-75 hover:bg-darkPink px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Settings</button>
                    <button className="text-white hover:bg-opacity-75 hover:bg-darkPink px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Logout</button>
                </div>
            </div>
            <ScrollableContainer className="flex flex-col flex-grow overflow-y-auto over ml-[2px] rounded-l-lg">
                <LocationPage />
            </ScrollableContainer>
        </div>
    )
}


