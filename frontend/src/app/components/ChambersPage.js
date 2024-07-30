'use client'
import { useEffect, useState } from "react"
import { getConsultationLocations, locationOnline, updateConsultationLocationUrl } from "@/utils/constants"
import { cn } from "@/lib/utils"
import { Banknote, Binary, Delete, HardDriveUploadIcon, Pencil, Recycle, RecycleIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useSessionContext } from "@/app/context/sessionContext"
import Loading from "./loading"
import axiosInstance from "@/utils/axiosInstance"
import { toast } from "sonner"
import { Button } from "@mui/material"

const dummy = {
    "workdays": "1110110",
    "fees": 700,
    "start": "07:43:23",
    "location": "Rule 2nd phase, Khulna",
    "end": "17:43:23",
    "id": 1
}

export function ChambersPage({ className }) {
    const [consulations, setConsulations] = useState(null)
    const sessionContext = useSessionContext()

    useEffect(() => {
        if (sessionContext.sessionData && !consulations) {
            const headers = {
                "Authorization": `Bearer ${sessionContext.sessionData.token}`
            }
            axiosInstance.get(getConsultationLocations(sessionContext.sessionData.userId), {
                headers: headers
            }).then((res) => {
                console.log(res)
                setConsulations(res.data)
            }).catch((error) => {
                toast.error("Error occured fetching locations. Try again. Check internet")
            })
        }

    }, [sessionContext.sessionData])

    function deleteLocation(id) {
        //code for delete is incomplete due to that bitch taking down my internet connection
        const headers = {
            "Authorization": `Bearer ${sessionContext.sessionData.token}`
        }
        axiosInstance.delete(updateConsultationLocationUrl(sessionContext.sessionData.userId, id), {
            headers: headers
        }).then((res) => {
            toast.success("Location deleted")
        }).catch((error) => {
            toast.error("Error occured. Check internet")
        })
    }


    // if (!consulations) return <Loading chose="hand" />
    return (
        <div className={cn("flex flex-col w-10/12 rounded items-center bg-gray-100 gap-5 py-3", className)}>
            <div className="flex flex-col rounded w-11/12">
                <div className="flex flex-col w-full">
                    {
                        // consulations?.map((consulation, index) => {
                        //     <ChamberCard key={index} location={consulation.location} startTime={consulation.start} endTime={consulation.end} fees={consulation.fees} workdayString={consulation.workdays} id={consulation.id} />
                        // })
                        <>
                            <ChamberCard location={"consulation.location"} startTime={"00:00"} endTime={"00:00"} fees={100} workdayString={"0000110"} id={1} deleteLocation={deleteLocation} />
                            <ChamberCard location={"consulation.location"} startTime={"00:00"} endTime={"00:00"} fees={100} workdayString={"0000110"} id={1} deleteLocation={deleteLocation} />
                            <ChamberCard location={"consulation.location"} startTime={"00:00"} endTime={"00:00"} fees={100} workdayString={"0000110"} id={1} deleteLocation={deleteLocation} />
                            <ChamberCard location={"consulation.location"} startTime={"00:00"} endTime={"00:00"} fees={100} workdayString={"0000110"} id={1} deleteLocation={deleteLocation} />
                            <ChamberCard location={"consulation.location"} startTime={"00:00"} endTime={"00:00"} fees={100} workdayString={"0000110"} id={1} deleteLocation={deleteLocation} />
                            <ChamberCard location={"consulation.location"} startTime={"00:00"} endTime={"00:00"} fees={100} workdayString={"0000110"} id={1} deleteLocation={deleteLocation} />
                            <ChamberCard location={"consulation.location"} startTime={"00:00"} endTime={"00:00"} fees={100} workdayString={"0000110"} id={1} deleteLocation={deleteLocation} />
                            <ChamberCard location={"consulation.location"} startTime={"00:00"} endTime={"00:00"} fees={100} workdayString={"0000110"} id={1} deleteLocation={deleteLocation} />
                            <ChamberCard location={"consulation.location"} startTime={"00:00"} endTime={"00:00"} fees={100} workdayString={"0000110"} id={1} deleteLocation={deleteLocation} />
                        </>
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
            axiosInstance.put(updateConsultationLocationUrl(sessionContext.sessionData.userId, id), {
                headers: headers
            }).then((res) => {
                setData({
                    location: data.isOnline ? locationOnline : newLocation,
                    startTime: newStartTime,
                    endTime: newEndTime,
                    workdayString: newWorkdayString,
                    fees: newFees
                })
            }).catch((error) => {
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
                            <h1 className="text-lg font-semibold">{data.location}</h1>
                            <p className="text-base font-semibold flex gap-2 items-center"><Banknote size={24} />{data.fees}</p>
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
                    <div className="flex flex-row items-center mt-4">
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
                            <div key={index} className={cn("flex flex-row items-center border text-black mx-2 bg-gray-100", day.on ? "" : "hidden")}>
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
                <button className="border-2 border-red-500 bg-red-50 px-3 py-1 rounded-md hover:scale-95 gap-2">
                    Delete
                </button>
            </div>
        </div>
    )

}