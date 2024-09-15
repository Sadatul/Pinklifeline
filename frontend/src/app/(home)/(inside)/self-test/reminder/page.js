'use client'

import Loading from "@/app/components/loading"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import axiosInstance from "@/utils/axiosInstance"
import { pagePaths, selfTestReminderUrl } from "@/utils/constants"
import { useSearchParams } from "next/navigation"
import { Suspense, useDebugValue, useEffect, useRef, useState } from "react"
import { toast } from "sonner"


function ReactReminder() {
    const daysRef = useRef()
    const [showInput, setShowInput] = useState(false)
    const handleSubmission = (days) => {
        axiosInstance.put(selfTestReminderUrl, { 
            days: days
         }).then(res => {
            console.log(res)
            window.location.href = pagePaths.dashboardPages.userdetailsPage
        }).catch(err => {
            console.log(err)
            toast.error("An error occurred")
        })
    }

    return (
        <AlertDialog open={true}>
            <AlertDialogAction>

            </AlertDialogAction>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        This is a reminder
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-900 font-semibold text-sm">
                        Did your period start?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {showInput ? <div className="flex flex-col items-start gap-2">
                    Number of days since period started
                    <input type="number" ref={daysRef} className="number-input rounded px-2 py-1 border border-gray-500" />
                    <div className="flex flex-row justify-end w-full gap-5">
                        <button className="rounded border border-red-600 shadow-inner px-2 py-1 bg-red-100" onClick={() => { setShowInput(false) }}>Cancel</button>
                        <button className="rounded border border-gray-600 shadow-inner px-2 py-1 bg-gray-100" onClick={() => {
                            if (daysRef.current.value) {
                                handleSubmission(daysRef.current.value)
                            }
                            else {
                                toast.error("Please enter the number of days")
                            }
                        }} >Submit</button>
                    </div>
                </div> :
                    <div className="flex flex-row justify-end w-full gap-5">
                        <button className="rounded border border-red-600 shadow-inner px-2 py-1 bg-red-100" onClick={() => {
                            handleSubmission(-1)
                        }}>No</button>
                        <button className="rounded border border-green-600 shadow-inner px-2 py-1 bg-green-100" onClick={() => setShowInput(true)}>Yes</button>
                    </div>
                }
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default function ReactReminderPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ReactReminder />
        </Suspense>
    )
}