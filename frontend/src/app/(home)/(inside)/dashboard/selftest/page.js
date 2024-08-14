'use client'

import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";

// import selfTestAnimationMuted from "../../../../../../public/selftest/selttestanimationmuted.mp4"

export default function SelfTestPage() {
    const responses = useRef({
        question1: '',
        question2: '',
        question3: '',
        question4: '',
    });

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
        if(question1 === "yes" || question2 === "yes" || question3 === "yes" || question4 === "yes") {
            setResultState("loading");
            timer = setTimeout(() => {
                setResultState("warn");
            }, 3000);
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
        <div className="flex flex-col p-4 w-full gap-4">
            <h1 className="text-2xl font-bold">Self Test Page</h1>
            <div className="flex flex-col gap-3 w-10/12">
                <video controls autoPlay loop muted>
                    <source src={"/selftest/selttestanimationmuted.mp4"} />
                </video>
            </div>
            <div className="flex flex-col gap-3 w-full p-3 bg-purple-50 rounded-md">
                <h1 className="text-xl font-bold">Self Test Instructions</h1>
                <span className="text-lg">1. Check for change size and shape of breast and nipples. This includes if nipples have sunken or inverted and wether any fluid is coming from nipples </span>
                <span className="text-lg">2. Check your skin for any redness, rashes, dimpling or puckering</span>
                <span className="text-lg">3. Now raise your arms and look for the same changes.</span>
                <span className="text-lg">4. Feel for any lumps or painful areas</span>
                <span className="text-xl font-semibold">See Video above for demo</span>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-blue-50 p-4 rounded-md">
                <div className="">
                    <label className="text-lg flex items-center gap-2">1. Have you noticed any changes in size or shape of your breast or nipples?
                        <select id="question-1" defaultValue={""} className="px-2 py-1 border rounded border-purple-900">
                            <option disabled value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </label>
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
            </form>
            <div className={cn("flex flex-col items-center gap-3 w-full p-3 rounded-md", (resultState === null) && "hidden", (resultState === "loading") && "bg-purple-100", (resultState === "warn") && "bg-red-100", (resultState === "nowarn") && "bg-green-100")}>
                <h2 className="text-lg font-bold">
                    Suggestions
                </h2>
                {resultState === "loading" && <LoaderCircle size={50} className="animate-spin text-blue-600" />}
                {resultState === "warn" && <span className="text-gray-800 text-lg font-semibold">Please see a doctor for further examination.</span>}
                {resultState === "nowarn" && <span className="text-gray-800 text-lg font-semibold">Your answers do not indicate a need for immediate concern. Continue regular self-checks and consult a doctor if you notice any changes.</span>}
            </div>
        </div>
    )
}