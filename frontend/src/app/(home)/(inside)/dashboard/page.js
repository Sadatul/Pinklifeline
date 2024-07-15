'use client'

import Avatar from "@/app/components/avatar"
import ScrollableContainer from "@/app/components/StyledScrollbar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { avatarAang } from "@/utils/constants"
import { name } from "@stream-io/video-react-sdk"
import { set } from "date-fns"
import { Banknote, MapPinned } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { FaUserDoctor } from "react-icons/fa6";

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
                <Appointments />
            </ScrollableContainer>
        </div>
    )
}

function Appointments() {
    const [pastAppointments, setPastAppointments] = useState([{ name: "Dr. John Doe", speciality: "Dentist", date: "01/01/2022", time: "10:00 AM - 11:00 AM" }])
    const [currentAppointments, setCurrentAppointments] = useState([
        { name: "Dr. John Doe", speciality: "Dentist", date: "01/01/2022", time: "10:00 AM - 11:00 AM", location: "123 Main Street, New York, NY 10001", fees: "100" }
    ])
    const [upcomingAppointments, setUpcomingAppointments] = useState([{
        name: "Dr. John Doe",
        speciality: "Dentist",
        date: "01/01/2022",
        time: "10:00 AM - 11:00 AM",
        location: "123 Main Street, New York, NY 10001"
    },
    {
        name: "Dr. John Doe",
        speciality: "Dentist",
        date: "01/01/2022",
        time: "10:00 AM - 11:00 AM",
        location: "123 Main Street, New York, NY 10001"
    }
    ])
    return (
        <div className="flex flex-col items-center h-full bg-white">
            <h1 className="text-2xl font-bold mt-4">Appointments</h1>
            {/* Current running onlien Appointments */}
            <div className={cn("flex flex-col gap-4 mt-4 bg-gray-100 p-4 rounded-md mx-2 w-10/12 relative flex-wrap", (currentAppointments?.length > 0) ? "" : "hidden")}>
                <span className="absolute flex rounded-full size-3 z-40 -top-1 -right-2 items-center justify-center">
                    <span className="animate-ping inline-flex size-5  rounded-full bg-purple-400 absolute "></span>
                    <span className=" absolute inline-flex rounded-full size-3 bg-purple-500"></span>
                </span>
                <h1 className="text-lg font-semibold">You have currently running Appointments</h1>
                <div className="flex flex-col gap-2">
                    {currentAppointments.map((appointment, index) => (
                        <CurrentAppointmentCard key={index} appointment={appointment} />
                    ))}
                </div>
            </div>
            {/* UpComing Appointments */}
            <div className="flex flex-col gap-4 mt-4 bg-gray-100 p-4 rounded-md mx-2 w-10/12">
                <AppointmentSection />
            </div>
            {/* Past Appointments */}
        </div>
    )
}

function CurrentAppointmentCard({ appointment }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center flex-wrap">
                <div className="flex flex-row items-center">
                    <Avatar avatarImgScr={avatarAang} size={52} />
                    <div className="flex flex-col ml-5 items-start gap-1">
                        <h1 className="text-lg font-semibold flex flex-row items-center gap-3">
                            <FaUserDoctor size={16} />
                            {appointment.name}
                        </h1>
                        <p className="text-sm flex flex-row gap-3 items-center">
                            <MapPinned size={16} />
                            {appointment.location}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col">
                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                        <Banknote size={24} />
                        {appointment.fees}
                    </p>
                </div>
                <div className="flex flex-row mr-16 gap-4">
                    <button className="bg-green-600 hover:scale-90 transition ease-in w-20 text-white px-2 py-1 rounded-md ">
                        Join
                    </button>
                    <button className="bg-red-600 hover:scale-90 transition ease-in w-20 text-white px-2 py-1 rounded-md ">
                        End
                    </button>
                </div>
            </div>
        </div>
    )
}

function AppointmentSection({ appointments }) {
    const filterOptions = useRef([
        {
            name: "Upcoming",
            rule: (appointments) => appointments.filter(appointment => appointment.date > new Date())
        },
        {
            name: "Past",
            rule: (appointments) => appointments.filter(appointment => appointment.date < new Date())
        },
        {
            name: "Custom Date: ",
            date: new Date(),
            rule: function (appointments) {
                return appointments.filter(appointment => appointment.date === this.date)
            }
        }
    ])

    const [selectionCriteria, setSelectionCriteria] = useState(filterOptions.current[0])
    const selectionCriteriaRef = useRef(filterOptions.current[0])
    const [selectedAppointments, setSelectedAppointments] = useState(appointments)
    const [date, setDate] = useState(new Date())

    useEffect(() => {
        console.log("Selection Criteria Changed", selectionCriteria)
        console.log(new Date(selectionCriteria.date))
    }, [selectionCriteria])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
                <h1 className="text-base font-semibold capitalize">
                    {selectionCriteria.name + "" + (selectionCriteria.date)} Appointments
                </h1>
                <Popover>
                    <PopoverTrigger className="bg-white px-3 py-1 rounded-md border-gray-500 border">
                        {selectionCriteria.name}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto">
                        <h1 className="w-full text-center">Filter by</h1>
                        <Separator />
                        <div className="gap-1 flex flex-col items-start mt-5 w-full ">
                            <div className="w-full ">
                                <button className="hover:bg-gray-300 rounded text-black w-full px-3" onClick={() => {
                                    setSelectionCriteria(filterOptions.current[0])
                                }}>Upcoming</button>
                            </div>
                            <div className="w-full ">
                                <button className="hover:bg-gray-300 rounded text-black w-full px-3" onClick={() => {
                                    setSelectionCriteria(filterOptions.current[1])
                                }}>Past</button>
                            </div>
                            <div className="w-full ">
                                <Popover onOpenChange={(e) => {
                                    if (e === false) {
                                        setSelectionCriteria({ ...filterOptions.current[2], date: date })
                                    }
                                }}>
                                    <PopoverTrigger className="hover:bg-gray-300 rounded text-black w-full px-3">
                                        Custom Date
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(selectedDate) => {
                                                setDate(selectedDate)
                                                filterOptions.current[2].date = selectedDate
                                            }}
                                            className="rounded-md"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}