'use client'
import { useContext } from "react"
import { AuthContext } from "../../components/authContexts"

export default function Dashboard() {
    const authInfo = useContext(AuthContext)

    return (
        <div className="w-full flex flex-col justify-center items-center">
            <h1 className="text-3xl">{authInfo.token}</h1>
        </div>
    )
}