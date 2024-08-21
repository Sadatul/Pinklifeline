'use client'

import Loading from "@/app/components/loading"
import { PrescriptionDescriptionComponent } from "@/app/components/vault"
import axiosInstance from "@/utils/axiosInstance"
import { getReportByIdUrl } from "@/utils/constants"
import { Ban } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function ReportDescriptionPage() {
    const params = useParams()
    const [report, setReport] = useState(null)
    const [fetchAgain, setFetchAgain] = useState(true)
    const [forbidded, setForbidded] = useState(false)

    useEffect(() => {
        if (fetchAgain) {
            axiosInstance.get(getReportByIdUrl(params.reportid)).then((res) => {
                setReport(res.data)
                console.log("Report fetched ",res.data)
                setFetchAgain(false)
            }).catch((error) => {
                console.log(error)
                setFetchAgain(false)
                if(error?.response?.status === 403) {
                    setForbidded(true)
                }
            })
        }
    }, [params.reportid,fetchAgain])

    if (forbidded) return <h1 className="m-auto text-5xl flex items-end gap-2">< Ban size={44} className="text-red-600" /> Forbidden < Ban size={44} className="text-red-600" /> </h1>
    if (!report) return <Loading />
    return (
        <PrescriptionDescriptionComponent report={report} setReport={setReport} setFetchAgain={setFetchAgain} />
    )
}