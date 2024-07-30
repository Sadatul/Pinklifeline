'use client'

import axiosInstance from "@/utils/axiosInstance"

export default function TestPage() {
    const handleClick = () => {
        axiosInstance.post("/api/test").then((res) => {
            console.log(res)
        }).catch((error) => {
            console.log(error)
        })
    }
    return (
        <div className="h-screen w-full flex flex-col justify-center items-center">
            <button onClick={handleClick}>Test</button>
        </div>
    )
}