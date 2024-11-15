'use client'
import Avatar from "@/app/components/avatar"
import Loading from "@/app/components/loading"
import ScrollableContainer from "@/app/components/StyledScrollbar"
import { useSessionContext } from "@/app/context/sessionContext"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTrigger, DialogTitle, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { addReview, emptyAvatar, getHospitalReviewByIdUrl, getHospitalsAnonymousUrl, getMedicalTestAnonymousUrl, hospitalReviewSummaryUrl, hospitalReviewsUrl, medicalTestHospitalAdminUrl, medicalTestHospitalAnonymousUrl, medicalTestHospitalByIdAdminUrl, pagePaths, radicalGradient, roles, rountToTwo } from "@/utils/constants"
import { Pagination } from "@mui/material"
import { Rating } from "primereact/rating"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { debounce, round, set } from "lodash"
import { ArrowLeft, Check, Clock, Loader, Pencil, Plus, Search, Star, StarHalf, Trash2, X } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { FaBangladeshiTakaSign } from "react-icons/fa6"

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
    const sessionContext = useSessionContext()
    const [reviewInfo, setReviewInfo] = useState(null)
    const [ratingIcon, setRatingIcon] = useState(null)
    const [reviews, setReviews] = useState([])
    const router = useRouter()

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
            axiosInstance.get(hospitalReviewSummaryUrl(hospitalId)).then((response) => {
                setReviewInfo(response.data)
                console.log("review info", response.data)

            }).catch((error) => {
                console.log(error)
            })
            // axiosInstance.get(hospitalReviewsUrl(hospitalId)).then((response) => {
            //     setReviews(response.data)
            // }).catch((error) => {
            //     console.log(error)
            // })
        }
    }, [hospitalId])

    useEffect(() => {
        if (reviewInfo) {
            setRatingIcon(reviewInfo?.averageRating <= 2.5 ? <Star strokeWidth={1.5} size={24} className={cn(" text-transparent text-[#FFD700]")} /> : reviewInfo?.averageRating < 4 ? <StarHalf size={24} fill="#FFD700" className={cn("text-transparent")} /> : <Star size={24} fill="#FFD700" className={cn("text-transparent")} />)
        }
    }, [reviewInfo])

    useEffect(() => {
        if (hospitalId && loadingAddedTests) {
            axiosInstance.get(medicalTestHospitalAnonymousUrl, {
                params: {
                    hospitalId: hospitalId,
                    pageNo: currentPage.current - 1,
                    name: document.getElementById("searchTest")?.value
                }
            }).then((response) => {
                setAddedTests([...response.data?.content])
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
        <ScrollableContainer className={cn("flex flex-col w-full flex-1 bg-gray-100 gap-2 overflow-x-hidden")}>
            <div className="flex flex-row gap-3 items-center pt-3 pl-5">
                <button className="w-fit bg-white rounded-full p-2 border border-gray-300 hover:scale-90 transition-all ease-linear" onClick={() => {
                    if (sessionContext?.sessionData?.userId) {
                        window.history.back()
                    } else {
                        window.location.href = pagePaths.allHospitalsPage
                    }
                }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-semibold text-slate-900">Hospital Details</h2>
            </div>
            <div className="flex flex-col gap-4 w-11/12 mx-auto ">
                <div className="flex flex-row w-full bg-white p-5 rounded-xl shadow-md ">
                    <div className="flex flex-col gap-2 w-1/2  break-normal">
                        <div className="flex flex-row gap-2">
                            <p className="text-lg font-semibold text-slate-900 w-28">Name</p>
                            <p className="text-lg text-slate-900 flex-1">{hospital.name}</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <p className="text-lg font-semibold text-slate-900 w-28">Location</p>
                            <p className="text-lg text-slate-900 flex-1">{hospital.location}</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <p className="text-lg font-semibold text-slate-900 w-28">Description</p>
                            <p className="text-lg text-slate-900 flex-1">{hospital.description}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/2  break-normal">
                        <div className="flex flex-row gap-2">
                            <p className="text-lg font-semibold text-slate-900 w-24">Contact</p>
                            <p className="text-lg text-slate-900 flex-1">{hospital.contactNumber}</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <p className="text-lg font-semibold text-slate-900 w-24">Email</p>
                            <p className="text-lg text-slate-900 flex-1">{hospital.email}</p>
                        </div>
                        {sessionContext?.sessionData?.userId &&
                            <div className="flex flex-row gap-2">
                                <div className="text-lg font-semibold text-slate-900 w-24">Rating</div>
                                <Popover>
                                    <PopoverTrigger className="w-fit">
                                        {(ratingIcon !== null) &&
                                            <div className="flex flex-row items-center flex-1">
                                                {ratingIcon}
                                                <span className="text-base font-semibold ml-2 break-normal w-10 text-left">{rountToTwo(reviewInfo?.averageRating)}</span>
                                            </div>}
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto " side="right" asChild>
                                        <div className="bg-white p-1 rounded-md">
                                            {reviewInfo && reviewInfo?.ratingCount?.slice().reverse().map((rating, index) => (
                                                <div key={index} className="flex flex-row items-center p-2">
                                                    <div className="flex flex-row flex-1">
                                                        {reviewInfo?.ratingCount.slice(index).map((rating2, index2) => (
                                                            <Star key={index + "" + index2} fill="#FFD700" className={cn("w-4 h-4 text-transparent")} />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm ml-2 text-right">{rating}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        }
                    </div>
                </div>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex flex-row gap-8 w-full justify-between items-end px-3">
                            <h2 className="text-xl font-bold text-slate-900">Tests</h2>
                            <div className="flex flex-row gap-2 items-center">
                                <input autoComplete="off" id="searchTest" type="text" placeholder="Search Test" className="w-64 py-1 h-9 text-sm px-4 focus:outline-gray-400 shadow-inner border border-gray-300 rounded-2xl" />
                                <button className="flex items-center justify-center p-2 rounded-xl bg-pink-300" onClick={() => {
                                    setLoadingAddedTests(true)
                                }}>
                                    <Search size={18} className="text-gray-700" />
                                </button>
                            </div>
                        </div>
                        <Separator className="w-full h-[1.5px] bg-gray-400" />
                    </div>
                    <div className="flex flex-row items-center flex-wrap gap-4 w-full">
                        {loadingAddedTests && <Loader size={32} className="animate-spin" />}
                        {!loadingAddedTests && addedTests.map((test, index) => (
                            <AddedTest key={index} test={test} setLoadingAddedTests={setLoadingAddedTests} />
                        ))}
                    </div>
                    <div className="flex flex-col w-full gap-2 px-3">
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
                        // variant="outlined"
                        />
                    </div>
                </div>
                {sessionContext?.sessionData?.userId && sessionContext?.sessionData?.role !== roles.admin &&
                    < div className="flex flex-col w-full gap-1">
                        <span className="text-xl font-bold text-slate-900">Reviews</span>
                        <Separator className="w-full h-[1.5px] bg-gray-400" />
                        <ReviewSection hospitalId={hospitalId} className="w-full" reviewInfo={reviewInfo} setReviewInfo={setReviewInfo} />
                    </ div>
                }
            </div>
        </ScrollableContainer>
    )
}

function AddedTest({ test, setLoadingAddedTests }) {
    const [mutableTest, setMutableTest] = useState(test)
    const [editabled, setEditabled] = useState(false)

    return (
        <div className="flex flex-row gap-2 w-fit justify-between p-0 bg-white rounded-xl h-28 break-normal shadow-md hover:scale-105 transition-all">
            <div className="flex flex-col gap-1 w-56 p-3 h-full justify-center">
                <p className="text-base text-slate-900">{mutableTest.name}</p>
                <p className="text-sm text-slate-700 line-clamp-3">{mutableTest.description}</p>
            </div>
            <div className="flex flex-col gap-1 justify-center items-center w-24 bg-gray-700 flex-1 rounded-r-xl ">
                <div className="text-lg text-slate-100 flex items-center font-[500]">
                    <FaBangladeshiTakaSign size={18} className="text-slate-100" />
                    {mutableTest.fee}
                </div>
            </div>
        </div>
    )
}


function ReviewSection({ hospitalId, className, reviewInfo, setReviewInfo }) {
    const sessionContext = useSessionContext()
    const [doctorReviews, setDoctorReviews] = useState([])
    const [fetchAgain, setFetchAgain] = useState(true)
    const [userReview, setUserReview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [addReviewDialog, setAddReviewDialog] = useState(false)
    const [selectedRating, setSelectedRating] = useState(0)

    useEffect(() => {
        if (sessionContext?.sessionData && fetchAgain) {
            axiosInstance.get(hospitalReviewsUrl(hospitalId)).then((res) => {
                console.log("doctor reviews", res.data)
                setUserReview(res.data.find((review) => review.reviewerId === sessionContext?.sessionData.userId) || null)
                setDoctorReviews(res.data.filter((review) => review.reviewerId !== sessionContext?.sessionData.userId))
                setLoading(false)
                setFetchAgain(false)
            }).catch((error) => {
                console.log(error)
                toast.error("Error fetching data check internet.")
                setLoading(false)
                setFetchAgain(false)
            })
        }
    }, [sessionContext?.sessionData, fetchAgain, hospitalId])

    if (loading) return <Loading chose="hand" />

    return (
        <div className={cn("flex flex-col w-full rounded", className)}>
            <div className="flex flex-col rounded p-4 w-full">
                <div className="flex flex-col items-end w-full">
                    {!userReview ?
                        <Dialog open={addReviewDialog} onOpenChange={(e) => {
                            setAddReviewDialog(e)
                            setSelectedRating(0)
                            if (!e) {
                                document.getElementById("add-review-text").value = ""
                                document.getElementById("error-message").classList.add("hidden")
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button className="w-24 flex items-center text-white">
                                    Add Review
                                </Button>
                            </DialogTrigger>
                            <DialogContent >
                                <DialogHeader>
                                    <DialogTitle>
                                        Write your message
                                    </DialogTitle>
                                </DialogHeader>
                                <DialogDescription asChild>
                                    <div className="flex flex-col w-full items-end gap-3">
                                        <div className="flex flex-col w-full gap-3 items-center h-fit" >
                                            <div className="flex flex-row items-center justify-center p-2 gap-3 w-full h-fit">
                                                <Rating
                                                    value={selectedRating}
                                                    onChange={(e) => setSelectedRating(e.value)}
                                                    offIcon={<Star fill="#ffffff" size={26} strokeWidth={1.5} className=" text-gray-700" />}
                                                    onIcon={<Star fill="#ffe234" size={28} className="text-[#ffe234]" />}
                                                />
                                            </div>
                                            <textarea id="add-review-text" className="p-3 flex-1 bg-white shadow-inner border text-black border-gray-300 focus:outline-gray-400 w-full rounded-lg " placeholder="Write message..." rows={6} type="text" maxLength={255} />
                                        </div>
                                        <span id="error-message" className="text-sm font-semibold text-end w-full text-red-500 hidden">Please provide a rating at least</span>
                                        <Button className="w-24"
                                            onClick={() => {
                                                if (!sessionContext?.sessionData?.userId) {
                                                    toast.error("Please login to add review")
                                                    return
                                                }
                                                const comment = document.getElementById("add-review-text")?.value
                                                const rating = selectedRating
                                                if (Number(rating) !== 0) {
                                                    axiosInstance.post(`${hospitalReviewsUrl(sessionContext?.sessionData?.userId)}`, {
                                                        rating: rating,
                                                        id: hospitalId,
                                                        comment: comment
                                                    }).then((res) => {
                                                        setReviewInfo(res?.data)
                                                        console.log("review added", res.data)
                                                        setFetchAgain(true)
                                                        setLoading(true)
                                                        setAddReviewDialog(false)
                                                        //need to set the structure
                                                        toast.success("Review Added")
                                                    }).catch((error) => {
                                                        console.log(error)
                                                        toast.error("Error adding review")
                                                    })
                                                } else {
                                                    document.getElementById("error-message").classList.remove("hidden")
                                                }
                                            }}>
                                            Add Review
                                        </Button>
                                    </div>
                                </DialogDescription>
                            </DialogContent>
                        </Dialog> :
                        <></>
                    }
                </div>
                {(!doctorReviews?.length > 0 && !userReview) && <h1 className="text-3xl font-semibold text-center m-4">No reviews found</h1>}
                <div className="flex flex-col items-center gap-5">
                    {userReview ?
                        <UserReviewCard
                            data={userReview}
                            reviewInfo={reviewInfo}
                            setReviewInfo={setReviewInfo}
                            id={userReview?.id}
                            reviewerId={userReview?.reviewerId}
                            setUserReview={setUserReview}
                            setFetchAgain={setFetchAgain}
                            profilePicture={userReview.profilePicture}
                        /> :
                        <></>
                    }
                    {doctorReviews?.map((review, index) => (
                        <ReviewCard key={index}
                            reviewer={review.reviewerName}
                            content={review.comment}
                            date={review.timestamp}
                            rating={review.rating}
                            reviewerId={review.reviewerId}
                            profilePicture={review.profilePicture}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function UserReviewCard({ data, setReviewInfo, id, reviewerId, setUserReview, setFetchAgain, profilePicture }) {
    const sessionContext = useSessionContext()
    const [editable, setEditable] = useState(false)
    const textContentRef = useRef(null)
    const ratingRef = useRef(null)
    const [selectedRating, setSelectedRating] = useState(data.rating)

    const deleteReview = () => {
        axiosInstance.delete(getHospitalReviewByIdUrl(sessionContext?.sessionData.userId, id)).then((res) => {
            console.log("deleted review", res.data)
            setReviewInfo(res?.data)
            setUserReview(null)

        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <div className="flex flex-col w-10/12 items-start bg-white gap-2 rounded-xl shadow-md relative p-3 px-5">
            <div className="flex flex-col justify-between w-full items-start  text-black rounded-md  py-1">
                <div className="flex flex-row py-1 items-center gap-3">
                    <Avatar avatarImgSrc={profilePicture || emptyAvatar} size={44} />
                    <h1 className="text-lg font-semibold line-clamp-1">{data?.reviewerName?.split("@")[0]}</h1>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex flex-col py-1 items-start justify-center">
                        {editable ? (
                            <Rating
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(e.value)}
                                offIcon={<Star fill="#ffffff" size={24} strokeWidth={1.5} className=" text-gray-700" />}
                                onIcon={<Star fill="#ffe234" size={26} className="text-[#ffe234]" />}
                            />
                        ) : (
                            <div className="flex flex-row items-start">
                                <Rating
                                    value={data.rating}
                                    readOnly
                                    offIcon={<Star fill="#ffffff" size={24} strokeWidth={1.5} className=" text-gray-700" />}
                                    onIcon={<Star fill="#ffe234" size={26} className="text-[#ffe234]" />}
                                    cancel={false}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-row gap-2">
                        <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {formatDistanceToNow(new Date(data.timestamp), { addSuffix: true })}
                        </span>
                    </div>
                    <div className="flex flex-row gap-3 absolute top-3 right-3">
                        {
                            editable ? (
                                <>
                                    <button className="bg-gray-100 text-black px-2 h-10 text-base rounded-md font-semibold"
                                        onClick={() => {
                                            const newContent = textContentRef.current?.value
                                            const newRating = selectedRating
                                            if ((newRating !== data.rating && newRating) || newContent !== data.content) {
                                                const headers = { 'Authorization': `Bearer ${sessionContext?.sessionData.token}` }
                                                axiosInstance.put(getHospitalReviewByIdUrl(sessionContext?.sessionData.userId, id), {
                                                    rating: newRating,
                                                    comment: newContent
                                                }).then((res) => {
                                                    console.log("updated review", res.data)
                                                    setReviewInfo(res?.data)
                                                    setFetchAgain(true)
                                                    toast.success("Successfully updated")
                                                    setEditable(false)
                                                }).catch((error) => {
                                                    console.log(error)
                                                    toast.error("Error updating review")
                                                    setEditable(false)
                                                })
                                            }
                                        }}>
                                        <Check size={32} className="text-green-600" />
                                    </button>
                                    <button className="px-2 py-1 text-red-500"
                                        onClick={() => {
                                            setEditable(false)
                                            setSelectedRating(data.rating)
                                        }}>
                                        <X size={32} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-3">
                                    <button className="  px-2 text-base font-semibold"
                                        onClick={() => {
                                            setEditable(true)
                                        }}>
                                        <Pencil size={28} className="" />
                                    </button>
                                    <button className="px-2 py-1 text-[#ff5151] font-semibold"
                                        onClick={() => {
                                            deleteReview()
                                        }}>
                                        <Trash2 size={28} />
                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
            {editable ? <textarea ref={textContentRef} className="border w-full border-gray-300 bg-white p-3 rounded-xl shadow-inner" defaultValue={data.comment} /> : (<p className=" text-lg py-1 mb-1">{data.comment}</p>)}
        </div>
    )
}

function ReviewCard({ content, date, rating, reviewer, reviewerId, profilePicture }) {
    return (
        <div className="flex flex-col w-10/12 items-start bg-zinc-100 gap-2 rounded-md relative p-3">
            <div className="flex flex-col justify-between w-full items-start  text-black rounded-md px-5 py-1">
                <div className="flex flex-row py-1 items-center gap-3">
                    <Avatar avatarImgSrc={profilePicture || emptyAvatar} size={44} />
                    <h1 className="text-lg font-semibold line-clamp-1">{reviewer.split("@")[0]}</h1>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex flex-col py-1 items-start justify-center">
                        <div className="flex flex-row items-start">
                            {[...Array(rating)].map((_, index) => (
                                <Star size={24} key={index} fill="#FFD700" className={cn("text-transparent")} />
                            ))}
                            {[...Array(5 - rating)].map((_, index) => (
                                <Star size={24} key={index} fill="#818181" className={cn("text-transparent")} />
                            ))}

                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {formatDistanceToNow(new Date(date), { addSuffix: true })}
                        </span>
                    </div>
                </div>
            </div>
            <p className=" text-lg py-1 px-3 mb-1">{content}</p>
        </div>
    )
}

export default function AddMedicalTestsPage() {
    return (
        <AddTest />
    )
}