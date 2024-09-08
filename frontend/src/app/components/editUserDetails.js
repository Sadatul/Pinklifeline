'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import { convertCmtoFeetInch, convertFtIncToCm, generateFormattedDate, generateOptions, getFeetFromCm, getInchFromCm, getUserInfoUrl, locationResolution, roles, toggleLocationShare, updatePeriodDateUrl, updateUserDetailsUrl } from "@/utils/constants"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Check, Loader2, Minus, Pencil, Plus, X } from "lucide-react"
import { useGeolocated } from "react-geolocated"
import { cellToLatLng, latLngToCell } from "h3-js"
import MapView from "@/app/components/map"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
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
import { differenceInDays, format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import axiosInstance from "@/utils/axiosInstance"
import { useSessionContext } from "@/app/context/sessionContext"
import Loading from "@/app/components/loading"
import { set } from "lodash"
import EditUserMapView from "./editUserdetailsmapComponent"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const dummyData = {
    "allergies": ["Peanut"],
    "organsWithChronicCondition": ["Heart", "Throat"],
    "cancerRelatives": ["Aunt", "Samiha"],
    "fullName": "Sadatul",
    "weight": 58.0,
    "avgCycleLength": 5,
    "cancerHistory": "Y",
    "lastPeriodDate": "2000-08-08",
    "dob": "2000-08-08",
    "medications": [
        {
            "name": "Napa Extra",
            "doseDescription": "3 times a day"
        },
        {
            "name": "Napa Extra",
            "doseDescription": "3 times a day"
        }
    ],
    "periodIrregularities": ["Higher pain", "Longer than average cycles"],
    "height": 25.0,
    "cancerStage": "SURVIVOR",
    "diagnosisDate": "2020-08-03",
    "location": "sdfasdfdsfsdfjsdfjfds"
}

export function EditUserDetailsPage({ isPatient, userData, setUserData }) {
    const [editingPeriodDate, setEditingPeriodDate] = useState(false)
    const newPeriodDateRef = useRef(null)
    const sessionContext = useSessionContext()
    const [currentPosition, setCurrentPosition] = useState(null)
    const [editable, setEditable] = useState(false)
    const { register, handleSubmit, formState: { errors }, watch, getValues, trigger, setValue } = useForm();
    const cancerHistory = watch('cancerHistory');
    const [editedData, setEditedData] = useState(userData)
    const [medications, setMedications] = useState(userData?.medications || []);
    const latlng = cellToLatLng(userData?.location)
    const [position, setPosition] = useState({
        lat: latlng[0],
        lng: latlng[1]
    });
    const initializd = useRef(false)
    console.log("User Data", userData)

    useEffect(() => {
        if (sessionContext.sessionData) {
            axiosInstance.get(getUserInfoUrl(sessionContext.sessionData.userId, roles.patient)).then((response) => {
                setUserData(response.data)
                setEditedData(response.data)
                const latlng = cellToLatLng(response.data.location)
                setCurrentPosition({ lat: latlng[0], lng: latlng[1] })
            }).catch((error) => {
                console.log(error)
                toast.error("An error occured", {
                    description: error.response?.data?.message
                })
            })
        }
    }, [sessionContext.sessionData])

    useEffect(() => {
        register("lastPeriodDate", { required: "Last Period Date is required" });
        register("diagnosisDate", { required: "Diagnosis Date is required" });
    }, [])

    useEffect(() => {
        if (!initializd.current && editedData) {
            setValue("lastPeriodDate", new Date(editedData.lastPeriodDate))
            setValue("diagnosisDate", new Date(editedData.diagnosisDate))
            initializd.current = true
        }
    }, [editedData])

    const onSubmit = (data) => {
        toast.loading("Updating user details")
        let form = {
            "fullName": data.fullName,
            "weight": data.weight,
            "height": convertFtIncToCm(data.heightFeet, data.heightInch),
            "cancerHistory": data.cancerHistory,
            "cancerRelatives": editedData.cancerRelatives,
            "lastPeriodDate": generateFormattedDate(data.lastPeriodDate),
            "avgCycleLength": data.avgCycleLength,
            "periodIrregularities": editedData.periodIrregularities,
            "allergies": editedData.allergies,
            "organsWithChronicCondition": editedData.organsWithChronicCondition,
            "medications": editedData.medications
        }
        if (isPatient) {
            form.location = latLngToCell(currentPosition.lat, currentPosition.lng, locationResolution)
            form.diagnosisDate = generateFormattedDate(data.diagnosisDate)
            form.cancerStage = data.cancerStage
        }
        console.log("Form", form)
        axiosInstance.put(updateUserDetailsUrl(sessionContext.sessionData.userId, isPatient ? roles.patient : roles.basicUser), form).then((response) => {
            setUserData({ ...userData, ...form })
            setEditedData({ ...userData, ...form })
            setEditable(false)
            toast.dismiss()
            console.log("Response", response)
        }).catch((error) => {
            console.log(error)
            toast.error("An error occured", {
                description: error.response?.data?.message
            })
        })
    }

    if (!sessionContext.sessionData) return <Loading />
    return (
        <div className="flex flex-col w-full gap-7 p-7 relative break-normal">
            <div className="flex flex-row justify-between absolute top-5 right-5 gap-4">
                {editable ? (
                    <>
                        <button className="bg-green-400 text-white px-4 py-1 rounded-md flex items-center hover:scale-95" onClick={() => { handleSubmit(onSubmit)() }}>
                            <Check size={24} />
                        </button>
                        <button className="bg-red-400 text-white px-4 py-1 rounded-md flex items-center hover:scale-95" onClick={() => { setEditable(false) }}>
                            <X size={24} />
                        </button>
                    </>
                ) : (
                    <button className="bg-blue-400 text-white px-4 py-1 rounded-md flex items-center hover:scale-95" onClick={() => { setEditable(true) }}>
                        <Pencil size={24} />
                    </button>
                )}
            </div>
            <h1 className="text-2xl font-bold text-black">User Details</h1>
            <div className="flex flex-row w-full bg-gray-100 p-4 rounded-md">
                <div className="flex flex-col flex-1 gap-3">
                    <div className="text-md font-semibold">
                        {editable ?
                            <div className="flex flex-row items-center gap-2">Full Name
                                <input defaultValue={editedData.fullName} type="text" className="border-2 rounded-md p-1 border-blue-500" {...register("fullName", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.fullName && <span className="text-red-500">{errors.fullName?.message}</span>}
                            </div>
                            :
                            <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                <span className="w-32">
                                    Name
                                </span>
                                <span>
                                    : {userData.fullName}
                                </span>
                            </div>
                        }
                    </div>
                    <div className="text-md font-semibold ">
                        {editable ?
                            <div className="flex flex-row items-center gap-1">Weight(kg)
                                <input defaultValue={userData.weight} type="number" className="number-input border-2 rounded-md p-1 border-blue-500 w-20" min={10} {...register("weight", { required: "Weigh is required", max: { value: 1000, message: "Maximum weight 1000kg" }, min: { value: 10, message: "Minimum weight 10" } })} />
                                {errors.weight && <span className="text-red-500  text-sm">{errors.weight?.message}</span>}
                            </div>
                            :
                            <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                <span className="w-32">
                                    Weight
                                </span>
                                <span>
                                    : {userData.weight} kg
                                </span>
                            </div>
                        }
                    </div>
                    <div className="text-md font-semibold">
                        {editable ?
                            <div className="flex flex-row items-center gap-1">Height
                                <div>
                                    <select defaultValue={getFeetFromCm(editedData?.height)} {...register("heightFeet", { required: 'Day is required', validate: value => value != "feet" || 'Please select a feet' })} className="p-2 border rounded-lg w-20 bg-white border-blue-500">
                                        <option value="feet" disabled >
                                            Feet
                                        </option>
                                        {generateOptions(0, 10)}
                                    </select>
                                    {errors.heightFeet && <p className="text-red-500 text-sm">{errors.heightFeet?.message}</p>}
                                </div>
                                <div>
                                    <select defaultValue={getInchFromCm(editedData.height)} {...register("heightInch", { required: 'Month is required', validate: value => value != "inch" || 'Please select a inch' })} className="p-2 w-20 border rounded-lg bg-white border-blue-500">
                                        <option value="inch" disabled  >
                                            Inch
                                        </option>
                                        {generateOptions(1, 11)}
                                    </select>
                                    {errors.heightInch && <p className="text-red-500 text-sm">{errors.heightInch?.message}</p>}
                                </div>
                            </div>
                            :
                            <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                <span className="w-32">
                                    Height
                                </span>
                                <span>
                                    : {convertCmtoFeetInch(userData.height)}
                                </span>
                            </div>
                        }
                    </div>
                    {!editable &&
                        <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-32">
                                Birth Date
                            </span>
                            <span>
                                : {userData.dob}
                            </span>
                        </div>
                    }
                    {editable ?
                        <div className="flex flex-row gap-7">
                            <div className="text-md font-semibold flex gap-2 items-center" >Last Period Date:
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[160px] justify-start text-left font-normal",
                                                !editedData.lastPeriodDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="h-4 w-4" />
                                            {editedData.lastPeriodDate ? format(editedData.lastPeriodDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            defaultValue={editedData?.lastPeriodDate}
                                            selected={editedData.lastPeriodDate}
                                            onSelect={(selectedDate) => {
                                                setEditedData({ ...editedData, lastPeriodDate: selectedDate })
                                                setValue("lastPeriodDate", selectedDate)
                                                trigger("lastPeriodDate")
                                            }}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1950-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {errors.lastPeriodDate && <span className="text-red-500 text-sm">{errors.lastPeriodDate?.message}</span>}
                        </div>
                        :
                        <div className="flex flex-col">
                            <div className="text-md font-semibold text-gray-800 flex items-center gap-2" >
                                <span className="w-32">
                                    Last Period Date
                                </span>
                                <span>: {userData?.lastPeriodDate}</span>
                                <button onClick={() => [
                                    setEditingPeriodDate(true)
                                ]}>
                                    <Pencil size={17} />
                                </button>
                            </div>
                        </div>
                    }
                    <div className="flex flex-row items-end">
                        {editable ?
                            <>
                                <div className="text-md font-semibold flex flex-row gap-2 items-end">Average Cycle Length (days):
                                    <input defaultValue={userData?.avgCycleLength} className=" number-input border border-blue-500 rounded-md px-2 w-20" type="number" id="avgCycleLength" min={0} {...register('avgCycleLength', { required: "This field is required", min: { value: 0, message: "Avg Cycle can not be negative" } })} />
                                </div>
                                {errors.avgCycleLength && <span className="text-red-500 text-sm">{errors.avgCycleLength?.message}</span>}
                            </>
                            :
                            <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                <span className="w-32">
                                    Average Cycle Length
                                </span>
                                <span>: {userData?.avgCycleLength} days</span>
                            </div>
                        }
                    </div>
                    <div className="flex flex-col justify-start w-full items-start  gap-5">
                        {editable ?
                            <div className="flex flex-col">
                                <div className="text-md font-semibold flex items-center gap-2" >Diagnose Date:
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    " justify-start text-left font-normal",
                                                    !editedData.diagnosisDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="h-4 w-4" />
                                                {editedData.diagnosisDate ? format(editedData.diagnosisDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={editedData.diagnosisDate}
                                                onSelect={(selectedDate) => {
                                                    setEditedData({ ...editedData, diagnosisDate: selectedDate })
                                                    setValue("diagnosisDate", selectedDate)
                                                    trigger("diagnosisDate")
                                                }}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1950-01-01")
                                                }
                                                initialFocus
                                                defaultValue={editedData?.diagnosisDate}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {errors.diagnosisDate && <span className="text-red-500 text-sm">{errors.diagnosisDate?.message}</span>}
                            </div>
                            :
                            <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                <span className="w-32">
                                    Diagnose Date
                                </span>
                                <span>: {userData.diagnosisDate}</span>
                            </div>
                        }
                    </div>
                </div>
                <div className="flex flex-col flex-1 gap-3">
                    <div className=" flex flex-col">
                        {editable ?
                            <>
                                <div className="text-md font-semibold flex items-center gap-2">Current Stage:
                                    <select defaultValue={userData?.cancerStage || "cancerStage"} {...register("cancerStage", { required: 'Cancter stage is required', validate: value => value != "cancerStage" || 'Please select a stage' })} className="p-2 w-28 border rounded-lg bg-white border-blue-500 text-sm">
                                        <option value="cancerStage" disabled  >
                                            Current Cancer Stage
                                        </option>
                                        <option value="STAGE_0">Stage 0</option>
                                        <option value="STAGE_1">Stage 1</option>
                                        <option value="STAGE_2">Stage 2</option>
                                        <option value="STAGE_3">Stage 3</option>
                                        <option value="STAGE_4">Stage 4</option>
                                        <option value="SURVIVOR">Survivor</option>
                                    </select>
                                </div>
                                {errors.avgCycleLength && <span className="text-red-500 text-sm">{errors.cancerStage?.message}</span>}
                            </>
                            :
                            <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                <span className="w-40">
                                    Current Stage
                                </span>
                                <span>: {userData.cancerStage}</span>
                            </div>
                        }
                    </div>
                    <div className="w-full">
                        {editable ?
                            <div className="flex flex-col justify-between w-full  gap-3">
                                <div>
                                    <div className="text-md font-semibold flex gap-2">Cancer History:
                                        <select defaultValue={userData?.cancerHistory || "N"} id="cancerHistory" {...register('cancerHistory', { required: "This field is required" })} className="px-2 border rounded-lg w-20 bg-white border-blue-500">
                                            <option value="N">No</option>
                                            <option value="Y">Yes</option>
                                        </select>
                                    </div>
                                    {errors.cancerHistory && <span className="text-red-500 text-sm">{errors.cancerHistory?.message}</span>}
                                </div>
                                {cancerHistory === "Y" &&
                                    <div className="flex items-center w-full justify-between gap-2">
                                        <div className="flex items-center gap-5">
                                            <div className="text-md font-semibold gap-2 flex">Cancer Relatives:
                                                <input className="border border-blue-500 rounded-md px-2" id="cancerRelatives" />
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    setEditedData({ ...editedData, cancerRelatives: [...editedData.cancerRelatives, document.getElementById('cancerRelatives').value] })
                                                    document.getElementById('cancerRelatives').value = ''
                                                    toast.message("Relative added", {
                                                        description: "See added relatives to see all the relatives added so far"
                                                    })
                                                }}
                                                variant={"outline"}
                                                className={cn(
                                                    " h-7 justify-start text-left font-normal",
                                                )}>
                                                <Plus />
                                            </Button>
                                        </div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[160px] justify-start text-left font-normal",
                                                    )}
                                                >Added Relatives</Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <ScrollArea className="rounded-md border h-52 min-w-64">
                                                    {editedData.cancerRelatives.map((relative, index) => (
                                                        <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                            <span>{relative}</span>
                                                            <Button
                                                                onClick={() => {
                                                                    setEditedData({ ...editedData, cancerRelatives: editedData.cancerRelatives.filter((_, i) => i !== index) })
                                                                    toast.message("Relative removed")
                                                                }}
                                                                variant={"outline"}
                                                                className={cn(
                                                                    " h-7 justify-start text-left font-normal",
                                                                )}>
                                                                <Minus className="text-red-500" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </ScrollArea >
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                }
                            </div>
                            :
                            <div className="flex flex-col justify-between w-full  gap-3">
                                <div>
                                    <div className="text-md font-semibold text-gray-800 flex gap-2">
                                        <span className="w-40">
                                            Cancer History
                                        </span>
                                        <span>: {userData?.cancerHistory}</span>
                                    </div>
                                </div>
                                {userData?.cancerHistory === "Y" &&
                                    <div className="flex items-center">
                                        <div className="text-md font-semibold flex flex-row gap-1">Cancer Relatives: {userData?.cancerRelatives?.join(", ")}
                                        </div>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                    <div className="w-full ">
                        {editable ?
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-5">
                                    <div className="text-md font-semibold flex items-center gap-2">Period Irregularities:
                                        <input className="border border-blue-500 rounded-md px-2" id="periodIrregularities" />
                                    </div>
                                    <Button
                                        onClick={() => {
                                            if (!document.getElementById('periodIrregularities').value) return toast.error("Irregularity field is empty")
                                            setEditedData({ ...editedData, periodIrregularities: [...editedData.periodIrregularities, document.getElementById('periodIrregularities').value] })
                                            document.getElementById('periodIrregularities').value = ''
                                            toast.message("Irregularity added", {
                                                description: "See added irregularities to see all the relatives added so far"
                                            })
                                        }}
                                        variant={"outline"}
                                        className={cn(
                                            " h-7 justify-start text-left font-normal",
                                        )}>
                                        <AddIcon fontSize="medium" />
                                    </Button>
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                " justify-start text-left font-normal",
                                            )}
                                        >Added Irregularities</Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <ScrollArea className="rounded-md border h-52 min-w-64">
                                            {editedData.periodIrregularities.map((irregularity, index) => (
                                                <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                    <span>{irregularity}</span>
                                                    <Button
                                                        onClick={() => {
                                                            setEditedData({ ...editedData, periodIrregularities: editedData.periodIrregularities.filter((_, i) => i !== index) })
                                                            toast.message("Irregularity removed")
                                                        }}
                                                        variant={"outline"}
                                                        className={cn(
                                                            " h-7 justify-start text-left font-normal",
                                                        )}>
                                                        <RemoveIcon sx={{ color: red[500] }} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </ScrollArea >
                                    </PopoverContent>
                                </Popover>
                            </div>
                            :
                            <div className="flex items-center justify-between w-full">
                                <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="w-40">
                                        Period Irregularities
                                    </span>
                                    <span>: {userData?.periodIrregularities?.join(", ")}</span>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="w-full ">
                        {editable ?
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-5">
                                    <div className="text-md font-semibold flex items-center gap-2">Allergies
                                        <input className="border border-blue-500 rounded-md px-2" id="allergies" />
                                    </div>
                                    <Button
                                        onClick={() => {
                                            if (!document.getElementById('allergies').value) return toast.error("Allergy field is empty")
                                            setEditedData({ ...editedData, allergies: [...editedData.allergies, document.getElementById('allergies').value] })
                                            document.getElementById('allergies').value = ''
                                            toast.message("Allergy added", {
                                                description: "See added allergies to see all the allergies added so far"
                                            })
                                        }}
                                        variant={"outline"}
                                        className={cn(
                                            " h-7 justify-start text-left font-normal",
                                        )}>
                                        <AddIcon fontSize="medium" />
                                    </Button>
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[160px] justify-start text-left font-normal",
                                            )}>
                                            Added Allergies
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <ScrollArea className="rounded-md border h-52 min-w-64">
                                            {editedData.allergies.map((allergy, index) => (
                                                <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                    <span>{allergy}</span>
                                                    <Button
                                                        onClick={() => {
                                                            setEditedData({ ...editedData, allergies: editedData.allergies.filter((_, i) => i !== index) })
                                                            toast.message("Allergy removed")
                                                        }}
                                                        variant={"outline"}
                                                        className={cn(
                                                            " h-7 justify-start text-left font-normal",
                                                        )}>
                                                        <RemoveIcon sx={{ color: red[500] }} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </ScrollArea >
                                    </PopoverContent>
                                </Popover>
                            </div>
                            :
                            <div className="flex items-center justify-between w-full">
                                <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="w-40">
                                        Allergies
                                    </span>
                                    <span>: {userData?.allergies?.join(", ")}</span>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="w-full ">
                        {editable ?
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-5">
                                    <div className="text-md font-semibold flex items-center gap-2">Organs WithChronic Condition
                                        <input className="border border-blue-500 rounded-md px-2" id="organsWithChronicCondition" />
                                    </div>
                                    <Button
                                        onClick={() => {
                                            console.log(editedData)
                                            if (!document.getElementById('organsWithChronicCondition').value) return toast.error("Organ field is empty")
                                            setEditedData({ ...editedData, organsWithChronicCondition: [...editedData.organsWithChronicCondition, document.getElementById('organsWithChronicCondition').value] })
                                            document.getElementById('organsWithChronicCondition').value = ''
                                            toast.message("Organ added", {
                                                description: "See added Organs to see all the Organs added so far"
                                            })
                                        }}
                                        variant={"outline"}
                                        className={cn(
                                            " h-7 justify-start text-left font-normal",
                                        )}>
                                        <AddIcon fontSize="medium" />
                                    </Button>
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[160px] justify-start text-left font-normal",
                                            )}>
                                            Added Organs
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <ScrollArea className="rounded-md border h-52 min-w-64">
                                            {editedData.organsWithChronicCondition.map((organ, index) => (
                                                <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                    <span>{organ}</span>
                                                    <Button
                                                        onClick={() => {
                                                            setEditedData({ ...editedData, organsWithChronicCondition: editedData.organsWithChronicCondition.filter((_, i) => i !== index) })
                                                            toast.message("Organ removed")
                                                        }}
                                                        variant={"outline"}
                                                        className={cn(
                                                            " h-7 justify-start text-left font-normal",
                                                        )}>
                                                        <RemoveIcon sx={{ color: red[500] }} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </ScrollArea >
                                    </PopoverContent>
                                </Popover>
                            </div>
                            :
                            <div className="flex items-center justify-between w-full">
                                <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="w-40">
                                        Organs With Chronic Condition
                                    </span>
                                    <span>: {userData?.organsWithChronicCondition?.join(", ")}</span>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="w-full ">
                        {editable ?
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-md font-semibold flex items-center gap-2" >Medicine Name
                                            <input className="border border-blue-500 rounded-md px-2" id="medicineName" />
                                        </div>
                                        <div className="text-md font-semibold flex items-center gap-2" >Dose description
                                            <input className="border border-blue-500 rounded-md px-2" id="doseDescription" />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            if (!document.getElementById('medicineName').value || !document.getElementById('doseDescription').value) return toast.error("Both Medication fields are required")
                                            setEditedData({ ...editedData, medications: [...editedData.medications, { name: document.getElementById('medicineName').value, doseDescription: document.getElementById('doseDescription').value }] })
                                            document.getElementById('medicineName').value = ''
                                            document.getElementById('doseDescription').value = ''
                                            toast.message("Medicine added", {
                                                description: "See added Medicines to see all the Medicines added so far"
                                            })
                                        }}
                                        variant={"outline"}
                                        className={cn(
                                            " h-7 justify-start text-left font-normal",
                                        )}>
                                        <AddIcon fontSize="medium" />
                                    </Button>
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
                                            {editedData.medications.map((medication, index) => (
                                                <div key={index} className="flex justify-between flex-wrap p-1 border-b border-gray-300 w-full">
                                                    <span>{medication.name}</span>
                                                    <Separator className="bg-pink-500  w-[2px] h-5 " orientation="vertical" />
                                                    <ScrollableContainer style={{ display: 'flex', flexWrap: 'wrap', width: '10rem' }}>{medication.doseDescription}
                                                    </ScrollableContainer>
                                                    <Button
                                                        onClick={() => {
                                                            setEditedData({ ...editedData, medications: editedData.medications.filter((_, i) => i !== index) })
                                                            toast.message("Medication removed")
                                                        }}
                                                        variant={"outline"}
                                                        className={cn(
                                                            " h-7 justify-start text-left font-normal",
                                                        )}>
                                                        <RemoveIcon sx={{ color: red[500] }} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </ScrollArea >
                                    </PopoverContent>
                                </Popover>
                            </div>
                            :
                            <div className="flex items-center justify-between w-full">
                                <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="w-40">
                                        Medications
                                    </span>
                                    <span>: {userData?.medications?.map((medication) => medication.name).join(", ")}</span>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-black translate-y-4">Location</h2>
            <div className="flex flex-col items-center justify-center w-full border border-gray-500 bg-gray-100 relative rounded-md p-3 gap-5">
                <div className="flex flex-row justify-between w-full items-center">
                    <div className="flex flex-row items-center gap-2 justify-end w-full">
                        <Switch checked={userData?.locationShare} onCheckedChange={(checked) => {
                            axiosInstance.put(toggleLocationShare).then((response) => {
                                setUserData({ ...userData, locationShare: response?.data?.locationShare })
                                toast.message("Location share " + (response?.data?.locationShare ? "enabled" : "disabled"))
                            }).catch((error) => {
                                console.log(error)
                            })
                        }} />
                        <span>Share Location</span>
                    </div>
                </div>
                {currentPosition ?
                    <>
                        <span className='absolute top-20 right-24 bg-white p-2 text-lg z-10 rounded-md shadow-md'>{"Lat: " + (Math.round((currentPosition?.lat + Number.EPSILON) * 10000) / 10000) + " Lng: " + (Math.round((currentPosition?.lng + Number.EPSILON) * 10000) / 10000)}</span>
                        <EditUserMapView currentPosition={currentPosition} setCurrentPosition={setCurrentPosition} editable={editable} />
                    </>
                    :
                    <Loader2 size={52} className="animate-spin" />
                }
            </div>
            <AlertDialog open={editingPeriodDate} >
                <AlertDialogTrigger>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Update Period Date
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <input type="date" ref={newPeriodDateRef} className="w-fit" />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setEditingPeriodDate(false)
                        }}>
                            Cancer
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            axiosInstance.put(updatePeriodDateUrl, {
                                lastPeriodDate: newPeriodDateRef.current.value,
                                avgGap: differenceInDays(new Date(newPeriodDateRef.current.value), new Date(userData.lastPeriodDate))
                            }).then((response) => {
                                setUserData({ ...userData, lastPeriodDate: newPeriodDateRef.current.value })
                                setEditedData({ ...editedData, lastPeriodDate: newPeriodDateRef.current.value })
                                setEditingPeriodDate(false)
                                toast.message("Period Date Updated")
                            }).catch((error) => {
                                console.log(error)
                                toast.error("An error occured", {
                                    description: error.response?.data?.message
                                })
                            })
                        }}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
