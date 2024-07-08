'use client'
import { useRef } from "react"
import { useParams  } from "next/navigation"
import { toast } from "sonner";

export default function Profile()
{
    const params = useParams();
    const funcRef = useRef(null)
    funcRef.current = () => {
        console.log('Hello')
        toast.message('Hello')
    }
    return (
        <div>
            <h1>Profile:{params.profileId}</h1>
            <button onClick={funcRef.current} className="border-2 p-3">Click</button>
        </div>
    )
}