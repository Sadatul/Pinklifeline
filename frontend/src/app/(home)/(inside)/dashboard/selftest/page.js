'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";

// import selfTestAnimationMuted from "../../../../../../public/selftest/selttestanimationmuted.mp4"

export default function SelfTestPage() {
    const [responses, setResponses] = useState(['', '', '', '']);
    const [questionCompletedCount, setQuestionCompletedCount] = useState(0);
    const questionsArray = ["1. Have you noticed any changes in size or shape of your breast or nipples?", "2. Have you noticed any skin redness, rashes, dimpling, or puckering?", "3. After raising your arms, have you noticed any changes?", "4. Have you felt any lumps or painful areas?"];

    const [resultState, setResultState] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        responses.current = {
            ...responses.current,
            [name]: value,
        };
    };

    const handleSubmit = () => {
        let timer;
        if (responses.includes("yes")) {
            setResultState("loading");
            timer = setTimeout(() => {
                setResultState("warn");
            }, 2000);
        }
        else {
            setResultState("loading");
            timer = setTimeout(() => {
                setResultState("nowarn");
            }, 1000);
        }
        return () => {
            clearTimeout(timer);
        }
    };
    return (
        <div className="flex flex-col p-4 w-full gap-2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]  from-gray-400 via-gray-400 to-gray-300">
            <h1 className="text-2xl font-bold">Self Test Page</h1>
            <div className="flex flex-col w-full">
                <div className="flex flex-row gap-1 px-5 justify-between w-10/12 h-14 bg-gradient-to-t from-zinc-200 via-zinc-300 to-zinc-400 items-center rounded-t-2xl">
                    <div className="flex flex-row gap-6 h-14 mt-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={cn("w-12 h-12", questionCompletedCount > i ? "bg-pink-500" : "bg-gray-700")} style={{
                                clipPath: "polygon(69% 20%, 100% 50%, 65% 74%, 0 74%, 25% 50%, 0 20%)"
                            }}></div>
                        ))}
                    </div>
                    <span className="text-2xl font-semibold text-black">
                        {questionCompletedCount}/4
                    </span>
                </div>
                <div className="flex flex-col gap-1 p-2 w-10/12 items-center flex-wrap bg-purple-50 rounded-b-md">
                    <video className="w-9/12" controls autoPlay loop muted>
                        <source src="/path/to/your/video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="flex flex-col flex-1 w-full p-2">
                        <div className="flex flex-col w-full bg-gray-200 p-3 rounded-md gap-5">
                            <div className="text-lg gap-2 flex flex-col">
                                <span className="">
                                    {questionsArray[questionCompletedCount]}
                                </span>
                                <select id="questionSelect" value={responses[questionCompletedCount]} className="px-2 py-1 border rounded border-purple-900" onChange={(e) => {
                                    setResponses(prev => {
                                        const newResponses = [...prev];
                                        newResponses[questionCompletedCount] = e.target.value;
                                        return newResponses;
                                    })
                                }} >
                                    <option disabled value="">Select an option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <div className="flex flex-row justify-between">
                                <Button variant="outline" onClick={() => {
                                    if (questionCompletedCount > 0) {
                                        setQuestionCompletedCount(prev => prev - 1);
                                    }
                                }} >
                                    Previous
                                </Button>
                                <span id="errormsg" className="text-lg font-semibold text-red-500"></span>
                                <Button onClick={() => {
                                    if (document.getElementById("questionSelect").value === "") {
                                        document.getElementById("errormsg").innerText = "Please answer the question";
                                        return;
                                    }
                                    else if (questionCompletedCount < 3) {
                                        document.getElementById("errormsg").innerText = "";
                                        setResponses(prev => {
                                            const newResponses = [...prev];
                                            newResponses[questionCompletedCount] = document.getElementById("questionSelect").value;
                                            return newResponses;
                                        });
                                        setQuestionCompletedCount(prev => prev + 1);
                                    }
                                    else if (questionCompletedCount === 3) {
                                        document.getElementById("errormsg").innerText = "";
                                        setResponses(prev => {
                                            const newResponses = [...prev];
                                            newResponses[questionCompletedCount] = document.getElementById("questionSelect").value;
                                            return newResponses;
                                        });
                                        handleSubmit();
                                    }
                                }}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={resultState !== null} onOpenChange={(e) => {
                if (e === false) {
                    setResultState(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Suggestion
                        </DialogTitle>
                        <DialogDescription>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 items-center justify-center">
                        {resultState === "loading" && <LoaderCircle size={50} className="text-blue-500 animate-spin" />}
                        {resultState === "warn" && <span className="text-xl text-red-600 font-bold">Please consult a doctor.</span>}
                        {resultState === "nowarn" && <span className="text-xl text-green-600 font-bold">You are safe.</span>}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}