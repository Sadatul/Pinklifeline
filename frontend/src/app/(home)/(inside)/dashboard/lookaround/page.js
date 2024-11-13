'use client'

import Avatar from "@/app/components/avatar"
import { LocationPage } from "@/app/components/nearByLocationPage"
import { useSessionContext } from "@/app/context/sessionContext"
import axiosInstance from "@/utils/axiosInstance"
import { avatarAang, getNearByUsers, getNearByUsersGeneral, pagePaths } from "@/utils/constants"
import { Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function NearByPage() {
  const sessionContext = useSessionContext()
  const dummyData = [
    { "id": 4, "fullName": "Dimtri Islam", "location": "883cf17603fffff", "profilePicture": avatarAang },
    { "id": 7, "fullName": "Samiha Islam", "location": "883cf17601fffff", "profilePicture": avatarAang },
    { "id": 3, "fullName": "Faria Islam", "location": "883cf1760bfffff", "profilePicture": avatarAang }
  ]
  const [nearByUsers, setNearByUsers] = useState(dummyData)
  const router = useRouter()
  const [viewUser, setViewUser] = useState(false)

  useEffect(() => {
    if (sessionContext?.sessionData) {
      axiosInstance.get(getNearByUsers(sessionContext.sessionData.userId)).then((res) => {
        console.log("nearByUsers", res.data)
        setNearByUsers(res.data)
      }).catch((err) => {
        console.log("error", err)
        toast.error("Error", {
          description: "Failed to get near by users"
        })
      })
    }
  }, [sessionContext?.sessionData])


  return (
    <div className="flex flex-col flex-1 relative items-center bg-slate-200 p-10 gap-4">
      <h1 className="text-2xl font-semibold text-gray-800">Near By Users</h1>
      <div className="flex flex-col w-96 p-3 rounded-xl shadow-lg bg-white scale-110">
        {nearByUsers?.length === 0 && <div className="text-center">No near by users found</div>}
        {nearByUsers?.length > 0 && nearByUsers.map((user, index) =>
          <div className="flex flex-row items-center justify-between p-1 border-b border-gray-200" key={index}>
            <div className="flex flex-row items-center gap-2">
              <Avatar avatarImgSrc={user.profilePicture} size={40} />
              <span className="text-base font-semibold">{user.fullName}</span>
            </div>
            <button className="bg-indigo-800 px-4 py-1 rounded-xl text-white"
              onClick={() => {
                setViewUser(true)
                router.push(pagePaths.userProfile(user.id))
              }}>
              {viewUser ? <Loader className="animate-spin" /> : "View"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}