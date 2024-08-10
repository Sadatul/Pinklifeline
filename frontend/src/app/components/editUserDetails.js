'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import { generateOptions, getFeetFromCm, getInchFromCm, getUserInfoUrl, locationResolution, roles, updateUserDetailsUrl } from "@/utils/constants"
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
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import axiosInstance from "@/utils/axiosInstance"
import { useSessionContext } from "@/app/context/sessionContext"
import Loading from "@/app/components/loading"
import { set } from "lodash"

const dummyData = {
    "allergies": ["Peanut"],
    "organsWithChronicConditions": ["Heart", "Throat"],
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

export function EditUserDetailsPage({ isPatient }) {
    const sessionContext = useSessionContext()
    const [currentPosition, setCurrentPosition] = useState(null)
    const [userData, setUserData] = useState({
        "allergies": ["Peanut"],
        "organsWithChronicConditions": ["Heart", "Throat"],
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
    })
    const [editable, setEditable] = useState(false)
    const { register, handleSubmit, formState: { errors }, watch, getValues, trigger, setValue } = useForm();
    const cancerHistory = watch('cancerHistory');
    const [editedData, setEditedData] = useState(userData)
    const [organsWithChronicCondition, setOrgansWithChronicCondition] = useState(userData?.organsWithChronicCondition || []);
    const [medications, setMedications] = useState(userData?.medications || []);
    const latlng = cellToLatLng(userData?.location)
    const [position, setPosition] = useState({
        lat: latlng[0],
        lng: latlng[1]
    });

    useEffect(() => {
        if (sessionContext.sessionData) {
            axiosInstance.get(getUserInfoUrl(sessionContext.sessionData.userId, roles.patient)).then((response) => {
                // setUserData(response.data)
                // setEditedData(response.data)
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


    const getCurrentYear = () => new Date().getFullYear();


    // const onSubmit = (data) => {
    //     const userData = { ...userData, ...data, height: (Number(data?.heightFeet) * 12 + Number(data?.heightInch)) * 2.54 || "undefined", location: latLngToCell(Number(position.lat), Number(position.lng), locationResolution) }
    //     userData = {
    //         ...userData,
    //         cancerRelatives: userData?.cancerHistory === "Y" ? cancerRelatives : [],
    //         periodIrregularities: periodIrregularities,
    //         allergies: allergies,
    //         organsWithChronicCondition: organsWithChronicCondition,
    //         medications: medications
    //     }
    //     console.log("userData", userData)
    //     const headers = {
    //         'Authorization': `Bearer ${sessionContext.sessionData.token}`
    //     }
    //     let form_data;

    //     const tempPeriodDate = new Date(userData?.lastPeriodDate)
    //     form_data = {
    //         fullName: userData?.fullName,
    //         weight: userData?.weight,
    //         height: (Number(userData?.heightFeet) * 12 + Number(userData?.heightInch)) * 2.54 || "undefined",
    //         cancerHistory: userData?.cancerHistory,
    //         cancerRelatives: userData?.cancerRelatives,
    //         lastPeriodDate: `${tempPeriodDate.getFullYear()}-${(tempPeriodDate.getMonth() + 1) < 10 ? `0${tempPeriodDate.getMonth() + 1}` : `${tempPeriodDate.getMonth() + 1}`}-${(tempPeriodDate.getDate()) < 10 ? `0${tempPeriodDate.getDate()}` : `${tempPeriodDate.getDate()}`}`,
    //         avgCycleLength: userData?.avgCycleLength,
    //         periodIrregularities: userData?.periodIrregularities,
    //         allergies: userData?.allergies,
    //         organsWithChronicCondition: userData?.organsWithChronicCondition,
    //         medications: userData?.medications
    //     }
    //     if (sessionContext.sessionData.role === roles.patient) {
    //         const tempDiagnosisDate = new Date(userData?.diagnosisDate)
    //         form_data = {
    //             ...form_data,
    //             diagnosisDate: `${tempDiagnosisDate.getFullYear()}-${(tempDiagnosisDate.getMonth() + 1) < 10 ? `0${tempDiagnosisDate.getMonth() + 1}` : `${tempDiagnosisDate.getMonth() + 1}`}-${(tempDiagnosisDate.getDate()) < 10 ? `0${tempDiagnosisDate.getDate()}` : `${tempDiagnosisDate.getDate()}`}`,
    //             cancerStage: userData?.cancerStage,
    //             location: userData?.location
    //         }
    //     }
    //     console.log("form data", form_data)
    //     axiosInstance.put(updateUserDetailsUrl(sessionContext.sessionData.userId, sessionContext.sessionData.role), form_data).then((response) => {
    //         console.log(response)
    //         toast.success("Information saved successfully")
    //     }
    //     ).catch((error) => {
    //         console.log(error)
    //         toast.error("An error occured", {
    //             description: error.response?.data?.message
    //         })
    //     })
    // }

    const onSubmit = (data) => {
        console.log("data", data)
    }

    if (!sessionContext.sessionData) return <Loading />
    return (
        <div className="flex flex-col w-full gap-3 items-center p-7 relative">
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

            <h1 className="text-2xl font-bold text-black">Update User Details</h1>
            <div className="flex flex-col w-11/12 bg-gray-100 rounded-md mt-5 gap-3 py-3 items-center">
                <div className="flex flex-row justify-between px-5 items-center w-full">
                    <div className="text-md font-semibold m-2">
                        {editable ?
                            <div className="flex flex-row items-center gap-1">Full Name
                                <input defaultValue={userData.fullName} type="text" className="border-2 rounded-md p-1 mt-2 border-blue-500" {...register("fullName", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.fullName && <span className="text-red-500">{errors.fullName?.message}</span>}
                            </div>
                            :
                            <span className="text-lg ">Name: {userData.fullName}</span>
                        }
                    </div>
                    <div className="text-md font-semibold m-2 ">
                        {editable ?
                            <div className="w-full flex flex-col">Weight(kg)
                                <input defaultValue={userData.weight} type="number" className="number-input border-2 rounded-md p-1 mt-2 border-blue-500" min={10} {...register("weight", { required: "Weigh is required", max: { value: 1000, message: "Maximum weight 1000kg" }, min: { value: 10, message: "Minimum weight 10" } })} />
                                {errors.weight && <span className="text-red-500  text-sm">{errors.weight?.message}</span>}
                            </div>
                            :
                            <span className="text-lg">Weight: {userData.weight} kg</span>
                        }
                    </div>
                    <div className="text-md font-semibold m-2 text-center">
                        {editable ?
                            <div className="flex gap-4 mt-2">Height
                                <div>
                                    <select defaultValue={getFeetFromCm(userData.height) || "feet"} {...register("heightFeet", { required: 'Day is required', validate: value => value != "feet" || 'Please select a feet' })} className="p-2 border rounded-lg w-20 bg-white border-blue-500">
                                        <option value="feet" disabled >
                                            Feet
                                        </option>
                                        {generateOptions(0, 10)}
                                    </select>
                                    {errors.heightFeet && <p className="text-red-500 text-sm">{errors.heightFeet?.message}</p>}
                                </div>
                                <div>
                                    <select defaultValue={getInchFromCm(userData.height) || "inch"} {...register("heightInch", { required: 'Month is required', validate: value => value != "inch" || 'Please select a inch' })} className="p-2 w-20 border rounded-lg bg-white border-blue-500">
                                        <option value="inch" disabled  >
                                            Inch
                                        </option>
                                        {generateOptions(1, 11)}
                                    </select>
                                    {errors.heightInch && <p className="text-red-500 text-sm">{errors.heightInch?.message}</p>}
                                </div>
                            </div>
                            :
                            <span className="text-lg">Height: {getFeetFromCm(userData.height)} feet {getInchFromCm(userData.height)} inch</span>
                        }
                    </div>
                </div>
                <div className="w-full">
                    {editable ?
                        <div className="flex justify-between w-full px-5">
                            <div>
                                <div className="text-md font-semibold m-2 text-center">Cancer History:
                                    <select defaultValue={userData?.cancerHistory || "N"} id="cancerHistory" {...register('cancerHistory', { required: "This field is required" })} className="px-2 border rounded-lg w-20 bg-white border-blue-500 ml-3">
                                        <option value="N">No</option>
                                        <option value="Y">Yes</option>
                                    </select>
                                </div>
                                {errors.cancerHistory && <span className="text-red-500 text-sm">{errors.cancerHistory?.message}</span>}
                            </div>
                            {cancerHistory === "Y" &&
                                <div className="flex items-center">
                                    <div className="text-md font-semibold m-2 text-center">Cancer Relatives:
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
                                                                " h-7 mx-4 justify-start text-left font-normal",
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
                        <div className="flex justify-between w-full px-5">
                            <div>
                                <div className="text-md font-semibold m-2 text-center">Cancer History:
                                    <span>{userData?.cancerHistory === "Y" ? "Yes" : "No"}</span>
                                </div>
                            </div>
                            {userData?.cancerHistory === "Y" &&
                                <div className="flex items-center">
                                    <div className="text-md font-semibold m-2 text-center">Cancer Relatives:
                                        <div className="flex flex-col">
                                            {userData?.cancerRelatives?.map((relative, index) => (
                                                <span key={index}>{relative}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    }
                </div>
                <div className="flex justify-between w-full items-center px-5">
                    {editable ?
                        <div className="flex flex-col">
                            <div className="text-md m-2 font-semibold text-center" >Last Period Date:
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[160px] ml-3 justify-start text-left font-normal",
                                                !editedData.lastPeriodDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editedData.lastPeriodDate ? format(editedData.lastPeriodDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
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
                                            defaultValue={editedData?.lastPeriodDate}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {errors.lastPeriodDate && <span className="text-red-500 text-sm">{errors.lastPeriodDate?.message}</span>}
                        </div>
                        :
                        <div className="flex flex-col">
                            <div className="text-md m-2 font-semibold text-center flex gap-2" >Last Period Date:
                                <span>{userData?.lastPeriodDate}</span>
                            </div>
                        </div>
                    }
                    <div className=" w-1/3 flex flex-col items-end">
                        {editable ?
                            <>
                                <div className="text-md font-semibold text-center flex flex-col items-end">Average Cycle Length (days):
                                    <input defaultValue={userData?.avgCycleLength} className=" number-input border border-blue-500 rounded-md px-2" type="number" id="avgCycleLength" min={0} {...register('avgCycleLength', { required: "This field is required", min: { value: 0, message: "Avg Cycle can not be negative" } })} />
                                </div>
                                {errors.avgCycleLength && <span className="text-red-500 text-sm">{errors.avgCycleLength?.message}</span>}
                            </>
                            :
                            <div className="text-md font-semibold text-center">Average Cycle Length (days): {userData?.avgCycleLength}
                            </div>
                        }
                    </div>
                </div>
                <div className="flex justify-between w-full items-center px-5">
                    {editable ?
                        <div className="flex flex-col">
                            <div className="text-md m-2 font-semibold text-center" >Diagnose Date:
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                " ml-3 justify-start text-left font-normal",
                                                !editedData.diagnosisDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
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
                        <span className="text-md m-2 font-semibold text-center flex gap-2" >
                            Diagnose Date: {userData?.diagnosisDate}
                        </span>
                    }

                    <div className=" w-1/3 flex flex-col items-end">
                        {editable ?
                            <>
                                <div className="text-md font-semibold m-2 text-center">Current Stage:
                                    <select defaultValue={userData?.cancerStage || "cancerStage"} {...register("cancerStage", { required: 'Cancter stage is required', validate: value => value != "cancerStage" || 'Please select a stage' })} className="p-2 w-28 ml-1 border rounded-lg bg-white border-blue-500 text-sm">
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
                            <span className="text-md font-semibold text-center flex gap-1">
                                Current Stage: {userData?.cancerStage}
                            </span>
                        }
                    </div>
                </div>
                <div className="w-full px-5">
                    {editable ?
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <div className="text-md font-semibold m-2 text-center">Period Irregularities:
                                    <input className="border border-blue-500 rounded-md px-2 m-2" id="periodIrregularities" />
                                </div>
                                <TooltipProvider delayDuration={400}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
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
                                            " ml-3 justify-start text-left font-normal",
                                        )}
                                    >Added Irregularities</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <ScrollArea className="rounded-md border h-52 min-w-64">
                                        {editedData.periodIrregularities.map((irregularity, index) => (
                                            <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                <span>{irregularity}</span>
                                                <TooltipProvider delayDuration={400}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setEditedData({ ...editedData, periodIrregularities: editedData.periodIrregularities.filter((_, i) => i !== index) })
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
                        :
                        <div className="flex items-center justify-between w-full">
                            <div className="text-md font-semibold m-2 text-center">Period Irregularities:
                                <div className="flex flex-col">
                                    {userData?.periodIrregularities?.map((irregularity, index) => (
                                        <span key={index}>{irregularity}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                </div>

                <div className="w-full px-5">
                    {editable ?
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <div className="text-md font-semibold m-2 text-center">Allergies
                                    <input className="border border-blue-500 rounded-md px-2 m-2" id="allergies" />
                                </div>
                                <TooltipProvider delayDuration={400}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
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
                                        {editedData.allergies.map((allergy, index) => (
                                            <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                <span>{allergy}</span>
                                                <TooltipProvider delayDuration={400}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setEditedData({ ...editedData, allergies: editedData.allergies.filter((_, i) => i !== index) })
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
                        :
                        <div className="flex items-center justify-between w-full">
                            <div className="text-md font-semibold m-2 text-center">Allergies
                                <div className="flex flex-col">
                                    {userData?.allergies?.map((allergy, index) => (
                                        <span key={index}>{allergy}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <div className="w-full px-5">
                    {editable ?
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <div className="text-md font-semibold text-center">Organs WithChronic Condition
                                    <input className="border border-blue-500 rounded-md px-2 m-2" id="organsWithChronicCondition" />
                                </div>
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
                        :
                        <div className="flex items-center justify-between w-full">
                            <div className="text-md font-semibold m-2 text-center">Organs With Chronic Condition
                                <div className="flex flex-col">
                                    {userData?.organsWithChronicCondition?.map((organ, index) => (
                                        <span key={index}>{organ}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <div className="w-full px-5">
                    {editable ?
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <div className="text-md font-semibold m-1 text-center gap-2" >Medicine Name
                                    <input className="border border-blue-500 rounded-md px-2 ml-2" id="medicineName" />
                                </div>
                                <div className="text-md font-semibold m-1 text-center" >Dose description
                                    <input className="border border-blue-500 rounded-md px-2 ml-2" id="doseDescription" />
                                </div>
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
                        :
                        <div className="flex items-center justify-between w-full">
                            <div className="text-md font-semibold m-2 text-center">Medications
                                <div className="flex flex-col">
                                    {userData?.medications?.map((medication, index) => (
                                        <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                            <span>{medication.name}</span>
                                            <Separator className="bg-pink-500  w-[2px] h-5 " orientation="vertical" />
                                            <ScrollableContainer style={{ display: 'flex', flexWrap: 'wrap', width: '10rem' }}>{medication.doseDescription}
                                            </ScrollableContainer>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div className="flex flex-col items-center justify-center w-11/12 border border-gray-500 bg-gray-100 relative rounded-md p-3">
                <h1 className="text-2xl font-bold m-2 text-black">Location</h1>
                {currentPosition ?
                    <>
                        <span className='absolute top-20 right-24 bg-white p-2 text-lg z-10 rounded-md shadow-md'>{"Lat: " + (Math.round((position?.lat + Number.EPSILON) * 10000) / 10000) + " Lng: " + (Math.round((position?.lng + Number.EPSILON) * 10000) / 10000)}</span>
                        <EditUserDetailsPage currentPosition={currentPosition} setCurrentPosition={setCurrentPosition} editable={editable} />
                    </>
                    :
                    <Loader2 size={52} className="animate-spin" />
                }
            </div>
        </div>
    )
}
