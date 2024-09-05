'use client'

import { useSessionContext } from "@/app/context/sessionContext"
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { radicalGradient, roles, subscribeUrl, subscriptionPlansUrl, userSubscriptionUrl } from "@/utils/constants"
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
        if (sessionContext.sessionData) {
            axiosInstance.get(subscriptionPlansUrl).then((response) => {
                setSubscriptionPlans(Object.entries(response.data).filter(([name]) => name.startsWith(sessionContext.sessionData.role === roles.doctor ? "DOCTOR" : "USER")).map(([name, price]) => ({
                    name,
                    price
                })))
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoading(false)
            })
            axiosInstance.get(userSubscriptionUrl).then((response) => {
                setCrrentPlan(response.data)
                console.log(response.data)
                // setSelectedPlan(response.data.type)
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
            })
        }
    }, [sessionContext.sessionData])

    useEffect(() => {
        if (subscriptionPlans.length > 0) {
            setSubscriptionPlansIndices(subscriptionPlans.reduce((acc, plan, index) => {
                acc[plan.name] = index;
                return acc;
            }, {}));
        }
    }, [subscriptionPlans])

    return (
        <div className={cn(radicalGradient, "from-neutral-200 to-neutral-100 w-full flex flex-col items-center p-5 gap-4 flex-1")}>
            <h1 className="text-2xl font-bold">Subscriptions</h1>
            <div className="w-full flex flex-col bg-white items-center p-5 rounded">
                <span className="flex flex-row items-center gap-2 w-full text-left text-lg font-semibold">
                    <span>Current Plan</span>
                    <span className="text-lg font-semibold">{currentPlan && currentPlan.type || "Free"}</span>
                    <span className="text-base font-semibold">{currentPlan && currentPlan.expiryDate}</span>
                </span>
                <div className="w-full flex flex-row items-center justify-center gap-4 flex-wrap p-4">
                    {subscriptionPlans.map((plan, index) => (
                        <SubscriptionCard
                            key={index}
                            planName={plan.name}
                            price={plan.price}
                            onClick={() => setSelectedPlan(plan.name)}
                            isSelected={selectedPlan === plan.name}
                            isCurrent={
                                currentPlan && currentPlan.type === plan.name
                            }
                            expiarationDate={
                                currentPlan && currentPlan.expiryDate
                            }
                        />
                    ))}
                </div>
                <div className="w-full flex items-center justify-end px-10 py-4">
                    <Dialog >
                        <DialogTrigger asChild>

                            <button className="w-32 h-12 bg-amber-200 text-black font-bold rounded-lg shadow-md" >Subscribe</button>
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
                            <span className="text-sm font-semibold">Plan {selectedPlan}</span>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <button className="w-32 h-12 bg-gray-100 border border-gray-500 shadow-inner text-black font-bold rounded-lg "
                                        onClick={() => {
                                            if (currentPlan.type === selectedPlan) {
                                                return toast.error("You are already subscribed to this plan")
                                            }
                                            if (!selectedPlan) {
                                                return toast.error("Select a plan to subscribe")
                                            }
                                            toast.loading("Subscribing...")
                                            axiosInstance.post(subscribeUrl(sessionContext.sessionData.userId), {
                                                "customerName": document.getElementById("customerName").value,
                                                "customerEmail": document.getElementById("customerEmail").value,
                                                "customerPhone": document.getElementById("customerNumber").value,
                                                "subscriptionType": selectedPlan
                                            }).then((response) => {
                                                console.log(response)
                                                toast.dismiss()
                                                toast.success("Subscribed successfully")
                                                window.location.href = response.data.gatewayUrl
                                            }).catch((error) => {
                                                console.log(error)
                                                toast.error("Subscription failed")
                                            })
                                        }}>Subscribe</button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

        </div>
    )
}

function SubscriptionCard({ planName, price, onClick, isCurrent, expiarationDate, isSelected }) {
    const features = [
        "Feature 1",
        "Feature 2",
        "Feature 3",
        "Feature 4",
        "Feature 5",
    ]

    return (
        <div className="w-64 h-96 bg-transparent rounded-lg shadow-md flex flex-col items-center justify-center gap-4 border border-gray-200">
            <div className="w-full h-20 bg-gradient-to-tr from-white via-white to-amber-200 rounded-t-lg flex flex-col items-center justify-center p-4 border-b border-gray-300">
                <h1 className="text-lg font-bold">{planName}</h1>
                <span className="text-sm font-bold">{price}</span>
                {isCurrent &&
                    <span className="text-sm font-semibold">
                        Current Plan till {expiarationDate}
                    </span>
                }
            </div>
            <div className="w-full flex flex-col gap-2 items-center p-10">
                {features.map((feature, index) => (
                    <div key={index} className="w-full flex items-center">
                        <span className="text-sm font-semibold w-10">-</span>
                        <span className="text-sm font-semibold break-all">{feature}</span>
                    </div>
                ))}
            </div>
            <div className="w-full h-20 flex items-center justify-center bg-gradient-to-bl from-white via-white to-amber-200 rounded-lg">
                <button className={cn("w-6 h-6 rounded-full border-gray-400 border-2", isSelected ? `${radicalGradient} from-blue-600 to-blue-200` : "bg-white")} onClick={onClick}></button>
            </div>
        </div>
    )
}