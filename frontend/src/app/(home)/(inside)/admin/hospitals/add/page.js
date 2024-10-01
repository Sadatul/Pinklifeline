'use client'

import { HospitalsInputComponent } from "@/app/components/adminComponents"
import { cn } from "@/lib/utils"
import { radicalGradient } from "@/utils/constants"

export default function AddHospitalPage() {
    return (
        <div className={cn("flex flex-col w-full flex-1 gap-5 items-center p-6", radicalGradient, "from-slate-200 to-slate-100")}>
            <div className="w-10/12 flex flex-col p-5 gap-5 rounded-md bg-white">
            <h1 className="text-2xl text-black">Add Hospital</h1>
                <HospitalsInputComponent isNew={true} />
            </div>
        </div>
    )
}