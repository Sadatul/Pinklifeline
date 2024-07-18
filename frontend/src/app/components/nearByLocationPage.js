'use client'
import { useEffect, useState } from "react"
import MapView from "./map"
import Loading from "./loading"
import { cellToLatLng } from "h3-js"
import { useSessionContext } from "@/app/context/sessionContext"
import axios from "axios"
import { getNearByUsers } from "@/utils/constants"
import { toast } from "sonner"



export function LocationPage() {
    const sessionContext = useSessionContext()
    const dummyData = [
        { "id": 4, "fullName": "Dimtri Islam", "location": "883cf17603fffff" },
        { "id": 7, "fullName": "Samiha Islam", "location": "883cf17601fffff" },
        { "id": 3, "fullName": "Faria Islam", "location": "883cf1760bfffff" }
    ]
    const [nearByUsers, setNearByUsers] = useState()
    const [currentLocation, setCurrentLocation] = useState(null)

    useEffect(() => {
        if (sessionContext.sessionData) {
            const headers = {
                "Authorization": `Bearer ${sessionContext.sessionData.token}`
            }
            axios.get(getNearByUsers(sessionContext.sessionData.userId), {
                headers: headers
            }).then((res) => {
                console.log("nearByUsers", res.data)
                let updatedUser = [];
                for (const user of res.data) {
                    const latlng = cellToLatLng(user.location)
                    updatedUser.push({
                        ...user,
                        location: {
                            lat: latlng[0],
                            lng: latlng[1]
                        }
                    })
                }
                setNearByUsers(updatedUser)
            }).catch((err) => {
                console.log("error", err)
                toast.error("Error", {
                    description: "Failed to get near by users"
                })
            })
        }
    }, [sessionContext.sessionData])



    return (
        <div className="flex flex-col flex-1 relative ">
            <MapView viewAll={true} nearByUsers={nearByUsers} setNearByUsers={setNearByUsers} position={currentLocation} setPosition={setCurrentLocation} />
            <h1 className="text-xl font-bold absolute  top-5 right-36 flex flex-row bg-gray-50 z-10 items-start rounded-md p-2">
                <p className="">Near By Users</p>
            </h1>
        </div>
    )
}