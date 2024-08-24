'use client'

import Loading from "@/app/components/loading"
import { useSessionContext } from "@/app/context/sessionContext"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { getDoctorProfileDetailsUrl, getDoctorsUrl, getHospitalsAnonymousUrl, pagePaths, radicalGradient, round } from "@/utils/constants"
import { Pagination } from "@mui/material"
import { Loader, Loader2, Search, Star, StarHalf } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"


function SearchComponent() {
    const searchParams = useSearchParams()
    const query = searchParams.get('query')
    const [doctors, setDoctors] = useState([])
    const [doctorsPageInfo, setDoctorsPageInfo] = useState({
        number: 0,
        totalPages: 0,
    })
    const [hospitals, setHospitals] = useState([])
    const [hospitalsPageInfo, setHospitalsPageInfo] = useState({
        number: 0,
        totalPages: 0,
    })
    const [loadingDoctors, setLoadingDoctors] = useState(false)
    const [loadingHospitals, setLoadingHospitals] = useState(false)
    const [doctorFilter, setDoctorFilter] = useState({
        fullName: query || null,
        regNo: null,
        workplace: null,
        department: null,
        designation: null,
        contactNumber: null,
        qualifications: null,
        isVerified: "Y",
        pageNo: 0
    })
    const [hospitalFilter, setHospitalFilter] = useState({
        name: query || null,
        location: null,
        contactNumber: null,
        pageNo: 0
    })
    const [currentTab, setCurrentTab] = useState(0) // 0 for doctors, 1 for hospitals
    const [showFilter, setShowFilter] = useState(false)
    const [isLogged, setIsLogged] = useState(false)
    const sessionContext = useSessionContext()

    useEffect(() => {
        if (sessionContext?.sessionData && sessionContext?.sessionData?.userId) {
            setIsLogged(true)
        }
    }, [sessionContext.sessionData])

    useEffect(() => {
        if (isLogged) {
            setLoadingDoctors(true)
            axiosInstance.get(getDoctorsUrl, {
                params: doctorFilter
            }).then(response => {
                console.log(response.data)
                setDoctors(response.data?.content)
                setDoctorsPageInfo({
                    number: response.data?.number,
                    totalPages: response.data?.totalPages
                })
            }).catch(error => {
                console.log(error)
            }).finally(() => {
                setLoadingDoctors(false)
            })
        }
    }, [doctorFilter, isLogged])

    useEffect(() => {
        setLoadingHospitals(true)
        axiosInstance.get(getHospitalsAnonymousUrl, {
            params: hospitalFilter
        }).then(response => {
            console.log(response.data)
            setHospitals(response.data?.content)
            setHospitalsPageInfo({
                number: response.data?.number,
                totalPages: response.data?.totalPages
            })
        }).catch(error => {
            console.log(error)
        }).finally(() => {
            setLoadingHospitals(false)
        })
    }, [hospitalFilter])



    return (
        <div className={cn(radicalGradient, "from-slate-200 to-slate-100 flex flex-col w-full flex-1 gap-4 p-5 items-center")}>
            <div className="flex flex-col w-11/12 gap-4 bg-white p-6 rounded-md">
                <h1 className="text-2xl font-bold text-slate-900">Search</h1>
                <div className="flex flex-col gap-4 w-full items-center">
                    <div className="flex flex-row gap-4 w-full items-center">
                        <label className="text-base flex items-center gap-2 w-fit">
                            <span className='text-base w-24'>Search</span>
                            <input id="search-text" autoComplete="" type="text" placeholder="Search" defaultValue={query} className="w-64 px-2 py-1 rounded shadow-inner border border-slate-500" />
                        </label>
                        <button className="w-fit bg-zinc-700 text-zinc-100 p-2 rounded-md hover:scale-95" onClick={() => {
                            const searchText = document.getElementById('search-text').value
                            if (searchText) {
                                setDoctorFilter({
                                    ...doctorFilter,
                                    fullName: searchText,
                                    pageNo: 0
                                })
                                setHospitalFilter({
                                    ...hospitalFilter,
                                    name: searchText,
                                    pageNo: 0
                                })
                            }
                        }}>
                            <Search size={24} />
                        </button>
                        <button className="w-fit bg-gray-700 text-zinc-100 p-2 rounded-md hover:scale-95" onClick={() => {
                            setShowFilter(prev => !prev)
                        }}>
                            {showFilter ? "Hide Filter" : "Add Filter"}
                        </button>
                    </div>
                    <Separator className="bg-gray-600" />
                    <div className={cn("flex flex-col w-full gap-2 transition-transform duration-500 ease-in-out", showFilter ? " scale-y-100" : "scale-y-0")}>
                        {showFilter &&
                            <>
                                {currentTab === 0 ? (
                                    <div className={"flex flex-col gap-3 w-full p-2"}>
                                        <div className="flex flex-col gap-1 w-fit">
                                            <span className="text-base">Filter for Doctor</span>
                                            <Separator className="bg-gray-500" />
                                        </div>
                                        <div className="flex flex-row gap-6 w-full items-center flex-wrap">
                                            <label className="flex flex-row items-center w-fit gap-2">
                                                RegNo
                                                <input className="px-2 py-1 rounded shadow-inner border border-slate-500" type="text" id="regNo" />
                                            </label>
                                            <label className="flex flex-row items-center w-fit gap-2">
                                                Workplace
                                                <input className="px-2 py-1 rounded shadow-inner border border-slate-500" type="text" id="workplace" />
                                            </label>
                                            <label className="flex flex-row items-center w-fit gap-2">
                                                Department
                                                <input className="px-2 py-1 rounded shadow-inner border border-slate-500" type="text" id="department" />
                                            </label>
                                            <label className="flex flex-row items-center w-fit gap-2">
                                                Designation
                                                <input className="px-2 py-1 rounded shadow-inner border border-slate-500" type="text" id="designation" />
                                            </label>
                                            <label className="flex flex-row items-center w-fit gap-2">
                                                Contact Number
                                                <input className="px-2 py-1 rounded shadow-inner border border-slate-500 number-input" type="number" id="contactNumber" />
                                            </label>
                                            <label className="flex flex-row items-center w-fit gap-2">
                                                Qualifications
                                                <div className="flex flex-col gap-1">
                                                    <textarea className="px-2 py-1 rounded shadow-inner border border-slate-500" type="text" id="qualifications" />
                                                    <span className="text-xs text-slate-500">Separate by comma</span>
                                                </div>
                                            </label>
                                        </div>
                                        <button className="w-fit bg-zinc-700 text-zinc-100 p-2 rounded-md hover:scale-95" onClick={() => {
                                            const regNo = document.getElementById('regNo').value
                                            const workplace = document.getElementById('workplace').value
                                            const department = document.getElementById('department').value
                                            const designation = document.getElementById('designation').value
                                            const contactNumber = document.getElementById('contactNumber').value
                                            const qualifications = document.getElementById('qualifications').value
                                            setDoctorFilter({
                                                ...doctorFilter,
                                                regNo,
                                                workplace,
                                                department,
                                                designation,
                                                contactNumber,
                                                qualifications,
                                                pageNo: 0
                                            })
                                        }}>
                                            Filter
                                        </button>
                                    </div>
                                ) : (
                                    <div className={"flex flex-col gap-3 w-full "}>
                                        <div className="flex flex-row gap-6 w-full items-center flex-wrap">
                                            <label className="flex flex-row items-center w-fit gap-2">
                                                Location
                                                <input className="px-2 py-1 rounded shadow-inner border border-slate-500" type="text" id="location" />
                                            </label>
                                            <label className="flex flex-row items-center w-fit gap-2">
                                                Contact Number
                                                <input className="px-2 py-1 rounded shadow-inner border border-slate-500 number-input" type="number" id="contactNumberHospital" />
                                            </label>
                                        </div>
                                        <button className="w-fit bg-zinc-700 text-zinc-100 p-2 rounded-md hover:scale-95" onClick={() => {
                                            const location = document.getElementById('location').value
                                            const contactNumberHospital = document.getElementById('contactNumberHospital').value
                                            setHospitalFilter({
                                                ...hospitalFilter,
                                                location,
                                                contactNumberHospital,
                                                pageNo: 0
                                            })
                                        }}>
                                            Filter
                                        </button>
                                    </div>
                                )}
                            </>
                        }
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-11/12 gap-4 bg-white p-6 rounded-md">
                <div className="flex flex-col gap-2 w-full">
                    < div className="flex flex-row gap-4 w-full items-center" >
                        <button className={cn("w-fit p-2", currentTab === 0 && "border-b border-gray-600 bg-gradient-to-t from-purple-100 to-transparent")} onClick={() => {
                            if (currentTab !== 0) {
                                setCurrentTab(0)
                            }
                        }}>Doctors</button>
                        <button className={cn("w-fit p-2", currentTab === 1 && "border-b border-gray-600 bg-gradient-to-t from-blue-100 to-transparent")} onClick={() => {
                            if (currentTab !== 1) {
                                setCurrentTab(1)
                            }
                        }}>Hospitals</button>
                    </div>
                    <Separator className="bg-gray-300" />
                </div>
                {currentTab === 0 ? (
                    <>
                        {!isLogged && <span className="text-lg text-slate-900 font-bold">You need to login to view doctors</span>}
                        {isLogged && <Doctors doctors={doctors} pageInfo={doctorsPageInfo} setDoctorFilter={setDoctorFilter} loadingDoctors={loadingDoctors} />}
                    </>
                ) : (
                    <Hospitals hospitals={hospitals} pageInfo={hospitalsPageInfo} setHospitalFilter={setHospitalFilter} loadingHospitals={loadingHospitals} />
                )}
            </div>
        </div>
    )
}

function Doctors({ doctors, pageInfo, setDoctorFilter, loadingDoctors }) {
    return (
        <div className="flex flex-col w-full gap-4">
            {loadingDoctors && <Loader size={44} className="m-auto animate-spin" />}
            {doctors?.map(doctor => (
                <div key={doctor.id} className="flex flex-row gap-5 w-full px-4 pt-4 pb-2 bg-white border-b border-gray-500">
                    <HoverCard >
                        <HoverCardTrigger asChild>
                            <div className="flex flex-col gap-2 items-start w-fit">
                                <Link href={pagePaths.doctorProfile(doctor?.id)} className="text-lg font-semibold text-slate-900 hover:underline">{doctor.fullName}</Link>
                                <span className="text-base text-slate-700">{doctor.workplace}</span>
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent side="right">
                            <div className="flex flex-col gap-3 w-full break-words">
                                <div className="text-base text-slate-700 flex flex-row flex-wrap items-center gap-2">
                                    <span className="text-base font-semibold w-fit">
                                        Contact:
                                    </span>
                                    <span className="text-base break-all">
                                        {doctor.contactNumber}
                                    </span>
                                </div>
                                <div className="text-base text-slate-700 flex flex-row flex-wrap items-center gap-2">
                                    <span className="text-base font-semibold w-fit">
                                        Designation:
                                    </span>
                                    <span className="text-base break-all">
                                        {doctor.designation}
                                    </span>
                                </div>
                                <div className="text-base text-slate-700 flex flex-row flex-wrap items-center gap-2">
                                    <span className="text-base font-semibold w-fit">
                                        Department:
                                    </span>
                                    <span className="text-base break-all">
                                        {doctor.department}
                                    </span>
                                </div>
                                <div className="text-base text-slate-700 flex flex-row flex-wrap items-center gap-2">
                                    <span className="text-base font-semibold w-fit">
                                        Reg No:
                                    </span>
                                    <span className="text-base break-all">
                                        {doctor.registrationNumber}
                                    </span>
                                </div>
                                <div className="text-base text-slate-700 flex flex-row flex-wrap items-center gap-2">
                                    <span className="text-base font-semibold w-fit">
                                        Qualifications:
                                    </span>
                                    <span className="text-base break-all">
                                        {doctor.qualifications.join(', ')}
                                    </span>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                    <RatingCard doctorId={doctor.id} />
                </div>
            ))}
            <Pagination
                count={pageInfo.totalPages}
                page={pageInfo.number + 1}
                onChange={(event, value) => {
                    setDoctorFilter(prev => {
                        return {
                            ...prev,
                            pageNo: value - 1
                        }
                    })
                }}
                color="primary"
                size="large"
                variant="outlined"
                shape="rounded"
                showFirstButton
                showLastButton
                className="m-auto"
            />
        </div>
    )
}

function RatingCard({ doctorId }) {
    const [reviewInfo, setReviewInfo] = useState(null)
    const [ratingIcon, setRatingIcon] = useState(null)

    useEffect(() => {
        axiosInstance.get(getDoctorProfileDetailsUrl(doctorId)).then((res) => {
            setReviewInfo({
                ...res.data?.reviewSummary,
                ratingCount: res.data?.reviewSummary?.ratingCount?.reverse()
            })
        }).catch((error) => {
            console.log(error)
            if (error.response?.status === 404) {
                toast.error("Doctor not found")
                setUserData("EMPTY")
            }
        })
    }, [doctorId])

    useEffect(() => {
        if (reviewInfo)
            setRatingIcon(reviewInfo.averageRating <= 2.5 ? <Star strokeWidth={1.5} size={20} className={cn(" text-transparent text-[#FFD700]")} /> : reviewInfo.averageRating < 4 ? <StarHalf size={20} fill="#FFD700" className={cn("text-transparent")} /> : <Star size={20} fill="#FFD700" className={cn("text-transparent")} />)
    }, [reviewInfo])

    if (!reviewInfo) return <Loader2 size={16} className="animate-spin" />

    return (
        <div className="flex flex-col gap-2 w-full">
            <Popover>
                <PopoverTrigger className="w-12">
                    <div className="flex flex-row mt-1">
                        {ratingIcon}
                        <span className="text-sm font-semibold ml-2">{round(reviewInfo.averageRating)}</span>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto " side="right">
                    {reviewInfo.ratingCount.map((rating, index) => (
                        <div key={index} className="flex flex-row items-center p-2">
                            <div className="flex flex-row flex-1">
                                {reviewInfo.ratingCount.slice(index).map((rating2, index2) => (
                                    <Star key={index + "" + index2} fill="#FFD700" className={cn("w-4 h-4 text-transparent")} />
                                ))}
                            </div>
                            <span className="text-sm ml-2 text-right">{rating}</span>
                        </div>
                    ))}
                </PopoverContent>
            </Popover>
        </div>
    )

}

function Hospitals({ hospitals, pageInfo, setHospitalFilter, loadingHospitals }) {
    return (
        <div className="flex flex-col w-full gap-4">
            {loadingHospitals && <Loader size={44} className="m-auto animate-spin" />}
            {hospitals?.map(hospital => (
                <div key={hospital.id} className="flex flex-col gap-2 w-full px-4 pt-4 pb-2 bg-white border-b border-gray-500">
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <div className="flex flex-col gap-2 items-start w-fit">
                                <Link href={pagePaths.hospitalByIdPage(hospital?.id)} className="text-lg font-semibold text-slate-900 hover:underline">{hospital.name}</Link>
                                <span className="text-base text-slate-700">{hospital.location}</span>
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent side="right">
                            <div className="flex flex-col gap-3 w-full break-words">
                                <div className="text-base text-slate-700 flex flex-row flex-wrap items-center gap-2">
                                    <span className="text-base font-semibold w-fit">
                                        Contact:
                                    </span>
                                    <span className="text-base break-all">
                                        {hospital.contactNumber}
                                    </span>
                                </div>
                                <div className="text-base text-slate-700 flex flex-row flex-wrap items-center gap-2">
                                    <span className="text-base font-semibold w-fit">
                                        Email:
                                    </span>
                                    <span className="text-base break-all">
                                        {hospital.email}
                                    </span>
                                </div>
                                <div className="text-base text-slate-700 flex flex-row flex-wrap items-center gap-2">
                                    <span className="text-base font-semibold w-fit">
                                        Description:
                                    </span>
                                    <span className="text-base break-all">
                                        {hospital.description}
                                    </span>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>
            ))}
            <Pagination
                count={pageInfo.totalPages}
                page={pageInfo.number + 1}
                onChange={(event, value) => {
                    setHospitalFilter(prev => {
                        return {
                            ...prev,
                            pageNo: value - 1
                        }
                    })
                }}
                color="secondary"
                size="large"
                variant="outlined"
                shape="rounded"
                showFirstButton
                showLastButton
                className="m-auto"
            />
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<Loading />} >
            <SearchComponent />
        </Suspense >
    )
}