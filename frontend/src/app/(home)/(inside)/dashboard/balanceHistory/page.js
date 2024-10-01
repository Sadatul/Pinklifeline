'use client'

import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/utils/axiosInstance";
import { getDoctorBalance, getDoctorBalanceHistory } from "@/utils/constants";
import { Pagination } from "@mui/material";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

export default function BalanceHistoryPage() {
    const [balanceHistory, setBalanceHistory] = useState([]);
    const [pageInfo, setPageInfo] = useState()
    const [currentPage, setCurrentPage] = useState(1);
    const [balance, setBalance] = useState(null);

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

    useEffect(() => {
        console.log("Fetching balance")
        axiosInstance.get(getDoctorBalance).then((res) => {
            console.log("Balance", res?.data?.balance)
            setBalance(res?.data?.balance)
        }).catch((error) => {
            console.log("Error fetching balance", error)
        })
    }, [])


    return (
        <div className="flex flex-col gap-5 items-center p-5">
            <h1 className="text-xl font-semibold text-black">Balance History Page</h1>
            <div className="flex flex-col gap-3 bg-transparent w-8/12 items-start">
                {(balance !== null) &&
                    <div className="flex items-center gap-2">
                        Balance : {balance}
                    </div>
                }
                <div className="flex flex-col  gap-5 w-full items-center">
                    {balanceHistory?.length === 0 ?
                        <h2 className="text-lg text-black">
                            No balance history available
                        </h2>
                        :
                        <>
                            <div className="flex flex-col gap-2 w-full bg-white">
                                {balanceHistory?.map((history) => (
                                    <div key={history.id} className="bg-slate-100 rounded-xl p-2 shadow-md">
                                        <div className="flex flex-col">
                                            <div className="flex items-center justify-between p-2">
                                                <span className="text-base text-black flex flex-row items-center">
                                                    <FaBangladeshiTakaSign />
                                                     {history.value}
                                                </span>
                                                <div className="text-sm text-black flex items-center gap-3">
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
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    {history.description}
                                                </span>
                                            </div>
                                        </div>
                                        {/* <Separator className="h-[1.5px] bg-gray-600" /> */}
                                    </div>
                                ))}
                            </div>
                            <Pagination
                                count={pageInfo?.totalPages}
                                onChange={(event, page) => setCurrentPage(page)}
                                page={currentPage}
                                color="primary"
                                shape="rounded"
                                showLastButton
                                showFirstButton
                                className="mb-5"
                            />
                        </>
                    }
                </div>
            </div>
        </div>
    )
}