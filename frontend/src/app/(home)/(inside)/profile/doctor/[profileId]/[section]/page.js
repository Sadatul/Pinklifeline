'use client'

import DoctorProfile from "@/app/components/profilePageDoctor"
import { useParams } from "next/navigation"

export default function ProfilePageSectioned(){
    const params = useParams()
    return(
        <DoctorProfile profileId={params.profileId} section={params.section} />
    )
}