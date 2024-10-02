'use client'

import Loading from "@/app/components/loading"
import { useSearchParams } from "next/navigation"
import { Suspense, useCallback, useDebugValue, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { alignArrays, getHospitalsAnonymousUrl, getMedicalTestAnonymousUrl, medicalTestHospitalAnonymousUrl, pagePaths, radicalGradient } from "@/utils/constants"
import { debounce, set } from "lodash"
import axiosInstance from "@/utils/axiosInstance"
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Pagination } from "@mui/material"
import ScrollableContainer from "@/app/components/StyledScrollbar"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const animatedComponents = makeAnimated();

function ComparePageComponent() {
    const [loadingOne, setLoadingOne] = useState(false)
    const [loadingTwo, setLoadingTwo] = useState(false)
    const [hospitalOne, setHospitalOne] = useState(null)
    const [hospitalTwo, setHospitalTwo] = useState(null)
    const [hospital_id_one, setHospitalIdOne] = useState(null)
    const [hospital_id_two, setHospitalIdTwo] = useState(null)
    const [hospitalOneData, setHospitalOneData] = useState(null)
    const [hospitalTwoData, setHospitalTwoData] = useState(null)
    const [searchHospitalOne, setSearchHospitalOne] = useState("")
    const [searchHospitalTwo, setSearchHospitalTwo] = useState("")
    const [hospitalOneOptions, setHospitalOneOptions] = useState([])
    const [hospitalTwoOptions, setHospitalTwoOptions] = useState([])
    const [loadingOptionsOne, setLoadingOptionsOne] = useState(false)
    const [loadingOptionsTwo, setLoadingOptionsTwo] = useState(false)
    const [showOptionOne, setShowOptionOne] = useState(false)
    const [showOptionTwo, setShowOptionTwo] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [selectedTests, setSelectedTests] = useState([])
    const [pageInfo, setPageInfo] = useState({
        number: 0,
        totalPages: 0,
    })

    const handleHospitalDataLoad = async (hospitalId, pageNo) => {
        try {
            const response = await axiosInstance.get(medicalTestHospitalAnonymousUrl, {
                params: {
                    hospitalId: hospitalId,
                    pageNo: pageNo,
                    testIds: selectedTests.length > 0 ? selectedTests.map((test) => test.value).join(",") : null
                }
            })
            return response.data
        } catch (error) {
            console.log(error)
            return null
        }
    }


    useEffect(() => {
        setIsMounted(true)
    }, [])

    const getTestOptions = (inputValue) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                axiosInstance.get(getMedicalTestAnonymousUrl, { params: { name: inputValue.trim() } }).then((response) => {
                    const options = response.data?.map((test) => ({ value: test.id, label: test.name }));
                    resolve(options);
                }).catch((error) => {
                    console.log(error);
                    resolve([]);
                });
            }, 500);
        })
    }

    const getHospitalOneOptions = useCallback(debounce((searchText) => {
        setLoadingOptionsOne(true)
        axiosInstance.get(getHospitalsAnonymousUrl, {
            params: {
                name: searchText.trim(),
            }
        }).then((response) => {
            setHospitalOneOptions(response.data?.content)
            console.log(response.data)
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            setLoadingOptionsOne(false)
        })
    }, [500]), [])

    const getHospitalTwoOptions = useCallback(debounce((searchText) => {
        setLoadingOptionsTwo(true)
        axiosInstance.get(getHospitalsAnonymousUrl, { params: { name: searchText.trim() } }).then((response) => {
            setHospitalTwoOptions(response.data?.content)
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            setLoadingOptionsTwo(false)
        })
    }, [500]), [])

    useEffect(() => {
        if (searchHospitalOne !== "") {
            getHospitalOneOptions(searchHospitalOne)
        }
    }, [searchHospitalOne])

    useEffect(() => {
        if (searchHospitalTwo !== "") {
            console.log("Search Hospital Two", searchHospitalTwo)
            getHospitalTwoOptions(searchHospitalTwo)
        }
    }, [searchHospitalTwo])

    useEffect(() => {
        console.log("Page Info", pageInfo)
    }, [pageInfo])

    if (!isMounted) return null

    return (
        <ScrollableContainer className={cn(radicalGradient, "from-slate-200 to-slate-100 w-full flex-1 flex flex-col items-center overflow-x-hidden gap-4 p-6 relative")}>
            <div className="flex flex-row gap-2 items-center w-full justify-start">
                <Link href={pagePaths.allHospitalsPage} className="w-fit p-[6px] rounded-full bg-white border border-gray-400" >
                    <ArrowLeft className="cursor-pointer" size={24} />
                </Link>
                <h1 className="text-2xl font-semi text-slate-900 ">Compare Hospitals</h1>
            </div>
            <div className="flex flex-col bg-white rounded-md p-4 w-11/12 gap-4">
                <div className="flex flex-row items-center gap-14 px-5 w-full flex-wrap">
                    <div className="flex flex-row items-center gap-4 px-5">
                        <div className="flex flex-col w-72 bg-white rounded-md relative">
                            <input autoComplete="off" id="hospitalOne" type="text" placeholder="Hospital One" className="h-10 border border-gray-300 focus:ring-0 focus:outline-gray-400 rounded-xl px-3 py-1 shadow-inner" onChange={(e) => {
                                console.log("Hospital one", e.target.value)
                                setSearchHospitalOne(e.target.value)
                                setShowOptionOne(true)
                            }} />
                            {(searchHospitalOne !== "" && showOptionOne) &&
                                <div className="absolute top-8 right-0 left-0 w-72 rounded-b-md bg-white border border-gray-600 z-20">
                                    {loadingOptionsOne ? <Loading chose="dots" /> : null}
                                    {hospitalOneOptions.map((option, index) => (
                                        <div className="p-2 border-b border-gray-600 flex flex-col gap-1 cursor-pointer" key={index} onClick={(e) => {
                                            setHospitalIdOne(option.id)
                                            document.getElementById("hospitalOne").value = option.name
                                            setHospitalOne(option)
                                            setShowOptionOne(false)
                                        }}>
                                            <span className="text-base text-slate-800">{option.name}</span>
                                            <span className="text-sm text-slate-600">{option.location}</span>
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>
                        <div className="flex flex-col w-72 bg-white rounded-md relative">
                            <input autoComplete="off" id="hospitalTwo" type="text" placeholder="Hospital Two" className="h-10 border border-gray-300 focus:ring-0 focus:outline-gray-400 rounded-xl px-3 py-1 shadow-inner" onChange={(e) => {
                                console.log("Hospital Two", e.target.value)
                                setShowOptionTwo(true)
                                setSearchHospitalTwo(e.target.value)
                            }} />
                            {(searchHospitalTwo !== "" && showOptionTwo) &&
                                <div className="absolute top-8 right-0 left-0 w-72 rounded-b-md bg-white border border-gray-600 z-20">
                                    {loadingOptionsTwo ? <Loading chose="dots" /> : null}
                                    {hospitalTwoOptions.map((option, index) => (
                                        <div className="p-2 border-b border-gray-600 flex flex-col gap-1 cursor-pointer" key={index} onClick={(e) => {
                                            setHospitalIdTwo(option.id)
                                            document.getElementById("hospitalTwo").value = option.name
                                            setHospitalTwo(option)
                                            setShowOptionTwo(false)
                                        }}>
                                            <span className="text-base text-slate-800">{option.name}</span>
                                            <span className="text-sm text-slate-600">{option.location}</span>
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <AsyncSelect
                                cacheOptions
                                isMulti
                                components={animatedComponents}
                                closeMenuOnSelect={false}
                                value={selectedTests}
                                onChange={(selected) => setSelectedTests(selected)}
                                loadOptions={getTestOptions}
                                className="min-w-80"
                                placeholder="Select Tests"
                            />
                        </div>
                    </div>
                    <button className="bg-slate-800 text-white rounded-md p-2 w-28" onClick={async () => {
                        console.log("Compare")
                        if (!hospital_id_one || !hospital_id_two) {
                            document.getElementById("compare-id-error").innerText = "Please select both hospitals. And refresh if something went wrong."
                            return
                        }
                        document.getElementById("compare-id-error").innerText = ""
                        setLoadingOne(true)
                        setLoadingTwo(true)
                        let responseOne = null;
                        let responseTwo = null;
                        if (hospital_id_one) {
                            responseOne = await handleHospitalDataLoad(hospital_id_one, 0)
                        }
                        if (hospital_id_two) {
                            responseTwo = await handleHospitalDataLoad(hospital_id_two, 0)
                        }
                        console.log(responseOne, responseTwo)
                        const { resultA, resultB } = alignArrays(responseOne?.content, responseTwo?.content)
                        setHospitalOneData(resultA)
                        setHospitalTwoData(resultB)
                        setPageInfo({ number: 0, totalPages: Math.max(responseOne?.page?.totalPages, responseTwo?.page?.totalPages) })
                        setLoadingOne(false)
                        setLoadingTwo(false)
                    }}>
                        Compare
                    </button>
                </div>
                <span id="compare-id-error" className="text-red-600 text-sm"></span>
                <div className="flex flex-row w-full p-2">
                    {hospitalOneData &&
                        <div className="flex flex-col gap-3 flex-1 p-2 px-4">
                            <div className="flex flex-row items-center w-full gap-2 justify-center">
                                <span className="text-xl text-slate-800">{hospitalOne?.name}</span>
                                <span className="text-sm text-slate-700 translate-y-[2px]">{hospitalOne?.location}</span>
                            </div>
                            <TestsComponent tests={hospitalOneData} />
                        </div>
                    }
                    {loadingOne && <Loading chose="dots" />}
                    <Separator orientation="vertical" className={"h-full w-[1.5px] bg-gray-400"} />
                    {hospitalTwoData &&
                        <div className="flex flex-col gap-3 flex-1 p-2 px-4">
                            <div className="flex flex-row items-center w-full gap-2 justify-center">
                                <span className="text-xl text-slate-800">{hospitalTwo?.name}</span>
                                <span className="text-sm text-slate-700 translate-y-[2px]">{hospitalTwo?.location}</span>
                            </div>
                            <TestsComponent tests={hospitalTwoData} />
                        </div>
                    }
                    {loadingTwo && <Loading chose="dots" />}
                </div>
                {pageInfo?.totalPages > 1 &&
                    <div className="flex flex-row items-center gap-2 justify-center w-full">
                        <Pagination count={pageInfo?.totalPages} page={pageInfo?.number + 1} onChange={async (e, page) => {
                            if (!hospital_id_one || !hospital_id_two) {
                                document.getElementById("compare-id-error").innerText = "Please select both hospitals. And refresh if something went wrong."
                                return
                            }
                            document.getElementById("compare-id-error").innerText = ""
                            setLoadingOne(true)
                            setLoadingTwo(true)
                            let responseOne = null;
                            let responseTwo = null;
                            if (hospital_id_one) {
                                responseOne = await handleHospitalDataLoad(hospital_id_one, page - 1)
                            }
                            if (hospital_id_two) {
                                responseTwo = await handleHospitalDataLoad(hospital_id_two, page - 1)
                            }
                            const { resultA, resultB } = alignArrays(responseOne?.content, responseTwo?.content)
                            setHospitalOneData(resultA)
                            setHospitalTwoData(resultB)
                            setPageInfo({ number: responseOne?.number, totalPages: Math.max(responseOne?.totalPages, responseTwo?.totalPages) })
                            setLoadingOne(false)
                            setLoadingTwo(false)
                        }}
                            color="primary"
                            variant="outlined"
                            shape="rounded"
                            showFirstButton
                            showLastButton
                        />
                    </div>
                }
                {hospitalOneData && hospitalTwoData &&
                    <div className="flex flex-row items-center gap-2 justify-center w-full text-base">
                        <span className="text-slate-800">Note: The data shown here is based on the tests available in the hospitals. If you don&apos;t find a test, it means the hospital doesn&apos;t provide that test.</span>
                    </div>
                }
            </div>
        </ScrollableContainer>
    )
}

function TestsComponent({ tests = [], pageInfo, setPageInfo, loading, setLoading, backgroundChange = true }) {
    return (
        <div className="flex flex-col gap-2 w-full ">
            {tests?.map((test, index) => (
                <div className={cn("flex flex-row  gap-10 w-full text-nowrap p-2 px-4 shadow-inner rounded-md", index % 2 == 0 ? " bg-slate-100 bg-opacity-100 " : " bg-stone-50")} key={index}>
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-lg text-slate-800 w-44">{test?.name}</span>
                            </TooltipTrigger>
                            {test.testId && <TooltipContent side={"top"}>{test?.description}</TooltipContent>}
                        </Tooltip>
                    </TooltipProvider>
                    <span className="text-xl text-slate-900 font-[500] w-full">{test?.fee} TK</span>
                </div>
            ))}
        </div>
    )
}

export default function ComparePage() {
    return (
        <ComparePageComponent />
    )
}