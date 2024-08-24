'use client'
import Loading from "@/app/components/loading"
import ScrollableContainer from "@/app/components/StyledScrollbar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { getHospitalsAnonymousUrl, getMedicalTestAnonymousUrl, medicalTestHospitalAdminUrl, medicalTestHospitalAnonymousUrl, medicalTestHospitalByIdAdminUrl, radicalGradient } from "@/utils/constants"
import { Pagination } from "@mui/material"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { debounce, set } from "lodash"
import { Loader, Plus, Search } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

function AddTest() {
    const params = useParams()
    const hospitalId = params.hospitalid
    const [hospital, setHospital] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadingTest, setLoadingTest] = useState(false)
    const [addedTests, setAddedTests] = useState([])
    const [pageInfo, setPageInfo] = useState(null)
    const [loadingAddedTests, setLoadingAddedTests] = useState(true)
    const currentPage = useRef(1)


    useEffect(() => {
        if (hospitalId) {
            axiosInstance.get(getHospitalsAnonymousUrl, {
                params: {
                    id: hospitalId,

                }
            }).then((response) => {
                setHospital(response.data?.content[0])
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoading(false)
            })
        }
    }, [])

    useEffect(() => {
        if (hospitalId && loadingAddedTests) {
            axiosInstance.get(medicalTestHospitalAnonymousUrl, {
                params: {
                    hospitalId: hospitalId,
                    pageNo: currentPage.current - 1,
                    name: document.getElementById("searchTest")?.value
                }
            }).then((response) => {
                setAddedTests(response.data?.content)
                setPageInfo(response.data?.page)
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoadingAddedTests(false)
            })
        }
    }, [hospitalId, loadingAddedTests])

    if (loading) return <Loading chose="handle" />

    return (
        <ScrollableContainer className={cn(radicalGradient, "flex flex-col w-full flex-1 from-slate-200 to-slate-100 gap-4 p-4 overflow-x-hidden")}>
            <div className="flex flex-col gap-4 w-10/12 mx-auto bg-white rounded-md p-5">
                <div className="flex flex-col gap-7 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-bold text-slate-900">Hospital Details</h2>
                        <Separator className="w-1/4 h-[1.5px] bg-gray-400" />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-row gap-2">
                            <p className="text-lg font-semibold text-slate-900 w-28">Name:</p>
                            <p className="text-lg text-slate-900">{hospital.name}</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <p className="text-lg font-semibold text-slate-900 w-28">Location:</p>
                            <p className="text-lg text-slate-900">{hospital.location}</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <p className="text-lg font-semibold text-slate-900 w-28">Contact</p>
                            <p className="text-lg text-slate-900">{hospital.contactNumber}</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <p className="text-lg font-semibold text-slate-900 w-28">Email:</p>
                            <p className="text-lg text-slate-900">{hospital.email}</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <p className="text-lg font-semibold text-slate-900 w-28">Description:</p>
                            <p className="text-lg text-slate-900">{hospital.description}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-row gap-8 w-full justify-between">
                                <h2 className="text-lg font-bold text-slate-900">Tests</h2>
                                <div className="flex flex-row gap-2 items-center mr-10">
                                    <input autoComplete="off" id="searchTest" type="text" placeholder="Search Test" className="w-64 py-1 text-sm px-2 border border-gray-400 rounded-md" />
                                    <button className="flex items-center justify-center w-8 h-8 bg-gray-500 rounded-md" onClick={() => {
                                        setLoadingAddedTests(true)
                                    }}>
                                        <Search size={24} className="text-white" />
                                    </button>
                                </div>
                            </div>
                            <Separator className="w-full h-[1.5px] bg-gray-400" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            {loadingAddedTests && <Loader size={32} className="animate-spin" />}
                            {!loadingAddedTests && addedTests.map((test, index) => (
                                <div className="flex flex-col gap-2 w-full px-3" key={index}>
                                    <AddedTest test={test} setLoadingAddedTests={setLoadingAddedTests} />
                                    {(index !== addedTests.length - 1) && <Separator className="w-full h-[1.5px] bg-gray-400" />}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col w-full gap-2 px-3">
                            <Separator className="w-full h-[1.5px] bg-gray-400" />
                            <Pagination
                                count={pageInfo?.totalPages}
                                page={currentPage.current}
                                onChange={(event, value) => {
                                    currentPage.current = value
                                    setLoadingAddedTests(true)
                                }}
                                className=" m-auto"
                                showFirstButton
                                showLastButton
                                size="large"
                                color="secondary"
                                variant="outlined"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ScrollableContainer>
    )
}

function AddedTest({ test, setLoadingAddedTests }) {
    const [mutableTest, setMutableTest] = useState(test)
    const [editabled, setEditabled] = useState(false)

    return (
        <div className="flex flex-row gap-2 w-full justify-between">
            <div className="flex flex-row gap-2">
                <div className="flex flex-col gap-1 ">
                    <p className="text-base text-slate-900">{mutableTest.name}</p>
                    <p className="text-base text-slate-900">{mutableTest.fee} TK</p>
                    <p className="text-base text-slate-900">{mutableTest.description}</p>
                </div>
            </div>
        </div>
    )
}

export default function AddMedicalTestsPage() {
    return (
        <AddTest />
    )
}