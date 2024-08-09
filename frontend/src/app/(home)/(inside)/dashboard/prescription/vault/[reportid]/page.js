'use client'

import Loading from "@/app/components/loading"
import { PrescriptionDescriptionComponent } from "@/app/components/vault"
import axiosInstance from "@/utils/axiosInstance"
import { getReportByIdUrl } from "@/utils/constants"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function ReportDescriptionPage() {
    const params = useParams()
    const [report, setReport] = useState(null)
    const [fetchAgain, setFetchAgain] = useState(true)

    useEffect(() => {
        if (fetchAgain) {
            axiosInstance.get(getReportByIdUrl(params.reportid)).then((res) => {
                setReport(res.data)
                console.log("Report fetched ",res.data)
                setFetchAgain(false)
            }).catch((err) => {
                console.log(err)
                setFetchAgain(false)
            })
        }
    }, [fetchAgain])

    if (!report) return <Loading />
    return (
        <PrescriptionDescriptionComponent report={report} setReport={setReport} setFetchAgain={setFetchAgain} />
    )
}