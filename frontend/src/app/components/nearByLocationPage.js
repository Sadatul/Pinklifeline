'use client'
import { useEffect, useState } from "react"
import MapView from "./map"
import Loading from "./loading"
import { cellToLatLng } from "h3-js"



export function LocationPage() {
    const [initialized, setInitialized] = useState(false)
    const [nearByUsers, setNearByUsers] = useState([
        { "id": 4, "fullName": "Dimtri Islam", "location": "883cf17603fffff" },
        { "id": 7, "fullName": "Samiha Islam", "location": "883cf17601fffff" },
        { "id": 3, "fullName": "Faria Islam", "location": "883cf1760bfffff" }
    ])
    const [currentLocation, setCurrentLocation] = useState(null)
    useEffect(() => {
        let updatedUser = [];
        for (const user of nearByUsers) {
            const latlng = cellToLatLng(user.location)
            updatedUser.push({
                ...user,
                location: {
                    lat: latlng[0],
                    lng: latlng[1]
                }
            })
        }
        console.log("updatedUser", updatedUser)
        setNearByUsers(updatedUser)
        setInitialized(true)
    }, [])
    return (
        <div className="flex flex-col flex-1 relative ">
            {initialized ? (
                <>
                    <MapView viewAll={true} nearByUsers={nearByUsers} setNearByUsers={setNearByUsers} position={currentLocation} setPosition={setCurrentLocation} />
                    <h1 className="text-xl font-bold absolute  top-5 right-36 flex flex-row bg-gray-50 z-10 items-start rounded-md p-2">
                        <p className="">Near By Users</p>
                    </h1>
                </>
            ) : (
                <Loading chose="hand" />
            )}
        </div>
    )
}