'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { displayDate, radicalGradient, worksByIdUrl, workStatus } from "@/utils/constants"
import { Loader } from "lucide-react"
import { useEffect, useState } from "react"

export default function WorkPage() {
    const [workInfo, setWorkInfo] = useState({
        "createdAt": "2024-08-24T12:45:24",
        "address": "Dhaka, Bangladesh",
        "description": "sequat venenatis.sdfasdfsdfsdf ",
        "id": 5,
        "title": "WestHamFix with the help of Social Media",
        "tags": ["NURSING"],
        "status": "FINISHED"
    })
    const [isOwnerOrProvider, setIsOwnerOrProvider] = useState(false)
    const [loading, setLoading] = useState(true)

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

    if (loading) return <Loader size={44} className=" animate-spin" />

    return (
        <div className={cn("flex flex-col w-full flex-1 p-6", radicalGradient, "from-zinc-200 to-zinc-100")}>
            <div className="w-10/12 flex flex-col bg-white gap-3 p-4">
                <div className="flex flex-col gap-1 w-full">
                    <div className="flex flex-row items-center gap-3">
                        <h1 className="text-lg font-bold text-center">{workInfo.title}</h1>
                        <Badge className={cn(workInfo.status === workStatus.FINISHED && "bg-blue-700", workInfo.status === workStatus.REJECTED && "bg-red-700", workInfo.status === workStatus.POSTED && "bg-green-700", "text-white text-xs")}>
                            {workInfo.status}
                        </Badge>
                    </div>
                    <div className="flex flex-col gap-1 w-full px-3">
                        <div className="flex flex-col gap-2 w-full">
                            <p className="text-sm text-gray-800">{displayDate(workInfo.createdAt)}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            {workInfo.tags.map((tag, index) => (
                                <Badge key={index} className="bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-700">{tag}</Badge>
                            ))}
                        </div>
                        {workInfo.address && <p className="text-sm text-gray-800">{workInfo.address}</p>}
                    </div>
                </div>
                <p className="text-base text-gray-800 break-all">{workInfo.description}</p>

            </div>
        </div >
    )
}