'use client'
import Loading from "@/app/components/loading"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { getHospitalsAnonymousUrl, getMedicalTestAnonymousUrl, medicalTestHospitalAdminUrl, medicalTestHospitalAnonymousUrl, medicalTestHospitalByIdAdminUrl, pagePaths, radicalGradient } from "@/utils/constants"
import { Pagination } from "@mui/material"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { debounce, set } from "lodash"
import { Loader, Pencil, Plus } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

function AddTest() {
    const searchParams = useSearchParams()
    const hospitalId = searchParams.get('hospitalid')
    const [hospital, setHospital] = useState(null)
    const [loading, setLoading] = useState(true)
    const [testOptions, setTestOptions] = useState([])
    const [searchTest, setSearchTest] = useState("");
    const [loadingTest, setLoadingTest] = useState(false)
    const [selectedTest, setSelectedTest] = useState(null)
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
                }
            }).then((response) => {
                console.log("added tests", response.data)
                setAddedTests(response.data?.content)
                setPageInfo(response.data?.page)
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoadingAddedTests(false)
            })
        }
    }, [hospitalId, loadingAddedTests])

    const getTestOptions = useCallback(debounce((searchText) => {
        setLoadingTest(true)
        setTestOptions([])
        axiosInstance.get(getMedicalTestAnonymousUrl, {
            params: {
                name: searchText === "" ? null : searchText
            }
        }).then((response) => {
            console.log(response.data)
            setTestOptions(response.data)
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            setLoadingTest(false)
        })
    }, 500), [])

    useEffect(() => {
        if (searchTest !== "" && selectedTest?.name !== searchTest) {
            console.log("searching", searchTest)
            getTestOptions(searchTest.trim())
        }
    }, [searchTest])

    if (loading) return <Loading chose="handle" />

    return (
        <div className={cn(radicalGradient, "flex flex-col w-full flex-1 from-slate-200 to-slate-100 gap-4 p-4")}>
            <div className="flex flex-col gap-4 w-10/12 mx-auto bg-white rounded-md p-5 ">
                <h1 className="text-2xl font-bold text-slate-900 m-auto">Details Hospital</h1>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-row gap-2 w-full items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Hospital Details</h2>
                            <Link href={pagePaths.updateHospitalsPage(hospital.id)} className="rounded shadow-md px-2 py-1 flex items-center gap-2 text-lg" >
                                Edit<Pencil scale={12} className="text-blue-500" />
                            </Link>
                        </div>
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
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-bold text-slate-900">Add Test</h2>
                        <Separator className="w-1/4 h-[1.5px] bg-gray-400" />
                        <div className="flex flex-row gap-10 w-full flex-wrap items-start">
                            <div className="flex flex-col gap-0  rounded-md w-72 border border-gray-600 break-all text-base relative">
                                <input autoComplete="off" id="search-box-test" type="text" placeholder="Search Test" className="w-full border border-gray-600 px-2 py-1 rounded-md h-8" onChange={(e) => {
                                    setSearchTest(e.target.value)
                                    document.getElementById("test-error").innerText = ""
                                    console.log("searching")
                                }} />
                                {(searchTest !== "" && testOptions && !selectedTest) &&
                                    <div className="flex flex-col gap-2 w-full p-2 absolute left-0 right-0 top-8 z-30 bg-white border-x border-b rounded border-gray-600 ">
                                        {loadingTest && <Loader size={16} className="animate-spin m-auto" />}
                                        {(testOptions.length === 0 && !loadingTest) && <p className="text-base text-slate-900">No tests found</p>}
                                        {testOptions?.map((test, index) => (
                                            <div className="flex flex-col gap-1 w-full" key={index}>
                                                <div className="flex flex-row gap-2 justify-between items-center cursor-pointer" onClick={() => {
                                                    document.getElementById("search-box-test").value = test.name
                                                    setTestOptions(null)
                                                    setSelectedTest({
                                                        testId: test.id,
                                                        name: test.name
                                                    })
                                                }}>
                                                    <p className="text-base text-slate-900">{test.name}</p>
                                                </div>
                                                {(index !== testOptions.length - 1) && <Separator className="w-full h-[1.5px] bg-gray-400" />}
                                            </div>
                                        ))}
                                    </div>
                                }
                                <span id="test-error" className="text-red-500 text-sm"></span>
                            </div>
                            <div className="flex flex-row gap-2 items-center h-10">
                                Fee
                                <input id="test-fee" type="number" placeholder="Fee" className="border border-gray-600 px-2 py-1 rounded-md number-input" />
                            </div>
                            <button className="flex flex-row gap-2 items-center bg-gray-600 text-white rounded-md px-2 py-1 hover:scale-95 h-10" onClick={() => {
                                console.log(selectedTest)
                                if (!selectedTest || !document.getElementById("test-fee")?.value) {
                                    document.getElementById("test-error").innerText = "Please select a test and enter fee"
                                    return
                                }
                                document.getElementById("test-error").innerText = ""
                                axiosInstance.post(medicalTestHospitalAdminUrl, {
                                    "hospitalId": hospitalId,
                                    "testId": selectedTest?.testId,
                                    "fee": document.getElementById("test-fee")?.value
                                }).then((response) => {
                                    document.getElementById("search-box-test").value = ""
                                    document.getElementById("test-fee").value = ""
                                    setSelectedTest(null)
                                    setLoadingAddedTests(true)
                                    toast.success("Test added successfully")
                                }
                                ).catch((error) => {
                                    console.log(error)
                                })
                            }}>
                                <Plus size={16} />
                                Add
                            </button>

                        </div>
                    </div>
                    <div className="flex flex-col gap-5 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg font-bold text-slate-900">Added Tests</h2>
                            <Separator className="w-1/4 h-[1.5px] bg-gray-400" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            {addedTests.map((test, index) => (
                                <div className="flex flex-col gap-4 w-full " key={index}>
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
        </div>
    )
}

function AddedTest({ test, setLoadingAddedTests }) {
    const [mutableTest, setMutableTest] = useState(test)
    const [editabled, setEditabled] = useState(false)
    const testFeeRef = useRef(null)
    console.log("mutabletest", mutableTest)

    return (
        <div className="flex flex-row gap-2 w-full justify-between">
            <div className="flex flex-row gap-2">
                <div className="flex flex-col gap-3 ">
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="text-lg text-slate-900 w-fit">{mutableTest.name}</p>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={10} side="right">{mutableTest.description}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {!editabled &&
                        <p className="text-lg text-slate-900">{mutableTest.fee} TK</p>
                    }
                    {editabled &&
                        <input ref={testFeeRef} type="number" defaultValue={mutableTest.fee} className="border border-gray-500 number-input px-2 py-1 rounded-md" />
                    }
                </div>
            </div>
            <div className="flex flex-row gap-4">
                {!editabled &&
                    <button className="flex flex-row gap-2 items-center bg-blue-600 text-white rounded-md px-4 py-1 hover:scale-95 h-8 text-base"
                        onClick={() => {
                            setEditabled(true)
                        }}>
                        Edit
                    </button>
                }
                {editabled &&
                    <div className="flex flex-row gap-2">
                        <button className="flex flex-row gap-2 items-center bg-green-600 text-white rounded-md px-2 py-1 hover:scale-95 h-8 text-base"
                            onClick={() => {
                                console.log("Mutable", mutableTest)
                                axiosInstance.put(medicalTestHospitalByIdAdminUrl(mutableTest.id), {
                                    fee: testFeeRef.current.value
                                }).then((response) => {
                                    setMutableTest({
                                        ...mutableTest,
                                        fee: testFeeRef.current.value
                                    })
                                    setEditabled(false)
                                    toast.success("Test updated successfully")
                                }).catch((error) => {
                                    console.log(error)
                                })
                            }}>
                            Save
                        </button>
                        <button className="flex flex-row gap-2 items-center bg-gray-600 text-white rounded-md px-2 py-1 hover:scale-95 h-8 text-base"
                            onClick={() => {
                                setEditabled(false)
                            }}>
                            Cancel
                        </button>
                    </div>
                }
                <button className="flex flex-row gap-2 items-center bg-red-600 text-white rounded-md px-2 py-1 hover:scale-95 h-8 text-base" onClick={() => {
                    axiosInstance.delete(medicalTestHospitalByIdAdminUrl(mutableTest.id)).then((response) => {
                        setLoadingAddedTests(true)
                        toast.success("Test removed successfully")
                    }).catch((error) => {
                        console.log(error)
                    })
                }}>Remove</button>
            </div>
        </div>
    )
}

export default function AddMedicalTestsPage() {
    return (
        <Suspense fallback={<Loading chose="handle" />}>
            <AddTest />
        </Suspense>
    )
}