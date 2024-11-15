'use client'

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Banknote, BanknoteIcon, CalendarCheck, CalendarIcon, Check, CircleCheck, CircleX, Clock, Clock1, Clock10, Clock11, Clock12, Clock2, Clock3, Clock4, Clock5, Clock6, Clock7, Clock8, Clock9, ExternalLinkIcon, LoaderCircle, MapPinned, MessageCircleQuestion, Phone, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { FaUserDoctor } from "react-icons/fa6";
import ScrollableContainer from "./StyledScrollbar"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import axiosInstance from "@/utils/axiosInstance"
import { acceptAppointmentUrl, appointmentStartMsg, appointmentStatus, cancelAppointmentUrl, closeVideoCall, convertCmtoFeetInch, createOnlineMeetingUrl, declineAppointmentUrl, finishAppointmentUrl, frontEndUrl, getAppointmentsUrl, getDoctorBalance, getDoctorBalanceHistory, getVideoCallToekn, joinVideoCall, locationOnline, makePaymentUrl, messageSendUrl, pagePaths, patientInfoUrl, roles, validateTransactionUrl } from "@/utils/constants"
import Loading from "./loading"
import { useRouter } from "next/navigation"
import { Person, Person2 } from "@mui/icons-material"
import { Badge } from "@/components/ui/badge"
import { useStreamVideoClient } from "@stream-io/video-react-sdk"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button, Pagination } from "@mui/material"
import Link from "next/link"
import { useStompContext } from "../context/stompContext"

export function AppointmentsPage() {
    const [disableCard, setDisableCard] = useState(false)
    const [balance, setBalance] = useState(null)
    const [balanceLoading, setBalanceLoading] = useState(false)
    const [balanceHistoryPageNo, setBalanceHistoryPageNo] = useState(1)
    const [requestedAppointments, setRequestedAppointments] = useState([])
    const [appointments, setAppointments] = useState([])
    const [currentAppointments, setCurrentAppointments] = useState([])
    const sessionContext = useSessionContext()
    const [fetchAgain, setFetchAgain] = useState(true)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (sessionContext?.sessionData && fetchAgain) {
            axiosInstance.get(getAppointmentsUrl).then((res) => {
                setCurrentAppointments(res?.data.filter(appointment => appointment.status === appointmentStatus.running))
                setRequestedAppointments(res?.data.filter(appointment => appointment.status === appointmentStatus.requested))
                setAppointments(res?.data.filter(appointment => (appointment.status !== appointmentStatus.running && appointment.status !== appointmentStatus.requested)))
                setFetchAgain(false)
            }).catch((error) => {
                console.log("Error fetching appointments", error)
                if (error.code === "ERR_NETWORK") toast.error("Error fetching appointments. Check your internet connection")
                else toast.error("Error fetching appointments. Try again later")
                setFetchAgain(false)
            })
        }
    }, [sessionContext?.sessionData, fetchAgain])

    if (!sessionContext?.sessionData) return <Loading />

    return (
        <div className="flex flex-col items-center h-full bg-white relative gap-5">
            {(sessionContext?.sessionData.role === roles.doctor) &&
                <div className="absolute top-7 right-10" >
                    <div className="flex flex-row min-w-40 shadow-inner bg-gray-200 rounded-xl items-center justify-center p-1 ">
                        {(balance !== null) ?
                            <div className="flex items-center w-full justify-between px-3 gap-2">
                                <span className="text-sm font-semibold">Balance: {balance}</span>
                                <Link target='_blank' href={pagePaths.dashboardPages.balanceHitoryPage}>
                                    <ExternalLinkIcon size={24} className="cursor-pointer" />
                                </Link>
                            </div>
                            :
                            <>
                                {balanceLoading ? <LoaderCircle size={24} className="animate-spin text-pink-600" />
                                    :
                                    <button className="text-sm text-pink-800 rounded"
                                        onClick={() => {
                                            setBalanceLoading(true)
                                            console.log("Fetching balance")
                                            axiosInstance.get(getDoctorBalance).then((res) => {
                                                console.log("Balance", res?.data?.balance)
                                                setBalance(res?.data?.balance)
                                            }).catch((error) => {
                                                console.log("Error fetching balance", error)
                                            })
                                        }} >
                                        Click to see balance
                                    </button>
                                }
                            </>
                        }
                    </div>
                </div>}
            <h1 className="text-2xl font-bold mt-4">Appointments Page</h1>
            <div className={cn("flex flex-col gap-4 mt-4 bg-gray-100 p-4 rounded-md mx-2 w-11/12 relative flex-wrap", (currentAppointments?.length > 0) ? "" : "hidden")}>
                <span className="absolute flex rounded-full size-3 z-40 -top-1 -right-2 items-center justify-center">
                    <span className="animate-ping inline-flex size-5  rounded-full bg-purple-400 absolute "></span>
                    <span className=" absolute inline-flex rounded-full size-3 bg-purple-500"></span>
                </span>
                <h1 className="text-lg font-semibold">You have currently running Appointments</h1>
                <div className="flex flex-col gap-2 drop-shadow-lg">
                    {currentAppointments?.map((appointment, index) => (
                        <CurrentAppointmentCard key={index}
                            appointment={appointment}
                            disableCard={disableCard}
                            setFetchAgain={setFetchAgain}
                            setDisableCard={setDisableCard} />
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4 mt-4 bg-blue-50 p-4 rounded-xl mx-2 w-11/12">
                <h1 className="text-lg font-semibold">Requested Appointments</h1>
                <Separator className="w-full bg-pink-400 h-[1.5px]" />
                {requestedAppointments?.length > 0 ? (
                    <ScrollableContainer className="flex flex-row gap-8 max-h-96 overflow-y-auto overflow-x-hidden w-full p-3 rounded-md flex-wrap items-center justify-start">
                        {requestedAppointments?.map((appointment, index) => (
                            <AppointmentCard key={index}
                                appointment={appointment}
                                disableCard={disableCard}
                                setDisableCard={setDisableCard}
                                setFetchAgain={setFetchAgain}
                                deleteAppointmentById={(id) => {
                                    setRequestedAppointments(requestedAppointments.filter((appointment, index) => appointment.id != id))
                                }} />
                        ))}
                    </ScrollableContainer>
                ) : (
                    <h1 className="text-lg w-full text-center font-semibold text-blue-800">No Requested Appointments</h1>
                )}
            </div>
            {/* UpComing Appointments */}
            <div className="flex flex-col gap-4 mt-4 bg-zinc-100 p-4 rounded-md mx-2 w-11/12">
                <AppointmentSection
                    appointments={appointments}
                    setAppointments={setAppointments}
                    disableCard={disableCard}
                    setFetchAgain={setFetchAgain}
                    setDisableCard={setDisableCard} />
            </div>
            {/* Past Appointments */}
        </div>
    )
}

function CurrentAppointmentCard({ appointment, disableCard, setDisableCard, setFetchAgain }) {
    const sessionContext = useSessionContext()
    const router = useRouter()
    const clocks = [
        <Clock12 key={0} size={20} />,
        <Clock1 key={1} size={20} />,
        <Clock2 key={2} size={20} />,
        <Clock3 key={3} size={20} />,
        <Clock4 key={4} size={20} />,
        <Clock5 key={5} size={20} />,
        <Clock6 key={6} size={20} />,
        <Clock7 key={7} size={20} />,
        <Clock8 key={8} size={20} />,
        <Clock9 key={9} size={20} />,
        <Clock10 key={10} size={20} />,
        <Clock11 key={11} size={20} />,
    ]

    const joinCall = () => {
        setDisableCard(true)
        const loadingtoast = toast.loading("Joining video call")
        axiosInstance.get(joinVideoCall).then((res) => {
            //may be changed later the structure is not complete
            const callId = res?.data?.callId
            toast.dismiss(loadingtoast)
            toast.message("Joining call and live prescription")
            const newWindow = window.open(`/videocall/${callId}`, '_blank');
            if (newWindow) {
                newWindow.focus();
            }
            if (sessionContext?.sessionData.role === roles.doctor) {
                router.push(pagePaths.dashboardPages.doctorLivePrescription)
            }
            else {
                router.push(pagePaths.dashboardPages.patientLivePrescription)
            }
            setDisableCard(false)
        }).catch((error) => {
            setDisableCard(false)
            toast.dismiss(loadingtoast)
            console.log("Error joining call", error)
            toast.error("Error joining call. Call may not be running. Refresh or contact doctor")
        })
    }
    const endAppointment = () => {
        axiosInstance.delete(closeVideoCall).then((res) => {
            toast.success("Closed running appointment")
            setFetchAgain(true)
        }).catch((error) => {
            console.log("Error closing appointment", error)
            toast.error("Error closing appointment. Appointment may not be running anymore.")
        })
    }

    if (!sessionContext?.sessionData) return <Loading />
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

function AppointmentSection({ appointments, setAppointments, disableCard, setDisableCard, setFetchAgain }) {
    const filterOptions = useRef([
        {
            name: "Unpaid",
            rule: (appointments) => appointments.filter(appointment => ((!appointment.isPaymentComplete) && (appointment.status === appointmentStatus.accepted))).sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
            })
        },
        {
            name: "Paid",
            rule: (appointments) => appointments.filter(appointment => (appointment.isPaymentComplete && appointment.status === appointmentStatus.accepted)).sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
            })
        }
        ,
        {
            name: "Upcoming",
            rule: (appointments) => appointments.filter(appointment => appointment.status === appointmentStatus.accepted).sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
            })
        },
        {
            name: "Past",
            rule: (appointments) => appointments?.filter(appointment => appointment.status === appointmentStatus.finished).sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
            })
        },
        {
            name: "Cancelled",
            rule: (appointments) => appointments?.filter(appointment => appointment.status === appointmentStatus.cancelled).sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
            })
        },
        {
            name: "Declined",
            rule: (appointments) => appointments?.filter(appointment => appointment.status === appointmentStatus.declined).sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
            })
        },
        {
            name: "All",
            rule: (appointments) => appointments.sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
            })
        }
    ]);
    const secondaryFilterOptions = useRef([
        {
            name: "Online",
            rule: (appointments) => appointments.filter(appointment => appointment.isOnline)
        },
        {
            name: "Offline",
            rule: (appointments) => appointments.filter(appointment => !appointment.isOnline)
        },
        {
            name: "All",
            rule: (appointments) => appointments
        }
    ])

    const [selectionCriteria, setSelectionCriteria] = useState(filterOptions.current[2])
    const [secondarySelectionCriteria, setSecondarySelectionCriteria] = useState(secondaryFilterOptions.current[2])
    const [selectedAppointments, setSelectedAppointments] = useState(appointments)
    const [date, setDate] = useState(null)
    const sessionContext = useSessionContext()

    useEffect(() => {
        setSelectedAppointments(selectionCriteria.rule(secondarySelectionCriteria.rule(appointments)))
        console.log("secondarySelectionCriteria", secondarySelectionCriteria.rule(appointments))
    }, [selectionCriteria, appointments, secondarySelectionCriteria])

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-row justify-between items-center">
                <h1 className="text-base capitalize font-semibold">
                    {selectionCriteria?.name} Appointments
                </h1>
                <div className="flex flex-row gap-8">
                    <Popover>
                        <PopoverTrigger className="bg-white px-3 py-1 rounded-md border-gray-300 border min-w-24">
                            {secondarySelectionCriteria?.name}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto">
                            <h1 className="w-full text-center">Filter by</h1>
                            <Separator />
                            <div className="gap-1 flex flex-col items-start mt-5 w-full ">
                                {secondaryFilterOptions.current.map((option, index) => (
                                    <button key={index} className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded-md"
                                        onClick={() => {
                                            setSecondarySelectionCriteria(option)
                                        }}>
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger className="bg-white px-3 py-1 rounded-md border-gray-300 border min-w-24">
                            {selectionCriteria?.name}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto">
                            <h1 className="w-full text-center">Filter by</h1>
                            <Separator />
                            <div className="gap-1 flex flex-col items-start mt-5 w-full ">
                                {filterOptions.current.map((option, index) => (
                                    <button key={index} className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded-md"
                                        onClick={() => {
                                            setSelectionCriteria(option)
                                        }}
                                    >
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <Separator className="w-full bg-pink-400 h-[1.5px]" />
            <ScrollableContainer className="flex flex-row gap-8 max-h-96 overflow-y-auto overflow-x-hidden w-full p-3 rounded-md flex-wrap items-center justify-start ">
                {selectedAppointments?.map((selectedAppointment, index) => (
                    <AppointmentCard key={index}
                        appointment={selectedAppointment}
                        disableCard={disableCard}
                        setDisableCard={setDisableCard}
                        setFetchAgain={setFetchAgain}
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

function AppointmentCard({ appointment, disableCard, setDisableCard, deleteAppointmentById, setFetchAgain }) {
    const sessionContext = useSessionContext()
    const client = useStreamVideoClient();
    const [opendialog, setOpendialog] = useState(false)
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
    const [patientInfo, setPatientInfo] = useState(null)
    const router = useRouter()
    const stompContext = useStompContext()
    // const feedbackMsg = useRef(null)
    const [feedbackMsg, setFeedbackMsg] = useState("")

    const clocks = [
        <Clock12 key={0} size={20} />,
        <Clock1 key={1} size={20} />,
        <Clock2 key={2} size={20} />,
        <Clock3 key={3} size={20} />,
        <Clock4 key={4} size={20} />,
        <Clock5 key={5} size={20} />,
        <Clock6 key={6} size={20} />,
        <Clock7 key={7} size={20} />,
        <Clock8 key={8} size={20} />,
        <Clock9 key={9} size={20} />,
        <Clock10 key={10} size={20} />,
        <Clock11 key={11} size={20} />,
    ]

    const acceptAppointment = (time) => {
        setDisableCard(true)
        axiosInstance.put(acceptAppointmentUrl(appointment.id), {
            time: time
        }).then((res) => {
            toast.success("Appointment accepted")
            setDisableCard(false)
            setFetchAgain(true)
        }).catch((error) => {
            console.log("Error accepting appointment", error)
            toast.error("Error accepting appointment.", {
                description: "Patient may canceled the appointment.:)"
            })
            setDisableCard(false)
        })
    }

    const cancelAppointment = () => {
        setDisableCard(true)
        const deleteAppointmentUrl = sessionContext?.sessionData.role === roles.doctor ? declineAppointmentUrl(appointment.id) : cancelAppointmentUrl(appointment.id)
        axiosInstance.delete(deleteAppointmentUrl).then((res) => {
            toast.success("Appointment deleted")
            deleteAppointmentById(appointment.id)
            setDisableCard(false)
            setFetchAgain(true)
        }).catch((error) => {
            console.log("Error canceling appointment", error)
            toast.error("Error declining or canceling the appointment.")
            setDisableCard(false)
        })
    }

    const startOnlineAppointment = async () => {
        if (!client) {
            console.error("Client is not available");
            return;
        }
        axiosInstance.post(createOnlineMeetingUrl, {
            appointmentId: appointment.id,
        }).then((res) => {
            console.log("Call ID", res.data.callId)
            const call = client.call('default', res.data.callId);
            call.getOrCreate({
                data: {
                    starts_at: new Date(),
                },
            }).then((response) => {
                console.log("Call created");
                console.log(response);
                const message = {
                    sender: sessionContext?.sessionData?.userId,
                    receiverId: appointment?.patientID,
                    message: appointmentStartMsg(`${frontEndUrl}/videocall/${response.call.id}`),
                    timestamp: new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000).toISOString(),
                    type: "TEXT",
                }
                stompContext.stompClientRef.current.publish({
                    destination: messageSendUrl,
                    body: JSON.stringify(message),
                });
                const newWindow = window.open(`/videocall/${response.call.id}`, '_blank');
                if (newWindow) {
                    newWindow.focus();
                }
                router.push(pagePaths.dashboardPages.doctorLivePrescription)
            }).catch((error) => {
                console.error('Failed to create meeting', error);
            });

        }).catch((error) => {
            console.log("Error getting video call", error)
        })
    }

    const sendFeedback = () => {
        const messageObject = {
            sender: sessionContext?.sessionData?.userId,
            receiverId: appointment?.patientID,
            message: `Your appointment is cancelled.Feedback from doctor: ${feedbackMsg}`,
            timestamp: new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000).toISOString(),
            type: "TEXT",
        }
        console.log(messageObject)
        stompContext?.stompClientRef.current?.publish({
            destination: messageSendUrl,
            body: JSON.stringify(messageObject),
        });
        setFeedbackMsg("")
    }

    const makePayment = () => {
        if (sessionContext?.sessionData.role === roles.doctor) return
        const name = document.getElementById("payment-name-input").value
        const email = document.getElementById("payment-email-input").value
        const number = document.getElementById("payment-number-input").value
        if (name && email && number) {
            if (isNaN(Number(number)) && Number(number) > 0) {
                toast.error("Enter valid number")
                return
            }
            console.log(name, email, number)
            const formData = {
                "customerName": name,
                "customerEmail": email,
                "customerPhone": number
            }
            const loadingtoast = toast.loading("Making payment. Don't close the window")
            axiosInstance.post(makePaymentUrl(appointment.id), formData).then((res) => {
                toast.dismiss(loadingtoast)
                setOpenPaymentDialog(false)
                const gatewayUrl = res?.data?.gatewayUrl
                router.push(gatewayUrl)
                //need to do velidate with transictionId
            }).catch((error) => {
                toast.dismiss(loadingtoast)
                console.log("Error making payment", error)
                toast.error("Error occured initating payment")
            })
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

    if (!sessionContext?.sessionData) return <Loading />

    return (
        <div disabled className="flex flex-col justify-between items-center w-[250px] my-2  gap-3 scale-x-90 h-72 border-x bg-pink-100 drop-shadow-xl">
            {sessionContext?.sessionData.role === roles.doctor ?
                <Dialog onOpenChange={(e) => {
                    if (e) {
                        axiosInstance.get(patientInfoUrl(appointment.id)).then((res) => {
                            setPatientInfo(res.data)
                        }).catch((error) => {
                            console.log("Error getting patient info", error)
                        })
                    }
                    else {
                        setPatientInfo(null)
                    }
                }} >
                    <DialogTrigger asChild >
                        <div className="flex w-full flex-col items-center text-black shadow-md justify-center px-3 py-1 rounded-b-full rounded-md scale-x-110 bg-pink-300 h-1/3 cursor-pointer">
                            <h1 className="text-xl font-semibold flex flex-row items-center gap-3 cursor-pointer">
                                {appointment.doctorFullName && <FaUserDoctor size={16} />}
                                {appointment.patientFullName && <Person size={16} />}
                                {appointment.doctorFullName}
                                {appointment.patientFullName}
                            </h1>
                            <p className="text-lg flex flex-row gap-3 items-center">
                                <MapPinned size={16} />
                                {appointment.isOnline ? locationOnline : appointment.locationName}
                            </p>
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>See Patient Info</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Here is your patient info
                        </DialogDescription>
                        <div className="flex flex-col items-start gap-2">
                            {patientInfo ?
                                <>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Full Name: {patientInfo.fullName}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Age: {patientInfo.age}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Height: {convertCmtoFeetInch(patientInfo.height)}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Weight: {patientInfo.weight}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Diagnosis Date: {patientInfo.diagnosisDate}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Cancer Stage: {patientInfo.cancerStage}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Cancer History: {patientInfo.cancerHistory}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Last Period Date: {patientInfo.lastPeriodDate}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Avg Cycle Length: {patientInfo.avgCycleLength}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Perido Irregularities: {patientInfo.periodIrregularities?.join(", ")}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Allergies: {patientInfo.allergies?.join(", ")}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Organs with Chronic Condition: {patientInfo.organsWithChronicConditions?.join(", ")}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Medications : {patientInfo.medications.map(medication => `${medication.name} - ${medication.doseDescription}`)?.join(", ")}
                                    </p>
                                    <p className="text-lg font-semibold flex flex-row items-center gap-2">
                                        Cancer Relatives: {patientInfo.cancerRelatives?.join(", ")}
                                    </p>
                                </>
                                :
                                <>
                                    <LoaderCircle size={48} className="animate-spin text-pink-600" />
                                </>
                            }
                        </div>
                    </DialogContent>
                </Dialog>
                :
                <div className="flex w-full flex-col items-center text-black shadow-md justify-center px-3 py-1 rounded-b-full rounded-md scale-x-110 bg-pink-300 h-1/3">
                    <h1 className="text-xl font-semibold flex flex-row items-center gap-3">
                        {appointment.doctorFullName && <FaUserDoctor size={16} />}
                        {appointment.patientFullName && <Person size={16} />}
                        {appointment.doctorFullName}
                        {appointment.patientFullName}
                    </h1>
                    <p className="text-lg flex flex-row gap-3 items-center">
                        <MapPinned size={16} />
                        {appointment.isOnline ? locationOnline : appointment.locationName}
                    </p>
                </div>
            }
            <div className="flex flex-col items-center gap-2">
                <div className="flex justify-center items-center gap-4">
                    <p className="text-base font-semibold flex flex-row items-center gap-2">
                        <CalendarIcon size={20} />
                        {appointment.date}
                    </p>
                    {appointment.time &&
                        <p className="text-base font-semibold flex flex-row items-center gap-2">
                            {clocks[Number(appointment?.time?.split(":")[0]) % 12] || <Clock size={20} />}
                            {appointment.time}
                        </p>
                    }
                </div>
                <div className="flex justify-center items-center gap-4">
                    <p className="text-base font-semibold flex flex-row items-center gap-2">
                        <Banknote size={24} />
                        {appointment.fees}
                    </p>
                    <p className="text-base font-semibold flex flex-row items-center gap-2">
                        <Phone size={20} />
                        {appointment.patientContactNumber}
                    </p>
                </div>
            </div>
            <div className="flex flex-row w-full items-center justify-between rounded-t-full h-12 scale-x-105 shadow-md">
                {(sessionContext?.sessionData.role === roles.doctor && appointment.status === appointmentStatus.requested) &&
                    <Dialog open={opendialog} onOpenChange={setOpendialog}>
                        <DialogTrigger disabled={disableCard} className="text-green-700 border bg-[#ecfce5]  transition gap-2 flex-1 ease-in shadow flex flex-row items-center justify-center flex-nowrap  h-full">
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
                {((sessionContext?.sessionData.role !== roles.doctor && appointment.status === appointmentStatus.accepted)) &&
                    <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
                        <DialogTrigger disabled={disableCard || appointment.isPaymentComplete} className={cn("text-gray-700 border bg-[#fcf5ef]  transition gap-2 flex-1 ease-in shadow flex flex-row items-center justify-center flex-nowrap  h-full")}>
                            <Banknote size={32} /> {appointment.isPaymentComplete ? "PAID" : "PAY"}
                        </DialogTrigger>
                        <DialogContent className={"gap-5 w-96"}>
                            <DialogHeader>
                                <DialogTitle>Payment</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-end m-auto gap-7 w-full">
                                <form className="flex flex-col w-full gap-4">
                                    <label className="flex flex-row gap-2 justify-between items-center w-full"> Name
                                        <input id="payment-name-input" type="text" className="bg-gray-50 border-2 px-2 py-1 leading-none border-purple-500 text-gray-900 text-base rounded-lg" />
                                    </label>
                                    <label className="flex flex-row gap-2 justify-between items-center w-full"> Email
                                        <input id="payment-email-input" type="email" className="bg-gray-50 border-2 px-2 py-1 leading-none border-purple-500 text-gray-900 text-base rounded-lg" />
                                    </label>
                                    <label className="flex flex-row gap-2 justify-between items-center w-full"> Contact Number
                                        <input id="payment-number-input" type="number" className="bg-gray-50 border-2 px-2 py-1 leading-none border-purple-500 text-gray-900 text-base rounded-lg number-input" />
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
                }
                {(sessionContext?.sessionData.role === roles.doctor && appointment.status === appointmentStatus.accepted && appointment.isOnline) &&
                    <>
                        {!appointment.isPaymentComplete ? (
                            <TooltipProvider delayDuration={400}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button disabled className="text-green-700 border bg-[#ecfce5]  transition gap-2 flex-1 ease-in shadow flex flex-row items-center justify-center flex-nowrap  h-full">
                                            Start Call
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Appointment is not paid</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Dialog >
                                <DialogTrigger asChild>
                                    <button className="text-green-700 border bg-[#ecfce5]  transition gap-2 flex-1 ease-in shadow flex flex-row items-center justify-center flex-nowrap  h-full">
                                        Start Call
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Sure?</DialogTitle>
                                    </DialogHeader>
                                    <DialogDescription>
                                        This will start the video call and live prescription
                                    </DialogDescription>
                                    <DialogFooter>
                                        <DialogClose onClick={startOnlineAppointment} className="border bg-gray-800 text-white hover:scale-95 rounded p-2">
                                            Start Call
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                        )}
                    </>
                }
                {(sessionContext?.sessionData.role === roles.doctor && appointment.status === appointmentStatus.accepted && !appointment.isOnline) &&
                    <AlertDialog>
                        <AlertDialogTrigger disabled={disableCard} className={cn("bg-blue-50 border transition ease-in text-green-500 shadow flex flex-row items-center justify-center flex-nowrap gap-1 flex-1 h-full ")}>
                            Mark Finished
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        axiosInstance.put(finishAppointmentUrl(appointment.id)).then((res) => {
                                            toast.success("Appointment Finished")
                                            setFetchAgain(true)
                                        }).catch((error) => {
                                            console.log("Error finishing appointment", error)
                                            toast.error("Error finishing appointment")
                                        })
                                    }}
                                >Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                }
                {(appointment.status === appointmentStatus.requested || appointment.status === appointmentStatus.accepted) &&
                    <AlertDialog>
                        <AlertDialogTrigger disabled={disableCard} className={cn("bg-blue-200 border transition ease-in text-red-600 shadow flex flex-row items-center justify-center flex-nowrap gap-1 flex-1 h-full ")}>
                            <CircleX size={32} />
                            {sessionContext?.sessionData.role === roles.doctor ? "Decline" : "Cancel"}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    appointment request.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            {sessionContext?.sessionData.role === roles.doctor &&
                                <div className="flex flex-row items-center gap-2 w-full">
                                    <span className="text-base font-semibold">FeedBack</span>
                                    <input type="text" id="feedback" className="bg-gray-50 border-2 px-2 py-1 border-purple-500 text-gray-900 text-base rounded-lg flex-1" value={feedbackMsg} onChange={(e) => {
                                        setFeedbackMsg(e.target.value)
                                    }} />
                                </div>
                            }
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (sessionContext?.sessionData?.role === roles.doctor) {
                                            sendFeedback()
                                        }
                                        cancelAppointment()
                                    }}
                                >Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                }
                {(appointment.status === appointmentStatus.finished) &&
                    <button disabled className="text-green-700 border bg-[#ecfce5]  transition gap-2 flex-1 ease-in shadow flex flex-row items-center justify-center flex-nowrap  h-full">
                        Finished
                    </button>
                }
            </div >
        </div >
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
