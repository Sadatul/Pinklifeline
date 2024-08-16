'use client'

import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/utils/axiosInstance";
import { getDoctorBalanceHistory } from "@/utils/constants";
import { Pagination } from "@mui/material";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function BalanceHistoryPage() {
    const [balanceHistory, setBalanceHistory] = useState([
        {
            "description": "Payment of 450 received for appointment",
            "id": 3,
            "value": 450,
            "timestamp": "2024-08-11T12:11:02"
        },
        {
            "description": "Payment of 450 received for appointment",
            "id": 1,
            "value": 450,
            "timestamp": "2024-08-11T10:19:23"
        }
    ]);
    const [pageInfo, setPageInfo] = useState()
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        // Fetch balance history from server
        axiosInstance.get(getDoctorBalanceHistory, {
            params: {
                pageNo: currentPage - 1,
            }
        }).then((response) => {
            console.log(response.data);
            setBalanceHistory(response?.data?.content);
            setPageInfo(response?.data?.page);
        }).catch((error) => {
            console.log(error);
        })
    }, [currentPage]);


    return (
        <div className="flex flex-col gap-5 items-center p-5">
            <h1 className="text-xl font-semibold text-black">Balance History Page</h1>
            <div className="flex flex-col bg-gray-200 border border-gray-500 gap-5 w-8/12 items-center">
                {balanceHistory.length === 0 ?
                    <h2 className="text-lg text-black">
                        No balance history available
                    </h2>
                    :
                    <>
                        <div className="w-full">
                            {balanceHistory.map((history) => (
                                <div key={history.id}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between p-2">
                                            <span className="text-base text-black">
                                                Amount: {history.value}
                                            </span>
                                            <div className="text-base text-black flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={16} />
                                                    {history.timestamp.split("T")[0]}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={16} />
                                                    {history.timestamp.split("T")[1]}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-2">
                                            <span className="text-base text-black">
                                                {history.description}
                                            </span>
                                        </div>
                                    </div>
                                    <Separator className="h-[1.5px] bg-gray-600" />
                                </div>
                            ))}
                        </div>
                        <Pagination
                            count={pageInfo?.totalPages}
                            onChange={(event, page) => setCurrentPage(page)}
                            page={currentPage}
                            color="primary"
                            shape="rounded"
                        />
                    </>
                }
            </div>
        </div>
    )
}