'use client'

import { HospitalsInputComponent } from "@/app/components/adminComponents";
import Loading from "@/app/components/loading";
import axiosInstance from "@/utils/axiosInstance";
import { hospitalsAnonymousUrl } from "@/utils/constants";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UpdateHospitalInfoPage() {
    const [hospital, setHospital] = useState(null);
    const params = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.hospitalid) {
            setLoading(true)
            axiosInstance.get(hospitalsAnonymousUrl, {
                params: {
                    id: params.hospitalid
                }
            }).then((response) => {
                console.log(response.data)
                setHospital(response.data?.content[0])
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoading(false)
            })
        }
    }, [params.hospitalid])

    if (loading) <Loading />
    if (!hospital) return <div className="m-auto text-2xl">Not Found</div>

    return (
        <div className="flex flex-col w-full flex-1 gap-5 items-center p-6 bg-gradient-to-r from-slate-200 to-slate-100">
            <div className="w-10/12 flex flex-col p-5 gap-5 rounded-md bg-white">
                <h1 className="text-2xl text-black">Update Hospital</h1>
                {hospital && <HospitalsInputComponent isNew={false} hospital={hospital} />}
            </div>
        </div>
    )
}