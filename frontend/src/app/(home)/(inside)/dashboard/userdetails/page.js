'use client'

import { EditDoctorDetailsPage } from "@/app/components/editDoctorDetails"
import { EditUserDetailsPage } from "@/app/components/editUserDetails"
import Loading from "@/app/components/loading"
import { useSessionContext } from "@/app/context/sessionContext"
import { roles } from "@/utils/constants"
import { useState } from "react"

export default function Page() {
    const [userData, setUserData] = useState({
        "fullName": "Sadatul",
        "weight": 58.0,
        "height": 25.0,
        "cancerHistory": "Y",
        "cancerRelatives": ["Aunt", "Samiha"],
        "lastPeriodDate": "2000-08-08",
        "avgCycleLength": 5,
        "periodIrregularities": ["Higher pain", "Longer than average cycles"],
        "allergies": ["Peanut"],
        "organsWithChronicConditions": ["Heart", "Throat"],
        "medications": [
            {
                "name": "Napa Extra",
                "doseDescription": "3 times a day"
            },
            {
                "name": "Napa Extra",
                "doseDescription": "3 times a day"
            }
        ],
        "dob": "2000-08-08",
        "cancerStage": "SURVIVOR",
        "diagnosisDate": "2020-08-03",
        "location": "sdfasdfdsfsdfjsdfjfds",
    })
    const sessionContext = useSessionContext()

    if (!sessionContext.sessionData || !userData) return <Loading chose="hand" />
    if( sessionContext.sessionData.role === roles.patient) return <EditUserDetailsPage isPatient={sessionContext.sessionData.role === roles.patient} userData={userData} setUserData={setUserData} />
    if (sessionContext.sessionData.role === roles.doctor) return <EditDoctorDetailsPage />

}