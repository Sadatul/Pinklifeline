'use client'

import Loading from "@/app/components/loading"
import { blogByIdAnonymousUrl, blogByIdUrl, forumAnsById, forumAnswersByIdAnonymous, forumQuestionByIdAnonymousUrl, forumQuestionByIdUrl, pagePaths, radicalGradient, reportAnalysisThreshold, ReportTypes, resolveComplaint, rountToTwo } from "@/utils/constants"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import * as toxicity from '@tensorflow-models/toxicity';
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import { toast } from "sonner"



function ComplaintsDetails() {
    const searchParams = useSearchParams()
    const params = useParams()
    const router = useRouter()
    const complaintId = params.complaintid
    const type = searchParams.get('type')
    const resourceId = searchParams.get('resourceId')
    const dataCollectUrl = type === ReportTypes.blog ? blogByIdAnonymousUrl(resourceId) : (type === ReportTypes.forumQuestion ? forumQuestionByIdAnonymousUrl(resourceId) : (type === ReportTypes.forumQuestion ? forumAnswersByIdAnonymous(resourceId) : null))
    const [data, setData] = useState(null)
    const [blogContent, setBlogContent] = useState(null)
    const [model, setModel] = useState(null)
    const [analysis, setAnalysis] = useState(null)
    const [loadingAnalysis, setLoadingAnalysis] = useState(true)
    const [loadingData, setLoadingData] = useState(true)

    function formatStringForPrediction(str) {
        return str.replace(/_/g, ' ').toUpperCase();
    }

    useEffect(() => {
        const extractText = (html) => {
            const tempElement = document.createElement('div')
            tempElement.innerHTML = html
            return tempElement.innerText || ''
        }

        if (dataCollectUrl) {
            axiosInstance.get(dataCollectUrl).then((response) => {
                if (type === ReportTypes.blog) {
                    const contentMatched = response.data?.content.match(/<content>(.*?)<\/content>/s)
                    setData(extractText(contentMatched ? contentMatched[1] : null))
                    setBlogContent(contentMatched ? contentMatched[1] : null)
                }
                else if (type === ReportTypes.forumQuestion) {
                    setData(response.data?.body)
                }
                else if (type === ReportTypes.forumAnswer) {
                    setData(response.data?.body)
                }
            }).catch(err => {
                console.log(err)
            }).finally(() => {
                setLoadingData(false)
            })
        }
    }, [])

    useEffect(() => {
        const getModel = async () => {
            const tempModel = await toxicity.load(reportAnalysisThreshold)
            setModel(tempModel)
        }
        getModel()
    }, [])

    useEffect(() => {
        if (data && model && !analysis) {
            console.log("Analyzing")
            if (!loadingAnalysis) {
                setLoadingAnalysis(true)
            }
            model.classify(data).then(predictions => {
                setAnalysis(predictions)
                setLoadingAnalysis(false)
            }).catch(err => {
                setAnalysis(undefined)
                console.log(err)
            })
        }
    }, [data, model, analysis])

    const handleViolated = (complaintId, isViolated) => {
        axiosInstance.delete(resolveComplaint(complaintId), {
            params: {
                violation: isViolated
            }
        }).then((response) => {
            toast.success("Complaint Resolved")
            router.push(pagePaths.complaintsPage)
        }).catch((error) => {
            toast.error("Failed to resolve complaint")
            console.log(error)
        })
    }

    return (
        <div className={cn("flex flex-col w-full flex-1 items-center p-5 break-all", radicalGradient, "from-slate-200 to-slate-100")}>
            <div className="flex flex-col w-11/12 p-4 bg-white rounded-lg shadow-lg gap-2">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-center">Complained Content</h1>
                    <Separator className="w-11/12 h-[1.5px] bg-gray-700" />
                </div>
                <div className="flex flex-row justify-end gap-10 px-24">
                    <button className="rounded w-fit px-2 b py-1order text-sm bg-green-600 text-gray-100 shadow-inner hover:scale-95" onClick={() => {
                        handleViolated(complaintId, false)
                    }}>
                        Not Violated
                    </button>
                    <button className="rounded w-fit px-2 py-1 border text-sm bg-red-600 text-gray-100 shadow-inner hover:scale-95" onClick={() => {
                        handleViolated(complaintId, true)
                    }}>
                        Violated
                    </button>
                </div>
                <div className="flex flex-col w-full p-3 gap-2">
                    <span className="text-lg font-semibold ml-3">Analysis</span>
                    <div className="flex flex-col gap-2 min-h-44 w-full">
                        {loadingAnalysis && <Loader2 size={44} className="animate-spin m-auto" />}
                        {analysis === undefined && <span className="text-lg font-semibold text-red-500 mx-auto mt-5">Analysis Failed</span>}
                        {analysis && analysis.map((prediction, index) => {
                            return (
                                <div key={index} className="flex flex-row justify-between items-center p-2 bg-gray-100 rounded-lg gap-5 w-full">
                                    <span className="text-base font-semibold w-1/6">
                                        {formatStringForPrediction(prediction.label)}
                                    </span>
                                    <span className="w-9/12 flex flex-row items-center gap-2">
                                        <Progress value={prediction.results[0].probabilities[1] * 100} className="bg-white border border-black w-11/12" />
                                        {rountToTwo(prediction.results[0].probabilities[1] * 100)}%
                                    </span>
                                    <span className={cn("text-lg font-semibold w-1/12", prediction.results[0].match ? "text-red-600" : "text-green-600")}>
                                        {prediction.results[0].match ? "Match" : "No Match"}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="w-full p-1 flex flex-col">
                    {loadingData ?
                        <>
                            <span className="text-lg font-semibold">Content</span>
                            <Separator className="w-full h-[1.5px] bg-gray-700" />
                            <Loader2 size={44} className="animate-spin m-auto" />
                        </>
                        :
                        <>
                            {type === ReportTypes.blog &&
                                <div className="flex flex-col gap-2 w-full">
                                    <span className="text-lg font-semibold ml-3">Blog Content</span>
                                    <Separator className="w-full h-[1.5px] bg-gray-700" />
                                    <div className="flex flex-col p-1">
                                        <div dangerouslySetInnerHTML={{ __html: blogContent }} />
                                    </div>
                                </div>
                            }
                            {type === ReportTypes.forumQuestion &&
                                <div className="flex flex-col gap-2 w-full">
                                    <span className="text-lg font-semibold ml-3">Question Content</span>
                                    <Separator className="w-full h-[1.5px] bg-gray-700" />
                                    <div className="flex flex-col p-1 break-all text-wrap text-base">
                                        {data}
                                    </div>
                                </div>
                            }
                            {type === ReportTypes.forumAnswer &&
                                <div className="flex flex-col gap-2 w-full">
                                    <span className="text-lg font-semibold ml-3">Answer Content</span>
                                    <Separator className="w-full h-[1.5px] bg-gray-700" />
                                    <div className="flex flex-col p-1 break-all text-wrap text-base">
                                        {data}
                                    </div>
                                </div>
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    )
}

export default function ComplaintSDetailsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ComplaintsDetails />
        </Suspense>
    )
}