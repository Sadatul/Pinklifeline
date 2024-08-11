'use client'

import { EditDoctorDetailsPage } from "@/app/components/editDoctorDetails"
import { EditUserDetailsPage } from "@/app/components/editUserDetails"
import Loading from "@/app/components/loading"
import { useSessionContext } from "@/app/context/sessionContext"
import { roles } from "@/utils/constants"
import { useState } from "react"

export default function Page() {
    const [userData, setUserData] = useState({
        "qualifications":["MBBS","FCPS"],
        "isVerified": "N",
        "registrationNumber": "dfasdfsadfsdfsdfsdfsdf",
        "contactNumber": "01730445524",
        "fullName": "Dr. QQW Ahmed",
        "designation": "Head",
        "department": "Cancer",
        "workplace": "Dhaka Medical College"
      })
    const sessionContext = useSessionContext()

    if (!sessionContext.sessionData || !userData) return <Loading chose="hand" />
    if( sessionContext.sessionData.role === roles.patient) return <EditUserDetailsPage isPatient={sessionContext.sessionData.role === roles.patient} userData={userData} setUserData={setUserData} />
    if (sessionContext.sessionData.role === roles.doctor) return <EditDoctorDetailsPage userData={userData} setUserData={setUserData} />

}