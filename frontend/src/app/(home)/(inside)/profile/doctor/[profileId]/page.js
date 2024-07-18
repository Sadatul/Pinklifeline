'use client'

import Profile from "@/app/components/profilePageDoctor"
import { useParams } from "next/navigation"

export default function ProfilePage() {
    const params = useParams()
    return (
        <Profile profileId={params.profileId} section={0} />
    )
}