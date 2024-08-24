'use client'
import { useEffect, useState } from "react"
import { getConsultationLocations, locationOnline, pagePaths, updateConsultationLocationUrl } from "@/utils/constants"
import { cn } from "@/lib/utils"
import { Banknote, Binary, Delete, ExternalLink, HardDriveUploadIcon, MapPinIcon, Pencil, Recycle, RecycleIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useSessionContext } from "@/app/context/sessionContext"
import Loading from "./loading"
import axiosInstance from "@/utils/axiosInstance"
import { toast } from "sonner"
import { Button } from "@mui/material"
import Link from "next/link"


export function ChambersPage({ className }) {
    const [consulations, setConsulations] = useState(null)
    const sessionContext = useSessionContext()
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (sessionContext.sessionData && fetching) {
            axiosInstance.get(getConsultationLocations(sessionContext.sessionData.userId)).then((res) => {
                console.log(res)
                setConsulations(res.data)
            }).catch((error) => {
                toast.error("Error occured fetching locations. Try again. Check internet")
            }).finally(() => {
                setFetching(false)
            })
        }

    }, [sessionContext.sessionData, fetching])

    function deleteLocation(id) {
        //code for delete is incomplete due to that bitch shuting down my internet
        axiosInstance.delete(updateConsultationLocationUrl(sessionContext.sessionData.userId, id)).then((res) => {
            toast.success("Location deleted")
            setFetching(true)
        }).catch((error) => {
            console.log("Error deletinng location")
            toast.error("Error occured. Check internet")
        })
    }


    if (!consulations) return <Loading chose="hand" />
    return (
        <div className={cn("flex flex-col w-full rounded p-5 bg-gray-50 gap-5 py-3", className)}>
            <div className="flex flex-row justify-between px-4 items-center">
                <h2 className="text-lg font-semibold">Consulation Locations</h2>
                <button className="p-2 flex flex-row gap-1 text-base items-center hover:underline" onClick={() => {
                    window.open(pagePaths.addConsultation, "_blank")
                }}>
                    Add Location <ExternalLink size={20} className="text-gray-700 hover:underline" />
                </button>
            </div>
            <Separator className="h-[1.5px] bg-gray-800" />
            <div className="flex flex-col rounded w-full">
                <div className="flex flex-col w-full">
                    {
                        consulations?.map((consulation, index) =>
                            <ChamberCard key={index} location={consulation.location} startTime={consulation.start} endTime={consulation.end} fees={consulation.fees} workdayString={consulation.workdays} id={consulation.id} deleteLocation={deleteLocation} />
                        )
                    }
                </div>
            </div>
        </div>

    )
}
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function isNumber(value) {
    return (typeof value === 'number' && isFinite(value)) || isNumeric(value);
}

function ChamberCard({ location, startTime, endTime, workdayString, fees, id, deleteLocation }) {
    const sessionContext = useSessionContext()
    const [data, setData] = useState({
        location: location,
        startTime: startTime,
        endTime: endTime,
        workdayString: workdayString,
        fees: fees,
        isOnline: location === locationOnline
    })
    console.log("Data", data)
    const weekDays = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]
    const workdaysFromBinaryString = (binaryString) => {
        let workdays = []
        for (let i = 0; i < binaryString.length; i++) {
            workdays.push({ day: weekDays[i], on: binaryString[i] === "1" })
        }
        return workdays
    }
    const [availableDays, setAvailableDays] = useState(workdaysFromBinaryString(data.workdayString))
    const [editable, setEditable] = useState(false)

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    const workdaysToBinaryString = (workdays) => {
        let binaryString = ""
        for (let i = 0; i < weekDays.length; i++) {
            if (workdays[i].day === weekDays[i]) {
                binaryString += (workdays[i].on ? "1" : "0")
            }
            else {
                binaryString += workdays.find((day) => day.day === weekDays[i])
            }
        }
        return binaryString
    };
    const update = () => {
        let newLocation = document.getElementById("location-input").value
        let newFees = document.getElementById("fees-input").value
        let newStartTime = document.getElementById("startTime-input").value
        let newEndTime = document.getElementById("endTime-input").value
        // if start time is greater than end time then swap but the time is in 24 hour format and string so need to consider that and parse it
        const startHour = parseInt(newStartTime.split(":")[0])
        const endHour = parseInt(newEndTime.split(":")[0])
        if (startHour > endHour) {
            return
        }
        const startMinute = parseInt(newStartTime.split(":")[1])
        const endMinute = parseInt(newEndTime.split(":")[1])
        if (startHour === endHour && startMinute > endMinute) {
            return
        }
        let newWorkdayString = workdaysToBinaryString(availableDays)
        console.log(newFees)
        if (availableDays.find(day => day.on) && newLocation !== "" && newFees !== "" && isNumber(newFees) && newStartTime !== "" && newEndTime !== "" && newWorkdayString !== "") {
            console.log("updating")
            const updateData = {
                location: data.isOnline ? locationOnline : newLocation,
                start: newStartTime,
                end: newEndTime,
                workdays: newWorkdayString,
                fees: newFees
            }
            const headers = {
                "Authorization": `Bearer ${sessionContext.sessionData.token}`
            }
            axiosInstance.put(updateConsultationLocationUrl(sessionContext.sessionData.userId, id), updateData).then((res) => {
                setData({
                    location: data.isOnline ? locationOnline : newLocation,
                    startTime: newStartTime,
                    endTime: newEndTime,
                    workdayString: newWorkdayString,
                    fees: newFees
                })
            }).catch((error) => {
                console.log("Error updating location", error)
                toast.error("Error updating location. Check Internet. Try again.")
            })
        }
        else {
            setAvailableDays(workdaysFromBinaryString(data.workdayString))
        }
        setEditable(false)
    }

    return (
        <div className="flex flex-row w-full m-1 bg-white rounded-md shadow h-auto justify-between px-6 flex-shrink ">
            <div className="flex flex-col  px-4 py-2 h-full justify-evenly">
                {editable ?
                    (
                        <>
                            <textarea id="location-input" type="text" disabled={data.isOnline} defaultValue={data.location} className={cn("text font-semibold line-clamp-1 flex-1", editable ? "border-2 rounded-md border-blue-200" : "")} />
                            <input id="fees-input" type="number" defaultValue={data.fees} className={cn("mt-2 line-clamp-2", editable ? "border-2 rounded-md border-blue-200 number-input" : "")} />
                        </>
                    ) : (
                        <>
                            <h1 className="text-lg font-semibold flex gap-2 items-center"><MapPinIcon size={24} />{data.location}</h1>
                            <p className="text-base font-semibold flex gap-2 items-end"><Banknote size={22} />{data.fees}</p>
                        </>
                    )}
            </div>
            <div className="flex flex-col  px-4 py-2">
                {
                    !editable ?
                        (<div className="flex flex-row items-center">
                            <p className="text-lg font-semibold ml-2">{"" + data.startTime}</p>
                            <p className="text-lg font-semibold ml-2">{"To " + data.endTime}</p>
                        </div>
                        ) : (
                            <div className="flex flex-row justify-evenly gap-3">
                                <div className="flex flex-col">
                                    <label htmlFor="starttime" className="block text-sm font-medium text-gray-900 dark:text-white">Start time:</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input type="time" id="startTime-input" className="bg-gray-50 border-2 leading-none border-purple-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="00:00" max="23:59" defaultValue={data.startTime} />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="time" className="block text-sm font-medium text-gray-900 dark:text-white">End time:</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input type="time" id="endTime-input" className="bg-gray-50 border-2 leading-none border-purple-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="00:00" max="23:59" defaultValue={data.endTime} />
                                    </div>
                                </div>
                            </div>
                        )
                }
                {editable ? (
                    <div className="flex flex-row items-center mt-4 flex-wrap">
                        {availableDays.map((day, index) => (
                            <button type="button" key={index} className={cn("flex flex-row items-center border text-black mx-1 px-2 ", day.on ? "bg-gray-100" : "bg-red-400")}
                                onClick={() => {
                                    let newDays = [...availableDays]
                                    newDays[index].on = !newDays[index].on
                                    setAvailableDays(newDays)
                                }}
                            >
                                <span className="text-lg font-semibold">{day.day}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-row items-center mt-4">
                        {availableDays.map((day, index) => (
                            <div key={index} className={cn("flex flex-row items-center border text-black mx-2 bg-gray-100 rounded-md shadow-inner", day.on ? "" : "hidden")}>
                                <span className="text-lg font-semibold mx-2">{day.day}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-row gap-5 py-2 items-center justify-center h-full">
                {!editable ? (
                    <button className="text-white bg-blue-800 px-4 py-1 rounded-md flex items-center gap-2 hover:scale-95" onClick={() => { setEditable(true) }}>
                        <Pencil size={16} />
                        Edit</button>
                ) : (
                    <button className="text-white bg-green-800 px-4 py-1 rounded-md flex items-center gap-2 hover:scale-95" onClick={() => {
                        setEditable(false)
                        update()
                    }}>
                        <HardDriveUploadIcon size={16} />
                        Save</button>
                )}
                <button className="border-2 border-red-500 bg-red-50 px-3 py-1 rounded-md hover:scale-95 gap-2" onClick={() => {
                    deleteLocation(id)
                }}>
                    Delete
                </button>
            </div>
        </div>
    )

}