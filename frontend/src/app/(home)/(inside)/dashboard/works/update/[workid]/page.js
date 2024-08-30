'use client'

import AddWork from "@/app/components/worksComponents"
import axiosInstance from "@/utils/axiosInstance"
import { worksByIdUrl } from "@/utils/constants"
import { Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function UpdateWorkPage() {
    const params = useParams()
    const [loading, setLoading] = useState(false)
    const [workInfo, setWorkInfo] = useState(null)

    useEffect(() => {
        if (params?.workid) {
            setLoading(true)
            axiosInstance.get(worksByIdUrl(params.workid)).then(res => {
                setWorkInfo(res.data)
            }).catch(err => {
                console.error(err)
            }).finally(() => {
                setLoading(false)
            })
        }
    }, [params])

    if (!params?.workid) return <div className="m-auto text-2xl bg-red-600">Invalid Work Id</div>
    if (loading) return <Loader2 size={32} className="animate-spin m-auto" />

    return (
        <AddWork workInfo={workInfo} isUpdate={true} />
    )
}