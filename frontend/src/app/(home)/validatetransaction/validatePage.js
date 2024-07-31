'use client'

import { pagePaths, transactionStatus, validateTransactionUrl } from "@/utils/constants";
import axiosInstance from "@/utils/axiosInstance"
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ValidatePage() {
    const searchParams = useSearchParams();
    const [countdown, setCountdown] = useState(5);
    const [tryCountLeft, setTryCountLeft] = useState(3);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(searchParams.get("status"));
    const router = useRouter()

    const transactionId = searchParams.get("transactionId");
    const type = searchParams.get("type");
    const appointmentId = searchParams.get("id");
    const [unvalidatedTransaction, setUnvalidatedTransaction] = useState(true)
    const warningText = "Are you sure you want to leave this page? You have an unvalidated transaction that will be lost."

    useEffect(() => {
        const handleBeforeunload = (event) => {
            if (!unvalidatedTransaction) return;
            event.preventDefault();
            return (event.returnValue = warningText);
        }

        window.addEventListener('beforeunload', handleBeforeunload, { capture: true });

        return () => {
            window.removeEventListener('beforeunload', handleBeforeunload, { capture: true });
        }

    }, [unvalidatedTransaction]);

    useEffect(() => {
        let timer = null;
        if (countdown === null || countdown === undefined) return;
        if (countdown === 0) {
            if (status === transactionStatus.pending && tryCountLeft > 0) {
                setTryCountLeft((prev) => prev - 1)
                axiosInstance.get(validateTransactionUrl(appointmentId, transactionId)).then((response) => {
                    console.log("Response from validate transaction", response)
                    setCountdown(5)
                    if (response.status === 200) {
                        setStatus(transactionStatus.success)
                        setUnvalidatedTransaction(false);
                    }
                }).catch((error) => {
                    console.log("Error from validate transaction", error)
                    if (error.response?.status === 400) {
                        setCountdown(5)
                        setStatus(transactionStatus.failed)
                        setUnvalidatedTransaction(false);
                    }
                })
            }
            else if (status === transactionStatus.success || status === transactionStatus.failed) {
                router.push(pagePaths.dashboard)
            }
        }
        else if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1)
            }, 1000)
        }
        return () => clearTimeout(timer)
    }, [countdown, appointmentId, transactionId, router])

    const retryValidation = () => {
        if (status !== transactionStatus.pending) return
        setLoading(true)
        axiosInstance.get(validateTransactionUrl(appointmentId, transactionId)).then((response) => {
            if (response.status === 200) {
                setStatus(transactionStatus.success)
                setCountdown(5)
                setUnvalidatedTransaction(false);
            }
            setLoading(false)
        }).catch((error) => {
            if (error.response?.status === 400) {
                setStatus(transactionStatus.failed)
                setCountdown(5)
                setUnvalidatedTransaction(false);
            }
            setLoading(false)
        })
    }

    return (
        <div className="h-screen w-full flex flex-col justify-center items-center">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-2xl font-bold flex flex-col items-center gap-2">Transaction Validation {status}</h1>
                {status === transactionStatus.pending ?
                    <>
                        {tryCountLeft > 0 ? (
                            <p className="text-lg flex flex-col items-center gap-2">
                                Checking {countdown === 0 ? "now" : `again in ${countdown} seconds`} Try left: {tryCountLeft}
                                <Loader2 size={44} className="animate-spin" />
                            </p>
                        ) : (
                            <button disabled={loading} onClick={() => retryValidation()} className="bg-blue-500 text-white px-4 py-1 rounded-md">
                                {loading ?
                                    <Loader2 size={24} className="animate-spin" />
                                    :
                                    <span>
                                        Retry validation
                                    </span>
                                }
                            </button>
                        )}
                    </>
                    :
                    <p className="text-lg">
                        {countdown === 0 ? "Redirecting now" : `Redirecting in ${countdown} seconds...`}
                    </p>
                }
            </div>
        </div >
    )
}
