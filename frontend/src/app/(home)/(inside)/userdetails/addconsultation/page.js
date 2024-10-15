'use client'

import { DoctorChamberLocationSection } from "@/app/components/formSections"
import { Separator } from "@/components/ui/separator"
import React from "react"

export default function ConsultationLocationPage() {
    return (
        <div className=" w-full bg-cover bg-center flex flex-col justify-center items-center bg-opacity-100 overflow-auto flex-grow" style={{ backgroundImage: `url(${"/userdetails/form-bg.jpg"})` }}>
            <div className="w-full flex-grow justify-center items-center flex flex-col" style={{ background: "rgba(0, 0, 0, 0.6)" }}>
                <div className="bg-gray-100 w-[800px] min-h-[500px] rounded-2xl m-3 flex flex-col items-center justify-evenly py-5">
                    <DoctorChamberLocationSection />
                </div>
            </div>
        </div>
    )
}