'use client'

import Loading from "@/app/components/loading"
import { PrescriptionDescriptionComponent } from "@/app/components/vault"
import { useParams } from "next/navigation"
import { useEffect } from "react"

export default function ReportDescriptionPage(){
    const params = useParams()
    const [report, setReport] = useState(null)

    useEffect(()=>{
        
    },[])

    if(!report) return <Loading />
    return(
        <PrescriptionDescriptionComponent report={report} />
    )
}