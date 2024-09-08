'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import { useSessionContext } from "@/app/context/sessionContext"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { AdminPagesInfos, adminSendNotifications, DashboardPagesInfos, pagePaths, radicalGradient, roles } from "@/utils/constants"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Layout({ children }) {
    const pathname = usePathname()
    const [isVerified, setIsverified] = useState(false)
    const sessionContext = useSessionContext()
    useEffect(() => {
        if (!(sessionContext?.sessionData?.role === roles.admin)) {
            // window.location.href = pagePaths.login
        }
    }, [sessionContext.sessionData])

    if (!isVerified) return null
    return (
        <div className="flex flex-1 overflow-hidden text-black">
            {/* Sidebar */}
            <div className={cn(radicalGradient, "from-zinc-200 to-zinc-50", "w-64 h-full items-center flex flex-col p-4 mr-[2px] rounded-r-lg")}>
                <h1 className="text-gray-950 text-2xl font-bold">Dashboard</h1>
                <div className="flex flex-col gap-6 flex-1  mb-10 justify-between">
                    <div className="flex flex-col gap-6 flex-1 justify-center mb-10">
                        {AdminPagesInfos.map((page, index) => (
                            <Link key={index} href={page.link} className={cn("text-black text-xl text-center w-52 py-1", pathname === page.link ? "bg-zinc-400 rounded bg-opacity-50" : "text-shadow-lg")} >
                                {page.name}
                            </Link>
                        ))}
                    </div>
                    <button className="text-gray-200 text-xl text-center w-52 py-1 shadow rounded border border-gray-100 bg-gray-600 hover:scale-95 hover:shadow-inner" onClick={() => {
                        axiosInstance.get(adminSendNotifications).then((res) => {
                            toast.success("Success sending todays notifications forcefully")
                        }).catch((error) => {
                            toast.error("Error sending todays notification forcefully")
                        })
                    }}>
                        Send Notifications
                    </button>
                </div>
            </div>
            <ScrollableContainer className="flex flex-col flex-grow overflow-y-auto ml-[2px] rounded-l-lg overflow-x-hidden break-all">
                {children}
            </ScrollableContainer>
        </div>
    )
}
