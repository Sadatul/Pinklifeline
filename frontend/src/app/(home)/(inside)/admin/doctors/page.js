'use client'

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { radicalGradient, unverifiedDoctors, verifyDoctor } from "@/utils/constants"
import { Pagination } from "@mui/material"
import { ExternalLink, Loader } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function DoctorsVerifyPage() {
    const [doctors, setDoctors] = useState([])
    const [filter, setFilter] = useState({
        fullName: null,
        regNo: null,
        workplace: null,
        department: null,
        designation: null,
        contactNumber: null,
        qualifications: null,
        isVerified: "N",
        pageNo: 0
    })
    const [loading, setLoading] = useState(true)
    const [pageInfo, setPageInfo] = useState({})
    const [fetchAgain, setFetchAgain] = useState(false)

    useEffect(() => {
        if (!loading) {
            setLoading(true)
        }

        axiosInstance.get(unverifiedDoctors, { params: filter }).then((res) => {
            setDoctors(res.data?.content)
            setPageInfo(res.data?.page)
        }).catch((err) => {
            console.log(err)
        }).finally(() => {
            setLoading(false)

        })
    }, [filter])

    useEffect(() => {
        if (fetchAgain) {
            if (!loading) {
                setLoading(true)
            }
            axiosInstance.get(unverifiedDoctors, { params: filter }).then((res) => {
                setDoctors(res.data?.content)
                setPageInfo(res.data?.page)
            }).catch((err) => {
                console.log(err)
            }).finally(() => {
                setLoading(false)
                setFetchAgain(false)
            })
        }
    }, [fetchAgain])

    return (
        <div className={cn("flex flex-col w-full flex-1 items-center p-5 gap-8", radicalGradient, "from-slate-200 to-slate-100")} >
            <div className="flex flex-col w-10/12 p-3 rounded-md bg-white gap-3">
                <h1 className="text-2xl font-bold text-center">Doctors Verification</h1>
                <div className="flex flex-col w-full gap-3">
                    <div className="flex flex-row w-full items-center gap-6 flex-wrap">
                        <label className="flex flex-col">
                            <span>Full Name</span>
                            <input type="text" id="fullName" defaultValue={filter?.fullName || ""} className="shadow-inner border px-2 py-1 rounded border-gray-600" />
                        </label>
                        <label className="flex flex-col">
                            <span>Reg No</span>
                            <input type="text" id="regNo" defaultValue={filter.regNo} className="shadow-inner border px-2 py-1 rounded border-gray-600" />
                        </label>
                        <label className="flex flex-col">
                            <span>Workplace</span>
                            <input type="text" id="workplace" defaultValue={filter.workplace} className="shadow-inner border px-2 py-1 rounded border-gray-600" />
                        </label>
                        <label className="flex flex-col">
                            <span>Department</span>
                            <input type="text" id="department" defaultValue={filter.department} className="shadow-inner border px-2 py-1 rounded border-gray-600" />
                        </label>
                        <label className="flex flex-col">
                            <span>Designation</span>
                            <input type="text" id="designation" defaultValue={filter.designation} className="shadow-inner border px-2 py-1 rounded border-gray-600" />
                        </label>
                        <label className="flex flex-col">
                            <span>Contact Number</span>
                            <input type="number" id="contactNumber" defaultValue={filter.contactNumber} className="shadow-inner border px-2 py-1 rounded border-gray-600 number-input" />
                        </label>
                        <label className="flex flex-col">
                            <span>Qualifications</span>
                            <textarea type="text" id="qualifications" defaultValue={filter.qualifications} className="shadow-inner border px-2 py-1 rounded border-gray-600" />
                            <span className="text-xs">Separate with commas</span>
                        </label>
                    </div>
                    <div className="flex flex-row w-full items-center gap-6 justify-end px-6">
                        <button className="text-base text-white bg-gray-600 hover:scale-95 px-4 py-1 rounded-md w-fit" onClick={() => {
                            setFilter({
                                fullName: document.getElementById("fullName").value,
                                regNo: document.getElementById("regNo").value,
                                workplace: document.getElementById("workplace").value,
                                department: document.getElementById("department").value,
                                designation: document.getElementById("designation").value,
                                contactNumber: document.getElementById("contactNumber").value,
                                qualifications: document.getElementById("qualifications").value,
                                pageNo: 0
                            })
                        }}>
                            Filter
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-10/12 p-3 rounded-md bg-white items-center justify-between">
                <div className="flex flex-col w-full items-center">
                    <div className="flex flex-col items-end w-full">
                        <Link href={"https://verify.bmdc.org.bd/"} target='_blank' className="flex flex-row items-center gap-2 hover:underline">
                            <span className="text-base">BMDC Verification</span>
                            <ExternalLink size={24} />
                        </Link>
                    </div>
                    {loading ? <Loader size={44} className="text-gray-600 animate-spin" /> : doctors.map((doctor, index) => {
                        return (
                            <div key={index} className="flex flex-col w-full p-3 rounded-md gap-2">
                                <DoctorInfo doctor={doctor} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                                {(index !== doctors.length - 1) && <Separator className="h-[1.5px] w-full bg-gray-300" />}
                            </div>
                        )
                    })}
                </div>
                <div className="flex flex-col w-full gap-1 items-center">
                    <Separator className="h-[1.5px] w-full bg-gray-300" />
                    <Pagination
                        count={pageInfo.totalPages}
                        page={filter.pageNo + 1}
                        onChange={(e, v) => {
                            setFilter({
                                ...filter,
                                pageNo: v - 1
                            })
                        }}
                        color="primary"
                    />
                </div>
            </div>
        </div>
    )
}

function DoctorInfo({ doctor, fetchAgain, setFetchAgain }) {
    const [showFull, setShowFull] = useState(false)

    return (
        <div className="flex flex-col w-full gap-2 relative">
            <div className="flex flex-row w-full justify-between items-center">
                <span className="text-lg font-semibold">{doctor.fullName}</span>
                <div className="flex flex-row gap-4 px-16">
                    <button className="text-2xl font-semibold text-white bg-green-600 hover:scale-95 px-4 py-1 rounded-md absolute top-1/2 right-32" onClick={() => {
                        axiosInstance.put(verifyDoctor(doctor.id)).then((res) => {
                            console.log(res)
                            setFetchAgain(true)
                        }).catch((err) => {
                            console.log(err)
                        })
                    }}>
                        Verify
                    </button>
                </div>
            </div>
            <span className="text-base">{doctor.designation} of {doctor.department}</span>
            <span className="text-base">{doctor.workplace}</span>
            <span className="text-base">{doctor.registrationNumber}</span>
            <span className="text-base">{doctor.contactNumber}</span>
            <span className="text-base">{doctor.qualifications.join(", ")}</span>
        </div>
    )
}

// Query params: fullName=adil
//  Query params: regNo=sdfasdfsdfsdf
//  Query params: workplace=hospital
//  Query params: department=cancer
//  Query params: designation=ata
//  Query params: contactNumber=01711573136
//  Query params: qualifications=fcps,mbbs
//  Query params: pageNo=0