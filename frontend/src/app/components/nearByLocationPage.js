'use client'
import { useState } from "react"
import MapView from "./map"



export function LocationPage() {
    const [nearByUsers, setNearByUsers] = useState(null)
    const [currentLocation, setCurrentLocation] = useState(null)
    // useEffect(() => {
    //     let updatedUser = [];
    //     for (const user of locationOnline) {
    //         const latlng = cellToLatLng(user.location)
    //         updatedUser.push({ ...user, location: latlng })
    //     }
    //     setNearByUsers(updatedUser)
    // }, [])
    return (
        <div className="flex flex-col flex-1 relative ">
            <MapView viewAll={true} nearByUsers={nearByUsers} setNearByUsers={setNearByUsers} position={currentLocation} setPosition={setCurrentLocation} />
            <h1 className="text-xl font-bold absolute  top-3 right-10 w-1/3 flex flex-row bg-gray-50 z-10 items-start rounded-md p-2">
                <p className="">Near By Users</p>
            </h1>
        </div>
    )
}