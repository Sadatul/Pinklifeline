'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";

// import selfTestAnimationMuted from "../../../../../../public/selftest/selttestanimationmuted.mp4"

export default function SelfTestPage() {
    const responses = useRef(['', '', '', '']);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        let timer;
        const question1 = document.getElementById("question-1").value;
        const question2 = document.getElementById("question-2").value;
        const question3 = document.getElementById("question-3").value;
        const question4 = document.getElementById("question-4").value;
        if (question1 === "" || question2 === "" || question3 === "" || question4 === "") {
            document.getElementById("errormsg").innerText = "Please answer all questions";
            return;
        }
        else {
            document.getElementById("errormsg").innerText = "";
        }
        if (responses.current.includes("yes")) {
            setResultState("loading");
            timer = setTimeout(() => {
                setResultState("warn");
            }, 2000);
        }
        else {
            setResultState("loading");
            timer = setTimeout(() => {
                setResultState("nowarn");
            }, 3000);
        }
        return () => {
            clearTimeout(timer);
        }
    };
    return (
        <div className="flex flex-col p-4 w-full gap-2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]  from-gray-400 via-gray-400 to-gray-300">
            <h1 className="text-2xl font-bold">Self Test Page</h1>
            <div className="flex flex-col w-full items-center">
                <div className="flex flex-row gap-1 px-5 justify-evenly w-full h-14 bg-gradient-to-t from-zinc-500 via-zinc-700 to-zinc-800 items-center rounded-l-2xl" style={{
                    clipPath: "polygon(80% 0, 100% 50%, 80% 100%, 0 100%, 0 50%, 0 0)"
                }}>
                    <div className="flex flex-row justify-evenly h-14 w-1/2 mt-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} class="w-14 h-14 bg-gray-200" style={{
                                clipPath: "polygon(69% 20%, 100% 50%, 65% 74%, 0 74%, 25% 50%, 0 20%);"
                            }}></div>
                        ))}
                        <span className="text-4xl font-semibold text-white mt-1">
                            {questionCompletedCount}/4
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 p-2 w-8/12 items-center flex-wrap mr-40 bg-purple-50 rounded-md">
                    <video className="w-full" controls autoPlay loop muted>
                        <source src="/path/to/your/video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="flex flex-col flex-1 ">
                        <div className="flex flex-col w-full bg-gray-200 p-3 rounded-md gap-5">
                            <div className="text-lg gap-2 flex flex-col">
                                <span className="">
                                    {questionsArray[questionCompletedCount]}
                                </span>
                                <select id="questionSelect" value={responses.current[questionCompletedCount]} className="px-2 py-1 border rounded border-purple-900" onChange={(e)=>{

                                }} >
                                    <option disabled value="">Select an option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <div className="flex flex-row justify-between">
                                <Button variant="outline" >
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
                                        responses.current[questionCompletedCount] = document.getElementById("questionSelect").value;
                                        setQuestionCompletedCount(prev => prev + 1);
                                    }
                                    else if (questionCompletedCount === 3) {
                                        document.getElementById("errormsg").innerText = "";
                                        responses.current[questionCompletedCount] = document.getElementById("questionSelect").value;
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
                    {resultState === "loading" && <LoaderCircle size={50} className="text-blue-500 animate-spin" />}
                    {resultState === "warn" && <span className="text-xl text-red-600 font-bold">Please consult a doctor.</span>}
                    {resultState === "nowarn" && <span className="text-xl text-green-600 font-bold">You are safe.</span>}
                </DialogContent>
            </Dialog>
            {/* <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-blue-50 p-4 rounded-md">
                <div className="">
                </div>
                <div className="">
                    <label className="text-lg flex items-center gap-2">2. Have you noticed any skin redness, rashes, dimpling, or puckering?
                        <select id="question-2" defaultValue={""} className="px-2 py-1 border rounded border-purple-900">
                            <option disabled value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </label>
                </div>
                <div className="">
                    <label className="text-lg flex items-center gap-2">3. After raising your arms, have you noticed any changes?
                        <select id="question-3" defaultValue={""} className="px-2 py-1 border rounded border-purple-900">
                            <option disabled value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </label>
                </div>
                <div className="">
                    <label className="text-lg flex items-center gap-2">4. Have you felt any lumps or painful areas?
                        <select id="question-4" defaultValue={""} className="px-2 py-1 border rounded border-purple-900">
                            <option disabled value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </label>
                </div>
                <span id="errormsg" className="text-lg text-red-500"></span>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded w-20">Submit</button>
            </form> */}

        </div>
    )
}