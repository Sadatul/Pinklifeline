'use client'

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Banknote, CalendarIcon, Check, CircleCheck, CircleX, Clock, Clock1, Clock10, Clock11, Clock12, Clock2, Clock3, Clock4, Clock5, Clock6, Clock7, Clock8, Clock9, MapPinned, MessageCircleQuestion, Phone, X } from "lucide-react"
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
import { useSessionContext } from "@/app/context/sessionContext"
import axios from "axios"
import { acceptAppointmentUrl, appointmentStatus, cancelAppointmentUrl, closeVideoCall, declineAppointmentUrl, getAppointmentsUrl, joinVideoCall, locationOnline, makePaymentUrl, pagePaths, roles } from "@/utils/constants"
import Loading from "./loading"
import { useRouter } from "next/navigation"
import { Person, Person2 } from "@mui/icons-material"
import { Badge } from "@/components/ui/badge"

export function AppointmentsPage() {
    const [disableCard, setDisableCard] = useState(false)
    const [requestedAppointments, setRequestedAppointments] = useState([
        {
            "date": "2024-08-08",
            "fees": 700,
            "patientFullName": "Sadi",
            "locationName": "Rule 2nd phase, Khulna",
            "patientContactNumber": "01730445524",
            "patientID": 2,
            "locationId": 1,
            "isOnline": false,
            "id": 1,
            "time": "07:43:22",
            "isPaymentComplete": false,
            "status": "REQUESTED"
        },
        {
            "date": "2024-08-08",
            "fees": 700,
            "locationName": "Rule 2nd phase, Khulna",
            "patientContactNumber": "01730445524",
            "doctorId": 4,
            "locationId": 1,
            "isOnline": true,
            "id": 2,
            "time": "07:43:22",
            "doctorFullName": "Dr. Adil",
            "isPaymentComplete": true,
            "status": "RUNNING"
        }
    ])
    const [appointments, setAppointments] = useState([
        {
            "date": "2024-08-08",
            "fees": 700,
            "patientFullName": "Sadi",
            "locationName": "Rule 2nd phase, Khulna",
            "patientContactNumber": "01730445524",
            "patientID": 2,
            "locationId": 1,
            "isOnline": false,
            "id": 1,
            "time": "07:43:22",
            "isPaymentComplete": false,
            "status": "REQUESTED"
        },
        {
            "date": "2024-08-08",
            "fees": 700,
            "locationName": "Rule 2nd phase, Khulna",
            "patientContactNumber": "01730445524",
            "doctorId": 4,
            "locationId": 1,
            "isOnline": true,
            "id": 1,
            "time": "07:43:22",
            "doctorFullName": "Dr. Adil",
            "isPaymentComplete": true,
            "status": "RUNNING"
        }
    ])
    const [currentAppointments, setCurrentAppointments] = useState([
        {
            "date": "2024-08-08",
            "fees": 700,
            "patientFullName": "Sadi",
            "locationName": "Rule 2nd phase, Khulna",
            "patientContactNumber": "01730445524",
            "patientID": 2,
            "locationId": 1,
            "isOnline": true,
            "id": 1,
            "time": "07:43:22",
            "isPaymentComplete": true,
            "status": "RUNNING"
        },
        {
            "date": "2024-08-08",
            "fees": 700,
            "locationName": "Rule 2nd phase, Khulna",
            "patientContactNumber": "01730445524",
            "doctorId": 4,
            "locationId": 1,
            "isOnline": true,
            "id": 1,
            "time": "07:43:22",
            "doctorFullName": "Dr. Adil",
            "isPaymentComplete": true,
            "status": "RUNNING"
        }
    ])
    const sessionContext = useSessionContext()

    useEffect(() => {
        if (sessionContext.sessionData) {
            axios.get(getAppointmentsUrl, {
                headers: sessionContext.sessionData.headers
            }).then((res) => {
                let tempAppointments = []
                let tempRequestedAppointments = []
                let tempCurrentAppointments = []
                for (const appointment of res?.data) {
                    if (appointment?.status === appointmentStatus.running) {
                        tempCurrentAppointments.push(appointment)
                    }
                    else if (appointment.status === appointmentStatus.requested) {
                        tempRequestedAppointments.push(appointment)
                    }
                    else {
                        tempAppointments.push(appointment)
                    }
                }
                setAppointments(tempAppointments)
                setCurrentAppointments(tempCurrentAppointments)
                setRequestedAppointments(tempRequestedAppointments)
            }).catch((error) => {
                toast.error("Error fetching appointments. Check internet")
            })
        }
    }, [sessionContext.sessionData])

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
                    {currentAppointments?.map((appointment, index) => (
                        <CurrentAppointmentCard key={index}
                            appointment={appointment}
                            disableCard={disableCard}
                            setDisableCard={setDisableCard} />
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4 mt-4 bg-gray-100 p-4 rounded-md mx-2 w-11/12">
                <h1 className="text-lg font-semibold">Requested Appointments</h1>
                {requestedAppointments?.length > 0 &&
                    <ScrollableContainer className="flex flex-col gap-2 max-h-96 overflow-y-auto overflow-x-hidden w-full">
                        {requestedAppointments?.map((appointment, index) => (
                            <AppointmentCard key={index}
                                appointment={appointment}
                                disableCard={disableCard}
                                setDisableCard={setDisableCard}
                                deleteAppointmentById={(id) => {
                                    setRequestedAppointments(requestedAppointments.filter((appointment, index) => appointment.id != id))
                                }} />
                        ))}
                    </ScrollableContainer>
                }
            </div>
            {/* UpComing Appointments */}
            <div className="flex flex-col gap-4 mt-4 bg-gray-100 p-4 rounded-md mx-2 w-11/12">
                <AppointmentSection
                    appointments={appointments}
                    setAppointments={setAppointments}
                    disableCard={disableCard}
                    setDisableCard={setDisableCard} />
            </div>
            {/* Past Appointments */}
        </div>
    )
}

function CurrentAppointmentCard({ appointment, disableCard, setDisableCard }) {
    const sessionContext = useSessionContext()
    const router = useRouter()
    const clocks = [
        <Clock12 size={20} />,
        <Clock1 size={20} />,
        <Clock2 size={20} />,
        <Clock3 size={20} />,
        <Clock4 size={20} />,
        <Clock5 size={20} />,
        <Clock6 size={20} />,
        <Clock7 size={20} />,
        <Clock8 size={20} />,
        <Clock9 size={20} />,
        <Clock10 size={20} />,
        <Clock11 size={20} />,
    ]

    const joinCall = () => {
        setDisableCard(true)
        const loadingtoast = toast.loading("Joining video call")
        axios.get(joinVideoCall, {
            headers: sessionContext.sessionData.headers
        }).then((res) => {
            //may be changed later the structure is not complete
            const callId = res?.data?.callId
            toast.dismiss(loadingtoast)
            toast.message("Joining call and live prescription")
            const newWindow = window.open(`/videocall/${callId}`, '_blank');
            if (newWindow) {
                newWindow.focus();
            }
            if (sessionContext.sessionData.role === roles.doctor) {
                router.push(pagePaths.doctorLivePrescription(appointment.patientFullName))
            }
            else {
                router.push(pagePaths.patientLivePrescription(appointment.doctorFullName))
            }
            setDisableCard(false)
        }).catch((error) => {
            setDisableCard(false)
            toast.dismiss(loadingtoast)
            toast.error("Error joining call. Call may not be running. Refresh or contact doctor")
        })
    }
    const endAppointment = () => {
        axios.delete(closeVideoCall, {
            headers: sessionContext.sessionData.headers
        }).then((res) => {
            toast.success("Closed running appointment")
        }).catch((error) => {
            toast.error("Error closing appointment. Appointment may not be running anymore.")
        })
    }

    if (!sessionContext.sessionData) return <Loading />
    return (
        <div className="flex flex-row justify-between items-center flex-wrap bg-white p-2 rounded w-full">
            <div className="flex w-1/3 flex-row items-center">
                <div className="flex flex-col ml-5 items-start gap-1">
                    <h1 className="text-lg font-semibold text-black flex flex-row items-center gap-3">
                        {appointment.doctorFullName && <FaUserDoctor size={16} />}
                        {appointment.patientFullName && <Person size={16} />}
                        {appointment.doctorFullName}
                        {appointment.patientFullName}
                    </h1>
                    <p className="text-base flex flex-row gap-3 items-center">
                        <MapPinned size={16} />
                        {appointment.isOnline ? locationOnline : appointment.locationName}
                    </p>
                </div>
            </div>
            <div className="flex w-1/3 flex-col items-center gap-2">
                <div className="flex justify-center items-center gap-4">
                    <p className="text-sm font-semibold flex flex-row items-center gap-2">
                        <CalendarIcon size={20} />
                        {appointment.date}
                    </p>
                    <p className="text-sm font-semibold flex flex-row items-center gap-2">
                        {clocks[Number(appointment?.time?.split(":")[0]) % 12] || <Clock size={20} />}
                        {appointment.time}
                    </p>
                </div>
                <div className="flex justify-center items-center gap-4">
                    <p className="text-sm font-semibold flex flex-row items-center gap-2">
                        <Banknote size={24} />
                        {appointment.fees}
                    </p>
                    <p className="text-sm font-semibold flex flex-row items-center gap-2">
                        <Phone size={20} />
                        {appointment.patientContactNumber}
                    </p>
                </div>
            </div>
            <div className="flex flex-row justify-evenly gap-4 w-1/3">
                <button disabled={disableCard} className="bg-green-600 hover:scale-90 transition ease-in w-20 text-white px-2 py-1 rounded-md " onClick={() => { joinCall() }}>
                    Join
                </button>
                <button disabled={disableCard} className="bg-red-600 hover:scale-90 transition ease-in w-20 text-white px-2 py-1 rounded-md " onClick={() => { endAppointment() }}>
                    End
                </button>
            </div>
        </div>
    )
}


function AppointmentCard({ appointment, disableCard, setDisableCard, deleteAppointmentById }) {
    const sessionContext = useSessionContext()
    const router = useRouter()
    const [opendialog, setOpendialog] = useState(false)
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false)

    const clocks = [
        <Clock12 size={20} />,
        <Clock1 size={20} />,
        <Clock2 size={20} />,
        <Clock3 size={20} />,
        <Clock4 size={20} />,
        <Clock5 size={20} />,
        <Clock6 size={20} />,
        <Clock7 size={20} />,
        <Clock8 size={20} />,
        <Clock9 size={20} />,
        <Clock10 size={20} />,
        <Clock11 size={20} />,
    ]

    const acceptAppointment = (time) => {
        setDisableCard(true)
        axios.put(acceptAppointmentUrl(appointment.id), {
            time: time
        }, {
            headers: sessionContext.sessionData.headers
        }).then((res) => {
            toast.success("Appointment accepted")
            setDisableCard(false)
        }).catch((error) => {
            toast.error("Error accepting appointment.", {
                description: "Patient may canceled the appointment.:)"
            })
            setDisableCard(false)
        })
    }
    const cancelAppointment = () => {
        setDisableCard(true)
        const deleteAppointmentUrl = sessionContext.sessionData.role === roles.doctor ? declineAppointmentUrl(appointment.id) : cancelAppointmentUrl(appointment.id)
        axios.delete(deleteAppointmentUrl, {
            headers: sessionContext.sessionData.headers
        }).then((res) => {
            toast.success("Appointment deleted")
            deleteAppointmentById(appointment.id)
            setDisableCard(false)
        }).catch((error) => {
            toast.error("Error declining or canceling the appointment.")
            setDisableCard(false)
        })
    }

    const makePayment = () => {
        if (sessionContext.sessionData.role === roles.doctor) return
        const name = document.getElementById("payment-name-input").value
        const email = document.getElementById("payment-email-input").value
        const number = document.getElementById("payment-number-input").value
        if (name && email && number) {
            if (number.length !== 11 || isNaN(Number(number)) || !String(number).startsWith("01")) {
                toast.error("Contact Number should be of 11 digits and start with 01")
                return
            }
            console.log(name, email, number)
            const formData = {
                "customerName": name,
                "customerEmail": email,
                "customerPhone": number
            }
            const loadingtoast = toast.loading("Making payment. Don't close the window")
            axios.post(makePaymentUrl(appointment.id), formData, {
                headers: sessionContext.sessionData.headers
            }).then((res) => {
                toast.dismiss(loadingtoast)
                const transictionId = res?.data?.transactionId
                const gatewayUrl = res?.data?.gatewayUrl
                const newWindow = window.open(gatewayUrl, '_blank');
                if (newWindow) {
                    newWindow.focus();
                }
                //need to do velidate with transictionId
            }).catch((error) => {
                toast.dismiss(loadingtoast)
                toast.error("Error occured initating payment")
            })
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
    }

    if (!sessionContext.sessionData) return <Loading />

    return (
        <div disabled className="flex flex-row justify-between items-center w-full my-2 bg-white p-3 rounded-md flex-wrap">
            <div className="flex w-1/3 flex-col ml-5 items-start gap-1">
                <h1 className="text-lg font-semibold text-black flex flex-row items-center gap-3">
                    {appointment.doctorFullName && <FaUserDoctor size={16} />}
                    {appointment.patientFullName && <Person size={16} />}
                    {appointment.doctorFullName}
                    {appointment.patientFullName}
                </h1>
                <p className="text-base flex flex-row gap-3 items-center">
                    <MapPinned size={16} />
                    {appointment.isOnline ? locationOnline : appointment.locationName}
                </p>
            </div>
            <div className="flex w-1/3 flex-col items-center w-auto gap-2">
                <div className="flex justify-center items-center gap-4">
                    <p className="text-sm font-semibold flex flex-row items-center gap-2">
                        <CalendarIcon size={20} />
                        {appointment.date}
                    </p>
                    <p className="text-sm font-semibold flex flex-row items-center gap-2">
                        {clocks[Number(appointment?.time?.split(":")[0]) % 12] || <Clock size={20} />}
                        {appointment.time}
                    </p>
                </div>
                <div className="flex justify-center items-center gap-4">
                    <p className="text-sm font-semibold flex flex-row items-center gap-2">
                        <Banknote size={24} />
                        {appointment.fees}
                    </p>
                    <p className="text-sm font-semibold flex flex-row items-center gap-2">
                        <Phone size={20} />
                        {appointment.patientContactNumber}
                    </p>
                </div>
            </div>
            <div className="flex flex-row w-1/3 items-center justify-between">
                <div className="flex gap-3 justify-end flex-row w-full">
                    <AlertDialog>
                        <AlertDialogTrigger disabled={disableCard} className="bg-red-500 border border-red-500 hover:scale-90 transition ease-in text-white rounded-lg shadow flex flex-row items-center flex-nowrap gap-1 px-2 py-[2px] hover:bg-gray-50 hover:text-red-500">
                            <CircleX size={32} />
                            {sessionContext.sessionData.role === roles.doctor ? "Descline" : "Cancel"}
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
                                        cancelAppointment()
                                    }}
                                >Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    {(sessionContext.sessionData.role === roles.doctor && appointment.status === appointmentStatus.requested) &&
                        <Dialog open={opendialog} onOpenChange={setOpendialog}>
                            <DialogTrigger disabled={disableCard} className="bg-green-500 hover:scale-90 transition ease-in text-white rounded-lg px-2 py-1 shadow flex flex-row items-center flex-nowrap">
                                <CircleCheck size={32} /> Accept
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
                                        <input type="time" id="appointmentTime" className="bg-gray-50 border-2 leading-none border-purple-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="00:00" max="23:59" defaultValue={"00:00"} />
                                    </div>
                                    <button className="bg-green-700 p-1 hover:bg-gray-50 hover:text-green-600 hover:border-green-500 border hover:scale-90 w-9 transition ease-in text-white rounded-md shadow flex flex-row items-center flex-nowrap gap-1"
                                        onClick={() => {
                                            const appointmentTime = document.getElementById("appointmentTime")?.value
                                            console.log(appointmentTime)
                                            acceptAppointment(`${appointmentTime}:00`)
                                            setOpendialog(false)
                                        }}>
                                        <Check size={32} />
                                    </button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    }
                    {
                        sessionContext.sessionData.role === roles.doctor ? (
                            <>
                                <button disabled className={cn("border border-gray-500 flex-col text-balance justify-center items-center  w-20 text-center bg-gray-50 rounded-lg hover:bg-gray-100", appointment.isPaymentComplete ? "text-green-500" : "text-red-500")} >{appointment.isPaymentComplete ? "PAID" : "UNPAID"}</button>
                            </>
                        ) : (
                            <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
                                <DialogTrigger disabled={disableCard || appointment.isPaymentComplete} className={cn("text-green-600 border border-green-600 bg-gray-50 transition gap-2 w-24 ease-in px-2 py-1 rounded-md shadow flex flex-row items-center flex-nowrap", !appointment.isPaymentComplete && "hover:scale-90 text-blue-700 border-blue-700 font-semibold")}>
                                    <Banknote size={32} /> {appointment.isPaymentComplete ? "PAID" : "PAY"}
                                </DialogTrigger>
                                <DialogContent className={"gap-5 w-96"}>
                                    <DialogHeader>
                                        <DialogTitle>Payment</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col items-end m-auto gap-7 w-full">
                                        <form className="flex flex-col w-full gap-4">
                                            <label className="flex flex-row gap-2 justify-between items-center w-full"> Name
                                                <input id="payment-name-input" type="text" className="bg-gray-50 border-2 leading-none border-purple-500 text-gray-900 text-base rounded-lg" />
                                            </label>
                                            <label className="flex flex-row gap-2 justify-between items-center w-full"> Email
                                                <input id="payment-email-input" type="email" className="bg-gray-50 border-2 leading-none border-purple-500 text-gray-900 text-base rounded-lg" />
                                            </label>
                                            <label className="flex flex-row gap-2 justify-between items-center w-full"> Contact Number
                                                <input id="payment-number-input" type="number" className="bg-gray-50 border-2 leading-none border-purple-500 text-gray-900 text-base rounded-lg number-input" />
                                            </label>
                                            <span id="error-message" className="text-red-500"></span>
                                        </form>
                                        <button type="submit" className="bg-green-700 hover:scale-90 w-9 transition ease-in text-white rounded-md shadow flex flex-row items-center flex-nowrap gap-1"
                                            onClick={() => {
                                                makePayment()
                                            }}
                                        >
                                            <Check size={32} />
                                        </button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )
                    }
                </div>
            </div >
        </div >
    )
}

function AppointmentSection({ appointments, setAppointments, disableCard, setDisableCard }) {
    const filterOptions = useRef([
        {
            name: "Upcoming",
            rule: (appointments) => appointments?.filter(appointment => new Date(appointment.date) > new Date())
        },
        {
            name: "Past",
            rule: (appointments) => appointments?.filter(appointment => new Date(appointment.date) < new Date())
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
                return appointments?.filter(appointment => isSameDate(appointment.date, this.date));
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
                    </h1>
                }
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
                {selectedAppointments?.map((selectedAppointment, index) => (
                    <AppointmentCard key={index}
                        appointment={selectedAppointment}
                        disableCard={disableCard}
                        setDisableCard={setDisableCard}
                        deleteAppointmentById={(id) => {
                            setAppointments(appointments.filter((appointment, index) => appointment.id != id))
                            setSelectedAppointments(selectedAppointments.filter((appointment, index) => appointment.id != id))
                        }}
                    />
                ))}
            </ScrollableContainer>
        </div>
    )
}

// function AppointmentCard({ appointment }) {
//     const [opendialog, setOpendialog] = useState(false)
//     const [openPaymentDialog, setOpenPaymentDialog] = useState(false)

//     const cancelAppointment = () => {

//     }

//     return (
//         <div className="flex flex-row justify-between items-center w-full my-2 bg-white p-3 rounded-md">
//             <div className="flex flex-col ml-5 items-start gap-1 w-1/3">
//                 <h1 className="text-lg font-semibold flex flex-row items-center gap-3">
//                     <FaUserDoctor size={16} />
//                     {appointment.name}
//                 </h1>
//                 <p className="text-sm flex flex-row gap-3 items-center">
//                     <MapPinned size={16} />
//                     {appointment.location}
//                 </p>
//             </div>
//             <div className="flex flex-col gap-1 w-1/3">
//                 <p className="flex flex-row items-center gap-2">
//                     <Banknote size={24} />
//                     {appointment.fees}
//                     <Clock size={22} />
//                     {appointment.time}
//                 </p>
//                 <p className="flex flex-row items-center gap-2">
//                     <CalendarIcon size={24} />
//                     {getFormatedDate(appointment.date)}
//                 </p>
//             </div>
//             <div className="flex flex-row w-1/3 items-center justify-between">
//                 <p className="text-lg font-semibold flex flex-row items-center gap-2">
//                     <MessageCircleQuestion size={24} />
//                     {appointment.status}
//                 </p>
//                 <div className="flex gap-2">
//                     <button >

//                     </button>
//                     <AlertDialog>
//                         <AlertDialogTrigger className="bg-red-500 hover:scale-90 transition ease-in text-white rounded-full shadow flex flex-row items-center flex-nowrap gap-1">
//                             <CircleX size={32} />
//                         </AlertDialogTrigger>
//                         <AlertDialogContent>
//                             <AlertDialogHeader>
//                                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                                 <AlertDialogDescription>
//                                     This action cannot be undone. This will permanently delete your
//                                     appointment request.
//                                 </AlertDialogDescription>
//                             </AlertDialogHeader>
//                             <AlertDialogFooter>
//                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                 <AlertDialogAction
//                                     onClick={() => {
//                                         console.log("Appointment Cancelled")
//                                     }}
//                                 >Continue</AlertDialogAction>
//                             </AlertDialogFooter>
//                         </AlertDialogContent>
//                     </AlertDialog>
//                     <Dialog open={opendialog} onOpenChange={setOpendialog}>
//                         <DialogTrigger className="bg-green-500 hover:scale-90 transition ease-in text-white rounded-full shadow flex flex-row items-center flex-nowrap">
//                             <CircleCheck size={32} />
//                         </DialogTrigger>
//                         <DialogContent className={"w-60 gap-5"}>
//                             <DialogHeader>
//                                 <DialogTitle>Add Time </DialogTitle>
//                             </DialogHeader>
//                             <div className="flex flex-row items-center m-auto gap-7">
//                                 <div className="relative">
//                                     <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
//                                         <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
//                                             <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
//                                         </svg>
//                                     </div>
//                                     <input type="time" id="starttime" className="bg-gray-50 border-2 leading-none border-purple-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="00:00" max="23:59" defaultValue={"00:00"} />
//                                 </div>
//                                 <button className="bg-green-500 hover:scale-90 w-9 transition ease-in text-white rounded-md shadow flex flex-row items-center flex-nowrap gap-1"
//                                     onClick={() => {
//                                         setOpendialog(false)
//                                     }}
//                                 >
//                                     <Check size={32} />
//                                 </button>
//                             </div>
//                         </DialogContent>
//                     </Dialog>
//                     {/* <button className="bg-green-500 hover:scale-90 transition ease-in text-white rounded-full shadow flex flex-row items-center flex-nowrap gap-1">
//                     </button> */}
//                     <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
//                         <DialogTrigger className="bg-gray-500 hover:scale-90 transition px-1 gap-2 ease-in text-white rounded-md shadow flex flex-row items-center flex-nowrap">
//                             <Banknote size={32} /> Pay
//                         </DialogTrigger>
//                         <DialogContent className={"gap-5 w-96"}>
//                             <DialogHeader>
//                                 <DialogTitle>Payment</DialogTitle>
//                             </DialogHeader>
//                             <div className="flex flex-col items-end m-auto gap-7 w-full">
//                                 <div className="flex flex-col w-full gap-4">
//                                     <label className="flex flex-row gap-2 justify-between items-center w-full"> Name
//                                         <input id="payment-name-input" type="text" className="bg-gray-50 border-2 leading-none border-purple-500 text-gray-900 text-base rounded-lg" />
//                                     </label>
//                                     <label className="flex flex-row gap-2 justify-between items-center w-full"> Email
//                                         <input id="payment-email-input" type="text" className="bg-gray-50 border-2 leading-none border-purple-500 text-gray-900 text-base rounded-lg" />
//                                     </label>
//                                     <label className="flex flex-row gap-2 justify-between items-center w-full"> Contact Number
//                                         <input id="payment-number-input" type="number" className="bg-gray-50 border-2 leading-none border-purple-500 text-gray-900 text-base rounded-lg number-input" />
//                                     </label>
//                                     <span id="error-message" className="text-red-500"></span>
//                                 </div>
//                                 <button className="bg-green-700 hover:scale-90 w-9 transition ease-in text-white rounded-md shadow flex flex-row items-center flex-nowrap gap-1"
//                                     onClick={() => {
//                                         const name = document.getElementById("payment-name-input").value
//                                         const email = document.getElementById("payment-email-input").value
//                                         const number = document.getElementById("payment-number-input").value
//                                         if (name && email && number) {
//                                             if (number.length < 11 || number.length > 11 || isNaN(number) || String(number).startsWith("0")) {
//                                                 toast.error("Contact Number should be of 11 digits")
//                                                 return
//                                             }
//                                             console.log(name, email, number)
//                                             setOpenPaymentDialog(false)
//                                         }
//                                         else {
//                                             document.getElementById("error-message").innerText = "Error: All is required"
//                                             if (!name) {
//                                                 toast.error("Name is required")
//                                             }
//                                             else if (!email) {
//                                                 toast.error("Email is required")
//                                                 document.getElementById("error-message").innerText = "Emai is required"
//                                             }
//                                             else if (!number) {
//                                                 toast.error("Contact Number is required")
//                                             }
//                                         }

//                                     }}
//                                 >
//                                     <Check size={32} />
//                                 </button>
//                             </div>
//                         </DialogContent>
//                     </Dialog>
//                 </div>
//             </div>
//         </div>
//     )
// }

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
