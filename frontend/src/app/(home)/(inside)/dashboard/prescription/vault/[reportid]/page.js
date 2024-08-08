'use client'

import Loading from "@/app/components/loading"
import { PrescriptionDescriptionComponent } from "@/app/components/vault"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function ReportDescriptionPage() {
    const params = useParams()
    const [report, setReport] = useState({
        "date": "2024-08-08",
        "summary": "ljdflas ldfsld fjlsdflsdfj lsdfjsldfjsl dfjsldfjsldfjl asdjfljdflasl dfsldfjlsdfl sdfjlsdfjsldf jsldfjsldfjs ldfjlasd jfljdflasldfsl dfjlsdfls dfjlsdfjsl dfjsldfjsl dfjsldfjla sdjfljdfla sldfsldfjl sdflsdfjls dfjsldfjsldfjs ldfjsldfj lasdjfljdf lasldfsldf jlsdflsdf jlsdfjs ldfjsldfj sldfjsldfj lasdjfljdf lasldfsldfj lsdflsdfj lsdfjsldfjs ldfjsldfj sldfjlasdj fljdflasldfs ldfjlsdflsd fjlsdfjsldf jsldfjsldfjs ldfjlasdjf ljdflasldf sldfjlsdflsd fjlsdfjsl dfjsldfjsl dfjsldfjla sdjfljdfla sldfsldfj lsdflsdfjl sdfjsldfj sldfjsldfjs ldfjlasdjf ljdflasldf sldfjlsd flsdfjlsdfjsl dfjsldfjsldfjs ldfjlasdjfl jdflasldfsl dfjlsdflsd fjlsdfjsldfjs ldfjsldfjsl dfjlasdjflj dflasldfsldfj lsdflsdfjl sdfjsldfjsldfj sldfjsld fjlasdjflj dflasldfs ldfjlsdfls dfjlsdfjs ldfjsl dfjsldf jsldfjlas djfljdf lasldfsld fjlsdfl sdfjlsdf jsldfjsldf jsldfjsldf jlasdjfljd flasldfsl dfjlsdflsd fjlsdfjsl dfjsldfjsl dfjsldfj lasdjfljd flasldfsldf jlsdflsdfjlsdf jsldfjsldfjs ldfjsldfj lasdjfljd flasldfsld fjlsdfls dfjlsdf jsldfjsld fjsldfjsldf jlasdjfljd flasldfsld fjlsdflsdfj lsdfjsldfjsl dfjsldfjsld fjlasdjflj dflasldfsld fjlsdflsdfjls dfjsldfjsldf jsldfjsldfjl asdjfljdfla sldfsldfjls dflsdfjlsd fjsldfjsld fjsldfjsl dfjlasd jf",
        "doctorName": "Dr. Morshad Hossain",
        "fileLink": "https://firebasestorage.googleapis.com/v0/b/javafest-87433.appspot.com/o/profileImages%2F2%2FWed%20Jul%2031%202024%2023%3A16%3A27%20GMT%2B0600%20(Bangladesh%20Standard%20Time)%2Fprescription.jpg?alt=media&token=53ae618e-a19b-418a-98ec-31b523fd5c4c",
        "keywords": [
            "Heart",
            "Lungs"
        ],
        "id": 2,
        "hospitalName": "Gaza Medical, Khulna"
    })

    useEffect(() => {

    }, [])

    if (!report) return <Loading />
    return (
        <PrescriptionDescriptionComponent report={report} setReport={setReport} />
    )
}