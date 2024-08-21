'use client'

import Loading from "@/app/components/loading"
import { blogByIdUrl, forumAnsById, forumQuestionByIdUrl, ReportTypes } from "@/utils/constants"
import axios from "axios"
import { useParams, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"



function ComplaintsDetails() {
    const searchParams = useSearchParams()
    const params = useParams()
    const complaintId = params.complaintid
    const type = searchParams.get('type')
    const resourceId = searchParams.get('resourceId')
    const dataCollectUrl = type === ReportTypes.blog ? blogByIdUrl(resourceId) : (type === ReportTypes.forumQuestion ? forumQuestionByIdUrl(resourceId) : (type === ReportTypes.forumQuestion ? forumAnsById(resourceId) : null))
    const [data, setData] = useState(null)
    useEffect(() => {
        const extractText = (html) => {
            const tempElement = document.createElement('div')
            tempElement.innerHTML = html
            return tempElement.innerText || ''
        }

        if (dataCollectUrl) {
            axios.get(dataCollectUrl).then((response) => {
                if (type === ReportTypes.blog) {
                    setData(extractText(response.data?.content))
                }
                else if (type === ReportTypes.forumQuestion) {
                    setData(response.data?.body)
                }
                else if (type === ReportTypes.forumAnswer) {
                    setData(response.data?.body)
                }
            })
        }
    }, [])
}

export default function ComplaintSDetailsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ComplaintsDetails />
        </Suspense>
    )
}