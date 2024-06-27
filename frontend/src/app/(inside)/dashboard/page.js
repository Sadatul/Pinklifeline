'use client'
import MapView from "@/app/components/map"

export default function Dashboard() {

    return (
        <div className="w-full h-[600px] flex flex-col justify-center items-center">
            <h1 className="text-3xl">Map with open source</h1>
            <MapView />
        </div>
    )
}