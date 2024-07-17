'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import { AppointmentsPage } from "@/app/components/AppointmentsPage"
import { locationOnline, roles } from "@/utils/constants"
import { use, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { createWorker } from 'tesseract.js';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { HardDriveUploadIcon, LoaderCircle, Minus, Pencil, Plus } from "lucide-react"
import { ChambersPage } from "@/app/components/ChambersPage"
import { useGeolocated } from "react-geolocated"
import { cellToLatLng } from "h3-js"
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
                <EditUSerDetailsPage />
            </ScrollableContainer>
        </div>
    )
}


// {
//     "fullName": "Sadatul",
//     "weight": 55,
//     "height": 25,
//     "cancerHistory": "N",
//     "cancerRelatives": [],
//     "lastPeriodDate": "2000-07-08",
//     "avgCycleLength": 5,
//     "periodIrregularities": [],
//     "allergies": ["Peanut"],
//     "organsWithChronicCondition": ["Heart", "Throat", "Lung"],
//     "medications": [{"name": "Napa Extra", "doseDescription": "3 times a day"},
//                     {"name": "Napa Extend", "doseDescription": "3 times a day"}]
// }

const getFeetFromCm = (cm) => {
    return Math.floor(cm / 30.48)
}

const getInchFromCm = (cm) => {
    const feet = getFeetFromCm(cm)
    return Math.floor((cm - (feet * 30.48)) / 2.54)
}

function EditUSerDetailsPage() {
    const role = roles.patient
    const { register, handleSubmit, formState: { errors }, watch, getValues, trigger, setValue } = useForm();
    const cancerHistory = watch('cancerHistory');
    const [position, setPosition] = useState(null)
    const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
            watchLocationPermissionChange: true,
        });
    const dummyData = {
        "fullName": "Sadatul",
        "weight": 55,
        "height": 25,
        "cancerHistory": "N",
        "cancerRelatives": ["mama", "kaka"],
        "lastPeriodDate": "2000-07-08",
        "avgCycleLength": 5,
        "periodIrregularities": [],
        "allergies": ["Peanut"],
        "organsWithChronicCondition": ["Heart", "Throat", "Lung"],
        "medications": [{ "name": "Napa Extra", "doseDescription": "3 times a day" },
        { "name": "Napa Extend", "doseDescription": "3 times a day" }]
    }
    const [cancerRelatives, setCancerRelatives] = useState(dummyData.cancerRelatives)
    const userDataRef = useRef({
        fullName: "Sadatul",
        weight: 55,
        height: 50,
        heightFeet: getFeetFromCm(50),
        heightInch: getInchFromCm(50),
        cancerHistory: "N",
        cancerRelatives: [],
        lastPeriodDate: "2000-07-08",
        avgCycleLength: 5,
        periodIrregularities: [],
        allergies: ["Peanut"],
        "location": "h3 hash",
        organsWithChronicCondition: ["Heart", "Throat", "Lung"],
        medications: [{ name: "Napa Extra", doseDescription: "3 times a day" }, { name: "Napa Extend", doseDescription: "3 times a day" }]
    })
    const [date, setDate] = useState(userDataRef.current?.lastPeriodDate ? new Date(userDataRef.current?.lastPeriodDate) : null);
    const [diagnosisDate, setDiagnosisDate] = useState(userDataRef.current?.diagnosisDate ? new Date(userDataRef.current?.diagnosisDate) : null);
    const [periodIrregularities, setPeriodIrregularities] = useState(userDataRef.current?.periodIrregularities || []);
    const [allergies, setAllergies] = useState(userDataRef.current?.allergies || []);
    const [organsWithChronicCondition, setOrgansWithChronicCondition] = useState(userDataRef.current?.organsWithChronicCondition || []);
    const [medications, setMedications] = useState(userDataRef.current?.medications || []);
    const isInitialised = useRef(false);

    if (!isInitialised.current) {
        register("lastPeriodDate", { required: "Last Period Date is required" });
        if (role === roles.patient) register("diagnosisDate", { required: "Diagnosis Date is required" });
        if (userDataRef.current?.lastPeriodDate) {
            setValue("lastPeriodDate", userDataRef.current?.lastPeriodDate)
            trigger("lastPeriodDate")
        }
        if (userDataRef.current?.diagnosisDate) {
            setValue("diagnosisDate", userDataRef.current?.diagnosisDate)
            trigger("diagnosisDate")
        }
        isInitialised.current = true;
    }
    const getCurrentYear = () => new Date().getFullYear();
    const generateOptions = (start, end) => {
        const options = [];
        for (let i = start; i <= end; i++) {
            options.push(
                <option key={i} value={i}>
                    {i}
                </option>
            );
        }
        return options;
    };

    const onSubmit = (data) => {
        console.log(data)
    }

    return (
        <div className="flex flex-col w-full gap-3 items-center p-7">
            <h1 className="text-2xl font-bold text-black">Update User Details</h1>
            <div className="flex flex-col w-11/12 bg-gray-100 rounded-md mt-5 gap-3 py-3 items-center">
                <div className="flex flex-row justify-between px-5 items-center w-full">
                    <label className="text-md font-semibold m-2">Full Name
                        <div className="w-full flex flex-col">
                            <input defaultValue={userDataRef.current?.fullName} type="text" className="border-2 rounded-md p-1 mt-2 border-blue-500" {...register("fullName", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                            {errors.fullName && <span className="text-red-500">{errors.fullName?.message}</span>}
                        </div>
                    </label>
                    <label className="text-md font-semibold m-2 ">Weight(kg)
                        <div className="w-full flex flex-col">
                            <input defaultValue={userDataRef.current?.weight} type="number" className="number-input border-2 rounded-md p-1 mt-2 border-blue-500" min={10} {...register("weight", { required: "Weigh is required", max: { value: 1000, message: "Maximum weight 1000kg" }, min: { value: 10, message: "Minimum weight 10" } })} />
                            {errors.weight && <span className="text-red-500  text-sm">{errors.weight?.message}</span>}
                        </div>
                    </label>
                    <label className="text-md font-semibold m-2 text-center">
                        Height
                        <div className="flex gap-4 mt-2">
                            <div>
                                <select defaultValue={userDataRef.current?.heightFeet || "feet"} {...register("heightFeet", { required: 'Day is required', validate: value => value != "feet" || 'Please select a feet' })} className="p-2 border rounded-lg w-20 bg-white border-blue-500">
                                    <option value="feet" disabled >
                                        Feet
                                    </option>
                                    {generateOptions(1, 10)}
                                </select>
                                {errors.heightFeet && <p className="text-red-500 text-sm">{errors.heightFeet?.message}</p>}
                            </div>
                            <div>
                                <select defaultValue={userDataRef.current?.heightInch || "inch"} {...register("heightInch", { required: 'Month is required', validate: value => value != "inch" || 'Please select a inch' })} className="p-2 w-20 border rounded-lg bg-white border-blue-500">
                                    <option value="inch" disabled  >
                                        Inch
                                    </option>
                                    {generateOptions(1, 11)}
                                </select>
                                {errors.heightInch && <p className="text-red-500 text-sm">{errors.heightInch?.message}</p>}
                            </div>
                        </div>
                    </label>
                </div>

                <div className="flex justify-between w-full px-5">
                    <div>
                        <label className="text-md font-semibold m-2 text-center">Cancer History:
                            <select defaultValue={userDataRef.current?.cancerHistory || "N"} id="cancerHistory" {...register('cancerHistory', { required: "This field is required" })} className="px-2 border rounded-lg w-20 bg-white border-blue-500 ml-3">
                                <option value="N">No</option>
                                <option value="Y">Yes</option>
                            </select>
                        </label>
                        {errors.cancerHistory && <span className="text-red-500 text-sm">{errors.cancerHistory?.message}</span>}
                    </div>
                    {cancerHistory === "Y" &&
                        <div className="flex items-center">
                            <label className="text-md font-semibold m-2 text-center">Cancer Relatives:
                                <input className="border border-blue-500 rounded-md px-2" id="cancerRelatives" />
                            </label>
                            <Button
                                onClick={() => {
                                    setCancerRelatives([...cancerRelatives, document.getElementById('cancerRelatives').value])
                                    document.getElementById('cancerRelatives').value = ''
                                    toast.message("Relative added", {
                                        description: "See added relatives to see all the relatives added so far"
                                    })
                                }}
                                variant={"outline"}
                                className={cn(
                                    " h-7 mx-4 justify-start text-left font-normal",
                                )}>
                                <Plus />
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[160px] ml-3 justify-start text-left font-normal",
                                        )}
                                    >Added Relatives</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <ScrollArea className="rounded-md border h-52 min-w-64">
                                        {cancerRelatives.map((relative, index) => (
                                            <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                <span>{relative}</span>
                                                <Button
                                                    onClick={() => {
                                                        setCancerRelatives(cancerRelatives.filter((_, i) => i !== index))
                                                        toast.message("Relative removed")
                                                    }}
                                                    variant={"outline"}
                                                    className={cn(
                                                        " h-7 mx-4 justify-start text-left font-normal",
                                                    )}>
                                                    <Minus />
                                                </Button>
                                            </div>
                                        ))}
                                    </ScrollArea >
                                </PopoverContent>
                            </Popover>
                        </div>
                    }
                </div>
                <div className="flex justify-between w-full items-center px-5">
                    <div className="flex flex-col">
                        <label className="text-md m-2 font-semibold text-center" >Last Period Date:
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[160px] ml-3 justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(selectedDate) => {
                                            setDate(selectedDate)
                                            setValue("lastPeriodDate", selectedDate)
                                            trigger("lastPeriodDate")
                                        }}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1950-01-01")
                                        }
                                        initialFocus
                                        defaultValue={userDataRef.current?.lastPeriodDate}
                                    />
                                </PopoverContent>
                            </Popover>
                        </label>
                        {errors.lastPeriodDate && <span className="text-red-500 text-sm">{errors.lastPeriodDate?.message}</span>}
                    </div>

                    <div className=" w-1/3 flex flex-col items-end">
                        <label className="text-md font-semibold text-center flex flex-col items-end">Average Cycle Length (days):
                            <input defaultValue={userDataRef.current?.avgCycleLength} className=" number-input border border-blue-500 rounded-md px-2" type="number" id="avgCycleLength" min={0} {...register('avgCycleLength', { required: "This field is required", min: { value: 0, message: "Avg Cycle can not be negative" } })} />
                        </label>
                        {errors.avgCycleLength && <span className="text-red-500 text-sm">{errors.avgCycleLength?.message}</span>}
                    </div>
                </div>
                {role === "ROLE_PATIENT" &&
                    <div className="flex justify-between w-full items-center px-5">
                        <div className="flex flex-col">
                            <label className="text-md m-2 font-semibold text-center" >Diagnose Date:
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[160px] ml-3 justify-start text-left font-normal",
                                                !diagnosisDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {diagnosisDate ? format(diagnosisDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={diagnosisDate}
                                            onSelect={(selectedDate) => {
                                                setDiagnosisDate(selectedDate)
                                                setValue("diagnosisDate", selectedDate)
                                                trigger("diagnosisDate")
                                            }}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1950-01-01")
                                            }
                                            initialFocus
                                            defaultValue={userDataRef.current?.diagnosisDate}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </label>
                            {errors.diagnosisDate && <span className="text-red-500 text-sm">{errors.diagnosisDate?.message}</span>}
                        </div>

                        <div className=" w-1/3 flex flex-col items-end">
                            <label className="text-md font-semibold m-2 text-center">Current Stage:
                                <select defaultValue={userDataRef.current?.cancerStage || "cancerStage"} {...register("cancerStage", { required: 'Cancter stage is required', validate: value => value != "cancerStage" || 'Please select a stage' })} className="p-2 w-28 ml-1 border rounded-lg bg-white border-blue-500 text-sm">
                                    <option value="cancerStage" disabled  >
                                        Current Cancer Stage
                                    </option>
                                    <option value="Stage_1">Stage 1</option>
                                    <option value="Stage_2">Stage 2</option>
                                    <option value="Stage_3">Stage 3</option>
                                    <option value="Stage_4">Stage 4</option>
                                    <option value="SURVIVOR">Survivor</option>
                                </select>
                            </label>
                            {errors.avgCycleLength && <span className="text-red-500 text-sm">{errors.cancerStage?.message}</span>}
                        </div>
                    </div>
                }

                <div className="w-full px-5">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <label className="text-md font-semibold m-2 text-center">Period Irregularities:
                                <input className="border border-blue-500 rounded-md px-2 m-2" id="periodIrregularities" />
                            </label>
                            <TooltipProvider delayDuration={400}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => {
                                                if (!document.getElementById('periodIrregularities').value) return toast.error("Irregularity field is empty")
                                                setPeriodIrregularities([...periodIrregularities, document.getElementById('periodIrregularities').value])
                                                document.getElementById('periodIrregularities').value = ''
                                                toast.message("Irregularity added", {
                                                    description: "See added irregularities to see all the relatives added so far"
                                                })
                                            }}
                                            variant={"outline"}
                                            className={cn(
                                                " h-7 mx-4 justify-start text-left font-normal",
                                            )}
                                        ><AddIcon fontSize="medium" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add to irregularities list</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[160px] ml-3 justify-start text-left font-normal",
                                    )}
                                >Added Irregularities</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <ScrollArea className="rounded-md border h-52 min-w-64">
                                    {periodIrregularities.map((irregularity, index) => (
                                        <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                            <span>{irregularity}</span>
                                            <TooltipProvider delayDuration={400}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => {
                                                                setPeriodIrregularities(periodIrregularities.filter((_, i) => i !== index))
                                                                toast.message("Irregularity removed")
                                                            }}
                                                            variant={"outline"}
                                                            className={cn(
                                                                " h-7 mx-4 justify-start text-left font-normal",
                                                            )}
                                                        ><RemoveIcon sx={{ color: red[500] }} /></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Remove irregularity</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    ))}
                                </ScrollArea >
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="w-full px-5">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <label className="text-md font-semibold m-2 text-center">Allergies
                                <input className="border border-blue-500 rounded-md px-2 m-2" id="allergies" />
                            </label>
                            <TooltipProvider delayDuration={400}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => {
                                                if (!document.getElementById('allergies').value) return toast.error("Allergy field is empty")
                                                setAllergies([...allergies, document.getElementById('allergies').value])
                                                document.getElementById('allergies').value = ''
                                                toast.message("Allergy added", {
                                                    description: "See added allergies to see all the allergies added so far"
                                                })
                                            }}
                                            variant={"outline"}
                                            className={cn(
                                                " h-7 mx-4 justify-start text-left font-normal",
                                            )}
                                        ><AddIcon fontSize="medium" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add to allergy list</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[160px] ml-3 justify-start text-left font-normal",
                                    )}
                                >Added Allergies</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <ScrollArea className="rounded-md border h-52 min-w-64">
                                    {allergies.map((allergy, index) => (
                                        <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                            <span>{allergy}</span>
                                            <TooltipProvider delayDuration={400}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => {
                                                                setAllergies(allergies.filter((_, i) => i !== index))
                                                                toast.message("Allergy removed")
                                                            }}
                                                            variant={"outline"}
                                                            className={cn(
                                                                " h-7 mx-4 justify-start text-left font-normal",
                                                            )}
                                                        ><RemoveIcon sx={{ color: red[500] }} /></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Remove allergy</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    ))}
                                </ScrollArea >
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="w-full px-5">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <label className="text-md font-semibold text-center">Organs WithChronic Condition
                                <input className="border border-blue-500 rounded-md px-2 m-2" id="organsWithChronicCondition" />
                            </label>
                            <TooltipProvider delayDuration={400}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => {
                                                if (!document.getElementById('organsWithChronicCondition').value) return toast.error("Organ field is empty")
                                                setOrgansWithChronicCondition([...organsWithChronicCondition, document.getElementById('organsWithChronicCondition').value])
                                                document.getElementById('organsWithChronicCondition').value = ''
                                                toast.message("Organ added", {
                                                    description: "See added Organs to see all the Organs added so far"
                                                })
                                            }}
                                            variant={"outline"}
                                            className={cn(
                                                " h-7 mx-4 justify-start text-left font-normal",
                                            )}
                                        ><AddIcon fontSize="medium" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add to organ list</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[160px] ml-3 justify-start text-left font-normal",
                                    )}
                                >Added Organs</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <ScrollArea className="rounded-md border h-52 min-w-64">
                                    {organsWithChronicCondition.map((organ, index) => (
                                        <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                            <span>{organ}</span>
                                            <TooltipProvider delayDuration={400}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => {
                                                                setOrgansWithChronicCondition(organsWithChronicCondition.filter((_, i) => i !== index))
                                                                toast.message("Organ removed")
                                                            }}
                                                            variant={"outline"}
                                                            className={cn(
                                                                " h-7 mx-4 justify-start text-left font-normal",
                                                            )}
                                                        ><RemoveIcon sx={{ color: red[500] }} /></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Remove organ</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    ))}
                                </ScrollArea >
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="w-full px-5">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <label className="text-md font-semibold m-1 text-center gap-2" >Medicine Name
                                <input className="border border-blue-500 rounded-md px-2 ml-2" id="medicineName" />
                            </label>
                            <label className="text-md font-semibold m-1 text-center" >Dose description
                                <input className="border border-blue-500 rounded-md px-2 ml-2" id="doseDescription" />
                            </label>
                            <TooltipProvider delayDuration={400}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => {
                                                if (!document.getElementById('medicineName').value || !document.getElementById('doseDescription').value) return toast.error("Both Medication fields are required")
                                                setMedications([...medications,
                                                {
                                                    name: document.getElementById('medicineName').value,
                                                    doseDescription: document.getElementById('doseDescription').value
                                                }
                                                ])
                                                document.getElementById('medicineName').value = ''
                                                document.getElementById('doseDescription').value = ''
                                                toast.message("Medicine added", {
                                                    description: "See added Medicines to see all the Medicines added so far"
                                                })
                                            }}
                                            variant={"outline"}
                                            className={cn(
                                                " h-7 mx-4 justify-start text-left font-normal",
                                            )}
                                        ><AddIcon fontSize="medium" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add to Medications list</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
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
                                    {medications.map((medication, index) => (
                                        <div key={index} className="flex justify-between flex-wrap p-1 border-b border-gray-300 w-full">
                                            <span>{medication.name}</span>
                                            <Separator className="bg-pink-500  w-[2px] h-5 " orientation="vertical" />
                                            <ScrollableContainer style={{ display: 'flex', flexWrap: 'wrap', width: '10rem' }}>{medication.doseDescription}
                                            </ScrollableContainer>
                                            <TooltipProvider delayDuration={400}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => {
                                                                setMedications(medications.filter((_, i) => i !== index))
                                                                toast.message("Medication removed")
                                                            }}
                                                            variant={"outline"}
                                                            className={cn(
                                                                " h-7 mx-4 justify-start text-left font-normal",
                                                            )}
                                                        ><RemoveIcon sx={{ color: red[500] }} /></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Remove Medication</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    ))}
                                </ScrollArea >
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
            {!coords ? (
                <>
                    <div className="flex flex-col items-center justify-center w-full text-red-500 text-2xl font-bold">
                        **You need to enable location services to continue**
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center w-11/12 border border-gray-500 bg-gray-100 relative rounded-md p-3">
                    <h1 className="text-2xl font-bold m-2 text-black">Location</h1>
                    <span className='absolute top-16 right-5 bg-white p-2 text-lg z-10 rounded-md shadow-md'>{"Lat: " + (Math.round((position?.lat + Number.EPSILON) * 10000) / 10000) + " Lng: " + (Math.round((position?.lng + Number.EPSILON) * 10000) / 10000)}</span>
                    <MapView position={position} setPosition={setPosition} />
                </div>)
            }
        </div>
    )
}