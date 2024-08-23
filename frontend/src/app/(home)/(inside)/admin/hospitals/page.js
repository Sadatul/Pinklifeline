'use client'

import { HospitalsComponent } from "@/app/components/hospitals"

export default function HospitalsPage() {
    return (
        HospitalsComponent({ isAdmin: true })
    )
}