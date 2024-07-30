'use client'

import { useSessionContext } from "@/app/context/sessionContext";
import { pagePaths, validateTransactionUrl } from "@/utils/constants";
import axiosInstance from "@/utils/axiosInstance"
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ValidatePage() {
    const sessionContext = useSessionContext();
    const [validationSuccessfullStatus, setValidationSuccessfulStatus] = useState(0);
    const [countdown, setCountdown] = useState(null);
    const searchParams = useSearchParams();
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            const transactionId = searchParams.get('transactionId');
            const appointmentId = searchParams.get('appointmentId');
            console.log(transactionId);
            axiosInstance.get(validateTransactionUrl(appointmentId, transactionId)).then((res) => {
                setValidationSuccessfulStatus(res.status);
                setCountdown(5);
            }).catch((error) => {
                console.log("Error verifying payment", error)
                setValidationSuccessfulStatus(400)
                setCountdown(5);
            })
        }, 5000)
    }, [])
    useEffect(() => {
        let timer = null;
        if (countdown === null || countdown === undefined) return;
        if (countdown === 0) {
            router.push(pagePaths.dashboard)
        }
        else {
            timer = setTimeout(() => {
                setCountdown(countdown - 1)
            }, 1000)
        }
        return () => clearTimeout(timer)
    }, [validationSuccessfullStatus, countdown])

    return (
        <div className="h-screen w-full flex flex-col justify-center items-center">
            {(validationSuccessfullStatus === 0) && < h1 className="text-5xl text-black font-serif font-semibold mb-8">Validating Transaction ....</h1>}
            {(validationSuccessfullStatus === 400) && <h1 className="text-5xl text-black font-serif font-semibold mb-8">Transaction Failed. Please try again</h1>}
            {(validationSuccessfullStatus === 200) && <h1 className="text-5xl text-black font-serif font-semibold mb-8">Transaction Successfull</h1>}
            {(validationSuccessfullStatus === 202) && <h1 className="text-5xl text-black font-serif font-semibold mb-8">Transaction failed because you have not paid yet.</h1>}
            {((validationSuccessfullStatus !== 0) && countdown && (countdown !== 0)) && <p className="text-2xl text-black font-serif font-semibold mb-8">Redirecting in {countdown} seconds</p>}
        </div >
    )
}