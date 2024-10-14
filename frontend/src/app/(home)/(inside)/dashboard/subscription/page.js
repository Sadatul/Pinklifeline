'use client'

import { useSessionContext } from "@/app/context/sessionContext"
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { freeTrianReqUrl, frontEndUrl, logoutUrlReq, pagePaths, parseDate, radicalGradient, roles, sessionDataItem, subscribeUrl, subscriptionPlansUrl, userSubscriptionUrl } from "@/utils/constants"
import { format } from "date-fns"
import { ArrowRight, ChevronsRight } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function SubsriptionPage() {
    const [currentPlan, setCrrentPlan] = useState(null)
    const [subscriptionPlans, setSubscriptionPlans] = useState([])
    const [subscriptionPlansIndices, setSubscriptionPlansIndices] = useState(null)
    const [openPaymentModal, setOpenPaymentModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const sessionContext = useSessionContext()
    const [selectedPlan, setSelectedPlan] = useState(null)

    useEffect(() => {
        if (sessionContext?.sessionData) {
            axiosInstance.get(subscriptionPlansUrl).then((response) => {
                setSubscriptionPlans(Object.entries(response.data).filter(([name]) => name.startsWith(sessionContext?.sessionData.role === roles.doctor ? "DOCTOR" : "USER")).map(([name, price]) => ({
                    name,
                    price
                })))
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoading(false)
            })
            axiosInstance.get(userSubscriptionUrl).then((response) => {
                console.log("subscription data current user ",response.data)
                console.log("subscription data date  current user ",(parseDate(response.data?.expiryDate)))
                if (!response.data?.expiryDate || (parseDate(response.data?.expiryDate) < new Date())) {
                    setCrrentPlan(null)
                }
                else {
                    setCrrentPlan(response.data)
                }
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
            })
        }
    }, [sessionContext?.sessionData])

    useEffect(() => {
        if (subscriptionPlans.length > 0) {
            setSubscriptionPlansIndices(subscriptionPlans.reduce((acc, plan, index) => {
                acc[plan.name] = index;
                return acc;
            }, {}));
        }
    }, [subscriptionPlans])

    return (
        <div className={cn(radicalGradient, "w-full flex flex-col items-center p-2 gap-4 flex-1 bg-white")}>
            <div className="w-full flex flex-col  items-center p-5 rounded flex-1">
                <h1 className="text-2xl font-bold">Subscriptions</h1>
                <div className="flex flex-col items-start gap-2 w-full text-left text-lg font-semibold">
                    <div className="flex items-center gap-2 text-nowrap text-base">
                        <span className="w-24">Current Plan</span>
                        <span className="">: {currentPlan && currentPlan?.type?.replace("_", " ") || "Free"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-nowrap text-base">
                        <span className="w-24">Expiry Date</span>
                        <span className="">: {currentPlan && format(parseDate(currentPlan?.expiryDate), "dd/MM/yyyy hh:mm a") || "N/A"}</span>
                    </div>
                </div>
                <div className="w-full flex flex-row items-center justify-center gap-4 flex-wrap p-4 flex-1">
                    <SubscriptionCard
                        planName={sessionContext?.sessionData?.role === roles.doctor ? "DOCTOR FREE Trial" : "USER FREE Trial"}
                        price={"FREE"}
                        disabled={currentPlan?.type}
                    />
                    {subscriptionPlans.map((plan, index) => (
                        <SubscriptionCard
                            key={index}
                            planName={plan.name}
                            price={plan.price}
                            disabled={currentPlan?.type}
                        />
                    ))}
                </div>
                <div className="w-full flex items-center justify-end px-10 py-4">
                </div>
            </div>
        </div>
    )
}

function SubscriptionCard({ planName, price, onClick, isCurrent, expiarationDate, isSelected, disabled }) {
    const features = []
    const sessionContext = useSessionContext()
    if (planName.startsWith("DOCTOR")) {
        features.push("Unlimited Consultations")
        features.push("Unlimited Prescriptions")
    }
    else if (planName.startsWith("USER")) {
        features.push("Unlimited Consultations")
        features.push("Unlimited Prescriptions")
        features.push("Ai Health Assistant")
    }

    return (
        <div className="w-64 h-96 bg-transparent rounded-lg shadow-md flex flex-col items-stretch justify-between gap-4 border border-gray-200">
            <div className="w-full h-20 bg-gray-300 rounded-t-lg flex flex-col items-center justify-center p-4 border-b border-gray-300 relative">
                <h1 className="text-lg font-bold">{planName.replace("_", " ")}</h1>
                <span className="text-sm font-bold">{price}</span>
                {planName.includes("FREE") && <span className="text-xs font-semibold absolute bottom-0">One Month</span>}
            </div>
            <div className="w-full flex flex-col gap-2 items-center px-4">
                {features.map((feature, index) => (
                    <div key={index} className="w-full flex items-center gap-2 flex-1">
                        <span className="text-sm font-semibold">-</span>
                        <span className="text-sm font-semibold break-all">{feature}</span>
                    </div>
                ))}
            </div>
            <div className="w-full h-fit flex items-end justify-center bg-gradient-to-blrounded-lg">
                {price === "FREE" ?
                    <Dialog >
                        <DialogTrigger asChild>
                            <button disabled={disabled} className="h-12 bg-amber-200 text-black font-bold rounded-b-lg shadow-md w-full group relative flex flex-row items-center justify-center" >
                                <span className="flex items-center transform transition-transform duration-300 ease-in-out group-hover:-translate-x-6">
                                    Subscribe
                                </span>
                                <span className="ml-4 transform transition-transform duration-500 ease-in-out opacity-0 group-hover:opacity-100 translate-x-14 group-hover:translate-x-16 absolute right-1/2">
                                    <ChevronsRight color="black" size={36} />
                                </span>
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Confirmation
                                </DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to subscirbe for free tiral
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <button className="w-24 py-1 bg-gray-100 border border-gray-500 shadow-inner text-black font-bold rounded-lg "
                                        onClick={() => {
                                            toast.loading("Subscribing...")
                                            axiosInstance.put(freeTrianReqUrl).then((response) => {
                                                console.log(response)
                                                toast.dismiss()
                                                toast.success("Subscribed successfully")
                                                axiosInstance.get(logoutUrlReq).then((res) => {
                                                    localStorage.removeItem(sessionDataItem)
                                                    sessionStorage.removeItem("profilePicLink")
                                                    window.location.href = frontEndUrl
                                                }).catch((error) => {
                                                    console.log("error logging out", error)
                                                })
                                            }).catch((error) => {
                                                console.log(error)
                                                toast.dismiss()
                                                toast.error("Subscription failed")
                                            })
                                        }}>Subscribe</button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    :
                    <Dialog >
                        <DialogTrigger asChild>
                            <button disabled={disabled} className="h-12 bg-amber-200 text-black font-bold rounded-b-lg shadow-md w-full group relative flex flex-row items-center justify-center" >
                                <span className="flex items-center transform transition-transform duration-300 ease-in-out group-hover:-translate-x-6">
                                    Subscribe
                                </span>
                                <span className="ml-4 transform transition-transform duration-500 ease-in-out opacity-0 group-hover:opacity-100 translate-x-14 group-hover:translate-x-16 absolute right-1/2">
                                    <ChevronsRight color="black" size={36} />
                                </span>
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Payment Inputs
                                </DialogTitle>
                                <DialogDescription>
                                    Enter your payment details
                                </DialogDescription>
                            </DialogHeader>
                            <label className="w-full flex flex-col gap-2">
                                <span className="text-sm font-semibold">Customer Name</span>
                                <input id="customerName" type="text" className=" flex-1 h-10 p-2 rounded-lg border border-gray-200" />
                            </label>
                            <label className="w-full flex flex-col gap-2">
                                <span className="text-sm font-semibold">Customer Email</span>
                                <input id="customerEmail" type="email" className=" flex-1 h-10 p-2 rounded-lg border border-gray-200" />
                            </label>
                            <label className="w-full flex flex-col gap-2">
                                <span className="text-sm font-semibold">Mobile Number</span>
                                <input id="customerNumber" type="number" className="number-input flex-1 h-10 p-2 rounded-lg border border-gray-200" />
                            </label>
                            <span className="text-sm font-semibold">Plan {planName}</span>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <button className="w-32 h-12 bg-gray-100 border border-gray-500 shadow-inner text-black font-bold rounded-lg "
                                        onClick={() => {
                                            toast.loading("Subscribing...")
                                            if (document.getElementById("customerName").value?.trim() !== '' && document.getElementById("customerEmail").value.trim() !== '' && document.getElementById("customerNumber").value?.trim() !== '') {
                                                axiosInstance.post(subscribeUrl(sessionContext?.sessionData?.userId), {
                                                    "customerName": document.getElementById("customerName").value,
                                                    "customerEmail": document.getElementById("customerEmail").value,
                                                    "customerPhone": document.getElementById("customerNumber").value,
                                                    "subscriptionType": planName
                                                }).then((response) => {
                                                    console.log(response)
                                                    toast.dismiss()
                                                    toast.success("Subscribed successfully")
                                                    window.location.href = response.data.gatewayUrl
                                                }).catch((error) => {
                                                    console.log(error)
                                                    toast.dismiss()
                                                    toast.error("Subscription failed")
                                                })
                                            }
                                            else {
                                                toast.error("All fields are required")
                                            }
                                        }}>Subscribe</button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            </div>
        </div>
    )
}