'use client'

import { EditDoctorDetailsPage } from "@/app/components/editDoctorDetails"
import { EditUserDetailsPage } from "@/app/components/editUserDetails"
import Loading from "@/app/components/loading"
import { useSessionContext } from "@/app/context/sessionContext"
import axiosInstance from "@/utils/axiosInstance"
import { roles, userInfoRegUrlReq } from "@/utils/constants"
import { useEffect, useState } from "react"

export default function Page() {
  const [userData, setUserData] = useState(null)
  const sessionContext = useSessionContext()

  useEffect(() => {
    if (sessionContext.sessionData) {
      axiosInstance.get(userInfoRegUrlReq(sessionContext.sessionData.userId, sessionContext.sessionData.role)).then((res) => {
        setUserData(res.data)
      }).catch((err) => {
        console.log(err)
      })
    }
  }, [sessionContext.sessionData])

  if (!sessionContext.sessionData || !userData) return <Loading chose="hand" />
  if (sessionContext.sessionData.role === roles.patient) return <EditUserDetailsPage isPatient={sessionContext.sessionData.role === roles.patient} userData={userData} setUserData={setUserData} />
  if (sessionContext.sessionData.role === roles.doctor) return <EditDoctorDetailsPage userData={userData} setUserData={setUserData} userId={sessionContext.sessionData.userId} />

}