'use client'

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Banknote, CalendarIcon, Check, CircleCheck, CircleX, Clock, MapPinned, MessageCircleQuestion, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { FaUserDoctor } from "react-icons/fa6";
import ScrollableContainer from "./StyledScrollbar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
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

export function AppointmentsPage() {
    const [currentAppointments, setCurrentAppointments] = useState([
        { name: "Dr. John Doe", speciality: "Dentist", date: "01/01/2022", time: "10:00 AM - 11:00 AM", location: "123 Main Street, New York, NY 10001", fees: "100" }
    ])
    const appointments = [
        {
            name: 'Dr. John Doe',
            location: '123 Health St, Wellness City',
            fees: '$150',
            time: '10:00 AM',
            date: '2024-07-16',  // upcoming
            status: 'Confirmed'
        },
        {
            name: 'Dr. Jane Smith',
            location: '456 Care Ave, Healville',
            fees: '$200',
            time: '11:30 AM',
            date: '2024-06-20',  // past
            status: 'Pending'
        },
        {
            name: 'Dr. Emily Johnson',
            location: '789 Recovery Rd, Theratown',
            fees: '$180',
            time: '02:00 PM',
            date: '2024-07-18',  // upcoming
            status: 'Cancelled'
        },
        {
            name: 'Dr. Michael Brown',
            location: '321 Therapy Ln, Cureburg',
            fees: '$220',
            time: '09:00 AM',
            date: '2024-05-15',  // past
            status: 'Confirmed'
        },
        {
            name: 'Dr. Elizabeth Davis',
            location: '654 Wellness Blvd, Healthtown',
            fees: '$170',
            time: '01:00 PM',
            date: '2024-07-20',  // upcoming
            status: 'Pending'
        },
        {
            name: 'Dr. William Garcia',
            location: '987 Recovery Rd, Theratown',
            fees: '$160',
            time: '03:30 PM',
            date: '2024-04-10',  // past
            status: 'Cancelled'
        },
        {
            name: 'Dr. Sophia Martinez',
            location: '741 Remedy Dr, Treatville',
            fees: '$210',
            time: '11:00 AM',
            date: '2024-07-22',  // upcoming
            status: 'Confirmed'
        },
        {
            name: 'Dr. James Rodriguez',
            location: '852 Cure Ave, Healtown',
            fees: '$140',
            time: '12:30 PM',
            date: '2024-03-08',  // past
            status: 'Pending'
        },
        {
            name: 'Dr. Olivia Wilson',
            location: '963 Recovery Rd, Theratown',
            fees: '$190',
            time: '04:00 PM',
            date: '2024-07-24',  // upcoming
            status: 'Cancelled'
        },
        {
            name: 'Dr. Liam Martinez',
            location: '258 Therapy Ln, Cureburg',
            fees: '$200',
            time: '10:30 AM',
            date: '2024-02-14',  // past
            status: 'Confirmed'
        }
    ];

    return (
        <div className="flex flex-col items-center h-full bg-white">
            <h1 className="text-2xl font-bold mt-4">Appointments Page</h1>
            {/* Current running onlien Appointments */}
            <div className={cn("flex flex-col gap-4 mt-4 bg-gray-100 p-4 rounded-md mx-2 w-11/12 relative flex-wrap", (currentAppointments?.length > 0) ? "" : "hidden")}>
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
            <div className="flex flex-col gap-4 mt-4 bg-gray-100 p-4 rounded-md mx-2 w-11/12">
                <h1 className="text-lg font-semibold">Requested Appointments</h1>
                <ScrollableContainer className="flex flex-col gap-2 h-80 overflow-y-auto overflow-x-hidden w-full">
                    {appointments.map((appointment, index) => (
                        <AppointmentCard key={index} appointment={appointment} />
                    ))}
                </ScrollableContainer>
            </div>
            {/* UpComing Appointments */}
            <div className="flex flex-col gap-4 mt-4 bg-gray-100 p-4 rounded-md mx-2 w-11/12">
                <AppointmentSection appointments={appointments} />
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

// appoinmentFields : doctor name, date , time , location, fees, status:paid or not, requste accepted or not

function AppointmentSection({ appointments = [] }) {
    const filterOptions = useRef([
        {
            name: "Upcoming",
            rule: (appointments) => appointments.filter(appointment => new Date(appointment.date) > new Date())
        },
        {
            name: "Past",
            rule: (appointments) => appointments.filter(appointment => new Date(appointment.date) < new Date())
        },
        {
            name: "Custom Date: ",
            date: new Date(),
            rule: function (appointments) {
                console.log("Custom Date", this.date)
                console.log("Appointments", appointments)
                for (const appointment of appointments) {
                    console.log("Appointment Date", new Date(appointment.date))
                    if (isSameDate(appointment.date, this.date)) {
                        console.log("Found")
                    }
                }
                return appointments.filter(appointment => isSameDate(appointment.date, this.date));
            }
        },
        {
            name: "All",
            rule: (appointments) => appointments
        }
    ])

    const [selectionCriteria, setSelectionCriteria] = useState(filterOptions.current[0])
    const selectionCriteriaRef = useRef(filterOptions.current[0])
    const [selectedAppointments, setSelectedAppointments] = useState(appointments)
    const [date, setDate] = useState(null)

    useEffect(() => {
        console.log("Selection Criteria Changed", selectionCriteria)
        setSelectedAppointments(selectionCriteria.rule(appointments))
    }, [selectionCriteria])

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-row justify-between items-center">
                {!selectionCriteria.date &&
                    <h1 className="text-base capitalize font-semibold">
                        {selectionCriteria.name} Appointments
                    </h1>}
                {selectionCriteria.date &&
                    <h1 className="text-base capitalize">
                        {selectionCriteria.name} Appointments on {getFormatedDate(date)}
                    </h1>}
                <Popover>
                    <PopoverTrigger className="bg-white px-3 py-1 rounded-md border-gray-500 border w-24">
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
                                    if (e === false && date) {
                                        setSelectionCriteria({ ...filterOptions.current[2], date: date })
                                    }
                                }}>
                                    <PopoverTrigger className="hover:bg-gray-300 rounded text-black w-full px-3">
                                        Custom Date
                                    </PopoverTrigger>
                                    <PopoverContent className="mr-10">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(selectedDate) => {
                                                setDate(selectedDate)
                                                console.log("Selected Date", selectedDate)
                                                filterOptions.current[2].date = selectedDate
                                            }}
                                            className="rounded-md"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="w-full ">
                                <button className="hover:bg-gray-300 rounded text-black w-full px-3" onClick={() => {
                                    setSelectionCriteria(filterOptions.current[3])
                                }}>All</button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <Separator className="w-full bg-pink-400 h-[1.5px]" />
            <ScrollableContainer className="flex flex-col gap-2 h-96 overflow-y-auto overflow-x-hidden w-full">
                {selectedAppointments.map((appointment, index) => (
                    <AppointmentCard key={index} appointment={appointment} />
                ))}
            </ScrollableContainer>
        </div>
    )
}

function AppointmentCard({ appointment }) {
    const [opendialog, setOpendialog] = useState(false)
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false)

    const cancelAppointment = () => {

    }

    return (
        <div className="flex flex-row justify-between items-center w-full my-2 bg-white p-3 rounded-md">
            <div className="flex flex-col ml-5 items-start gap-1 w-1/3">
                <h1 className="text-lg font-semibold flex flex-row items-center gap-3">
                    <FaUserDoctor size={16} />
                    {appointment.name}
                </h1>
                <p className="text-sm flex flex-row gap-3 items-center">
                    <MapPinned size={16} />
                    {appointment.location}
                </p>
            </div>
            <div className="flex flex-col gap-1 w-1/3">
                <p className="flex flex-row items-center gap-2">
                    <Banknote size={24} />
                    {appointment.fees}
                    <Clock size={22} />
                    {appointment.time}
                </p>
                <p className="flex flex-row items-center gap-2">
                    <CalendarIcon size={24} />
                    {getFormatedDate(appointment.date)}
                </p>
            </div>
            <div className="flex flex-row w-1/3 items-center justify-between">
                <p className="text-lg font-semibold flex flex-row items-center gap-2">
                    <MessageCircleQuestion size={24} />
                    {appointment.status}
                </p>
                <div className="flex gap-2">
                    <button >

                    </button>
                    <AlertDialog>
                        <AlertDialogTrigger className="bg-red-500 hover:scale-90 transition ease-in text-white rounded-full shadow flex flex-row items-center flex-nowrap gap-1">
                            <CircleX size={32} />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    appointment request.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        console.log("Appointment Cancelled")
                                    }}
                                >Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Dialog open={opendialog} onOpenChange={setOpendialog}>
                        <DialogTrigger className="bg-green-500 hover:scale-90 transition ease-in text-white rounded-full shadow flex flex-row items-center flex-nowrap">
                            <CircleCheck size={32} />
                        </DialogTrigger>
                        <DialogContent className={"w-60 gap-5"}>
                            <DialogHeader>
                                <DialogTitle>Add Time </DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-row items-center m-auto gap-7">
                                <div className="relative">
                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input type="time" id="starttime" className="bg-gray-50 border-2 leading-none border-purple-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="00:00" max="23:59" defaultValue={"00:00"} />
                                </div>
                                <button className="bg-green-500 hover:scale-90 w-9 transition ease-in text-white rounded-md shadow flex flex-row items-center flex-nowrap gap-1"
                                    onClick={() => {
                                        setOpendialog(false)
                                    }}
                                >
                                    <Check size={32} />
                                </button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {/* <button className="bg-green-500 hover:scale-90 transition ease-in text-white rounded-full shadow flex flex-row items-center flex-nowrap gap-1">
                    </button> */}
                    <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
                        <DialogTrigger className="bg-gray-500 hover:scale-90 transition px-1 gap-2 ease-in text-white rounded-md shadow flex flex-row items-center flex-nowrap">
                            <Banknote size={32} /> Pay
                        </DialogTrigger>
                        <DialogContent className={"gap-5 w-96"}>
                            <DialogHeader>
                                <DialogTitle>Payment</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-end m-auto gap-7 w-full">
                                <div className="flex flex-col w-full gap-4">
                                    <label className="flex flex-row gap-2 justify-between items-center w-full"> Name
                                        <input id="payment-name-input" type="text" className="bg-gray-50 border-2 leading-none border-purple-500 text-gray-900 text-base rounded-lg" />
                                    </label>
                                    <label className="flex flex-row gap-2 justify-between items-center w-full"> Email
                                        <input id="payment-email-input" type="text" className="bg-gray-50 border-2 leading-none border-purple-500 text-gray-900 text-base rounded-lg" />
                                    </label>
                                    <label className="flex flex-row gap-2 justify-between items-center w-full"> Contact Number
                                        <input id="payment-number-input" type="number" className="bg-gray-50 border-2 leading-none border-purple-500 text-gray-900 text-base rounded-lg number-input" />
                                    </label>
                                    <span id="error-message" className="text-red-500"></span>
                                </div>
                                <button className="bg-green-700 hover:scale-90 w-9 transition ease-in text-white rounded-md shadow flex flex-row items-center flex-nowrap gap-1"
                                    onClick={() => {
                                        const name = document.getElementById("payment-name-input").value
                                        const email = document.getElementById("payment-email-input").value
                                        const number = document.getElementById("payment-number-input").value
                                        if (name && email && number) {
                                            if (number.length < 11 || number.length > 11 || isNaN(number) || String(number).startsWith("0")) {
                                                toast.error("Contact Number should be of 11 digits")
                                                return
                                            }
                                            console.log(name, email, number)
                                            setOpenPaymentDialog(false)
                                        }
                                        else {
                                            document.getElementById("error-message").innerText = "Error: All is required"
                                            if (!name) {
                                                toast.error("Name is required")
                                            }
                                            else if (!email) {
                                                toast.error("Email is required")
                                                document.getElementById("error-message").innerText = "Emai is required"
                                            }
                                            else if (!number) {
                                                toast.error("Contact Number is required")
                                            }
                                        }

                                    }}
                                >
                                    <Check size={32} />
                                </button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

function getFormatedDate(date) {
    // return a date with format "dd/mm/yyyy"
    if (typeof date === "string") {
        date = new Date(date)
    }
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}
function isSameDate(date1, date2) {
    if (typeof date1 === "string") {
        date1 = new Date(date1)
    }
    if (typeof date2 === "string") {
        date2 = new Date(date2)
    }
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};
