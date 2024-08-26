'use client'

import { useSessionContext } from "@/app/context/sessionContext"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { displayDate, radicalGradient, worksByIdUrl, workStatus } from "@/utils/constants"
import { CalendarIcon, Loader, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export default function WorkPage() {
    const [workInfo, setWorkInfo] = useState({
        "address": "Chittagong, Bangladesh",
        "userFullName": "Sadatul",
        "description": "sequat venenatis.sdfasdfsdfsdf ",
        "providerMail": "2005077@ugrad.cse.buet.ac.bd",
        "title": "WestHamFix with the help of Social Media",
        "userId": 2,
        "tags": ["NURSING"],
        "createdAt": "2024-08-24T12:45:24",
        "providerId": 3,
        "id": 5,
        "providerName": "Dr. Sadi Ahmed",
        "status": workStatus.POSTED,
        "providerContactNumber": "01730445524",
        "username": "sadatulislamsadi@gmail.com"
    })
    const [isOwnerOrProvider, setIsOwnerOrProvider] = useState(false)
    const [loading, setLoading] = useState(true)
    const sendMessageRef = useRef(null)
    const sessionContext = useSessionContext()

    useEffect(() => {
        axiosInstance.get(worksByIdUrl).then((response) => {
            setWorkInfo(response.data)
            setIsOwnerOrProvider(response.data.isOwnerORProvider)
        }).catch((error) =>
            console.log(error)
        ).finally(() => {
            setLoading(false)
        })
    }, [])

    const deleteWork = () => { }
    const reserveWork = () => { }
    const sendMessage = (messageText) => { }
    const rejectWork = () => { }
    const finishWork = () => { }
    const removeProvider = () => { }

    if (!sessionContext.sessionData) return null
    if (loading) return <Loader size={44} className="animate-spin m-auto" />

    return (
        <div className={cn("flex flex-col w-full flex-1 p-6 gap-6", radicalGradient, "from-zinc-200 to-zinc-100")}>
            <div className="w-7/12 flex flex-col bg-white gap-3 p-4 mt-5">
                <div className="flex flex-col gap-1 w-full">
                    <div className="flex flex-row items-center gap-3 px-3">
                        <h1 className="text-lg font-bold text-center">{workInfo.title}</h1>
                        <Badge className={cn(workInfo.status === workStatus.FINISHED && "bg-blue-700", workInfo.status === workStatus.ACCEPTED && "bg-red-700", workInfo.status === workStatus.POSTED && "bg-green-700", "text-white text-xs")}>
                            {workInfo.status}
                        </Badge>
                    </div>
                    <div className="flex flex-col gap-1 w-full px-3">
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-row items-center gap-4">
                                {isOwnerOrProvider &&
                                    <span className="text-sm text-gray-800">{workInfo.userFullName}</span>
                                }
                                {isOwnerOrProvider &&
                                    <Link href={`mailto:${workInfo.username}`} className="text-sm text-gray-800 flex items-center gap-1">
                                        <Mail size={20} /> {workInfo.username}
                                    </Link>
                                }
                                <p className="text-sm text-gray-800 flex items-center gap-1">
                                    <CalendarIcon size={20} /> {displayDate(workInfo.createdAt)}
                                </p>
                            </div>
                        </div>
                        {workInfo.address && <p className="text-sm text-gray-800">{workInfo.address}</p>}
                        <div className="flex flex-row gap-2 items-center">
                            {workInfo.tags.map((tag, index) => (
                                <Badge key={index} className="bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-700">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <p className="text-base text-gray-800 break-all px-3">{workInfo.description}</p>
                <div className="flex flex-row items-center w-full justify-between pt-5 pb-2 px-3">
                    {sessionContext.sessionData.userId === workInfo.providerId &&
                        <div className="flex flex-row gap-3 items-center">
                            <textarea className="w-48 h-10 border border-gray-300 rounded-md p-1" placeholder="Enter your message" ref={sendMessageRef} onChange={(e) => {
                                sendMessageRef.current.style.height = "auto"
                                sendMessageRef.current.style.height = (sendMessageRef.current.scrollHeight + 1) + "px"
                            }} />
                            <button className="bg-blue-600 text-white w-32 rounded-md h-8 hover:scale-95 hover:bg-opacity-90" onClick={() => { sendMessage(sendMessageRef.current.value.trim()) }}>Send Message</button>
                        </div>
                    }
                    <div className="flex flex-row gap-3 items-center">
                        {(sessionContext.sessionData.userId === workInfo.userId) &&
                            <button className={cn("bg-red-600 text-white w-28 rounded-md h-8 hover:scale-95 hover:bg-opacity-90")} onClick={() => { deleteWork() }}>
                                Delete Work
                            </button>
                        }
                        {(sessionContext.sessionData.userId !== workInfo.userId && workInfo.status === workStatus.POSTED) &&
                            <button className={cn("bg-green-600 text-white w-28 rounded-md h-8 hover:scale-95 hover:bg-opacity-90")} onClick={() => {
                                reserveWork()
                            }}>
                                Accept Work
                            </button>
                        }
                        {(sessionContext.sessionData.userId === workInfo.providerId && workInfo.status === workStatus.POSTED) &&
                            <button className="bg-red-600 text-white w-28 rounded-md h-8 hover:scale-95 hover:bg-opacity-90" onClick={() => { rejectWork() }}>
                                Reject Work
                            </button>
                        }
                        {(sessionContext.sessionData.userId === workInfo.providerId || sessionContext.sessionData.userId === workInfo.userId) && workInfo.status !== workStatus.FINISHED &&
                            <button className="bg-gray-800 text-white w-28 rounded-md h-8 hover:scale-95 hover:bg-opacity-90" onClick={() => { finishWork() }}>
                                Finish Work
                            </button>
                        }
                    </div>
                </div>
            </div>
            {(sessionContext.sessionData.userId === workInfo.userId && workInfo.providerId) &&
                <div className="flex flex-col gap-5 w-7/12 p-4 rounded bg-white">
                    <div className="flex flex-row gap-2 items-center justify-between">
                        <h1 className="text-lg font-bold">Provider details</h1>
                        <button className="h-8 w-40 text-white rounded bg-red-700 hover:bg-opacity-90 hover:scale-95">
                            Remove Provider
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 items-center">
                            <p className="text-sm text-gray-800">{workInfo.providerName}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <p className="text-sm text-gray-800">
                                <Mail size={20} />
                            </p>
                            <Link href={`mailto:${workInfo.providerMail}`} className="text-sm text-gray-800">{workInfo.providerMail}</Link>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <p className="text-sm text-gray-800">
                                <Phone size={20} />
                            </p>
                            <p className="text-sm text-gray-800">{workInfo.providerContactNumber}</p>
                        </div>
                    </div>
                </div>
            }
        </div >
    )
}