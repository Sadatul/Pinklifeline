'use client'

import Loading from "@/app/components/loading"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { complaintUrl, generateOptionsFromArray, pagePaths, radicalGradient, reportCategories, ReportTypes } from "@/utils/constants"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { toast } from "sonner"

function Report() {
    const searchParams = useSearchParams()
    const id = searchParams.get("contentId")
    const type = searchParams.get("contentType")

    const checkType = (type) => {
        return type === ReportTypes.blog || type === ReportTypes.forumQuestion || type === ReportTypes.forumAnswer
    }

    if (!id || !type || !checkType(type)) {
        return (
            <div className="text-center m-auto flex flex-row justify-center items-center h-full w-full text-3xl text-red-500">
                Proper Content Id or Type is missing. Invalid Complain.
            </div>
        )
    }
    return (
        <div className={cn("m-auto flex flex-col items-center h-full w-full p-5", radicalGradient, "from-gray-200 to-gray-100")}>
            <div className="w-10/12 flex flex-col p-3 bg-white rounded-lg shadow items-start gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                    Report Page for {type} with Id {id}
                </h1>
                <div className="w-full flex flex-col gap-1 items-end">
                    <label className="text-gray-700 flex flex-row items-center gap-3 w-full">
                        <span className="w-1/5">Category</span>
                        <select id="report-category" defaultValue={"select-category"} className="w-fit px-3 py-1 border border-gray-500 rounded-md focus:outline-none">
                            <option value="select-category" disabled>Select Category</option>
                            {generateOptionsFromArray(reportCategories.map((category) => ({ value: category.label, label: category.label })))}
                        </select>
                    </label>
                    <span id="error-msg=select" className="text-red-500 hidden w-4/5 text-left px-3 py-1">Select category</span>
                </div>
                <label className="text-gray-700 flex flex-row items-center gap-3 w-full">
                    <span className="w-1/5">Description</span>
                    <div className="flex-1 flex flex-col gap-1 items-end relative">
                        <textarea id="report-description" maxLength={300} className="w-full min-h-28 px-3 py-1 border border-gray-500 rounded-md shadow-inner" placeholder="Enter Description" onChange={(e) => {
                            document.getElementById("report-description").style.height = "auto"
                            document.getElementById("report-description").style.height = (document.getElementById("report-description").scrollHeight + 10) + "px"
                            document.getElementById("report-description-characters").innerText = `${e.target.value.length}/300`
                        }} />
                        <span id="report-description-characters" className=" absolute bottom-2 right-2 text-sm text-gray-700">0/300</span>
                    </div>
                </label>
                <div className="w-full flex flex-row justify-between items-center gap-3 px-5">
                    <Link href={type === ReportTypes.blog ? pagePaths.blogsPage : pagePaths.forumPage} className="px-5 py-2 w-fit bg-red-500 text-white rounded-md shadow-md hover:shadow-lg hover:scale-95 focus:outline-none">
                        Cancel
                    </Link>
                    <button className="px-5 py-2 w-fit bg-green-500 text-white rounded-md shadow-md hover:shadow-lg hover:scale-95 focus:outline-none" onClick={() => {
                        if (document.getElementById("report-category").value === "select-category") {
                            document.getElementById("error-msg=select").classList.remove("hidden")
                            return
                        }
                        document.getElementById("error-msg=select").classList.add("hidden")
                        axiosInstance.post(complaintUrl, {
                            resourceId: id,
                            type: type,
                            category: document.getElementById("report-category").value,
                            description: document.getElementById("report-description").value
                        }).then((res) => {
                            toast.success("Report submitted successfully")
                            window.location.href = (type === ReportTypes.blog) ? pagePaths.blogsPage : pagePaths.forumPage
                        }).catch((err) => {
                            toast.error("Failed to submit report")
                            console.error(err)
                        })
                    }}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function ReportPage() {
    return (
        <Suspense fallback={<Loading />}>
            <Report />
        </Suspense>
    )
}