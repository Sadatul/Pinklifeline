'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { LoaderCircle, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { generatePDF } from "@/utils/generatePdf"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"



export function DoctorLivePrescriptionPage() {
    const [medications, setMedications] = useState([]);
    const [tests, setTests] = useState([]);
    const [analysis, setAnalysis] = useState([]);

    return (
        <div className="flex flex-col items-center w-full gap-10">
            <h1 className="text-2xl font-semibold mt-5 mb-5">Live Prescription</h1>
            <div className="flex items-center justify-between w-2/3">
                <div className="flex items-center">
                    <label className="text-md font-semibold m-2 text-center">Analysis:
                        <input className="border border-blue-500 rounded-md px-2 m-2" id="analysis" />
                    </label>
                    <Button
                        onClick={() => {
                            if (!document.getElementById('analysis').value) return toast.error("Irregularity field is empty")
                            setAnalysis([...analysis, document.getElementById('analysis').value])
                            document.getElementById('analysis').value = ''
                            toast.message("Analysis added", {
                                description: "See added analysis to see all the analysis added so far"
                            })
                        }}
                        variant={"outline"}
                        className={cn(
                            " h-7 mx-4 justify-start text-left font-normal",
                        )}
                    ><Plus className="text-gray-700" size={28} />
                    </Button>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[160px] ml-3 justify-start text-left font-normal",
                            )}
                        >Added Analyses</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <ScrollArea className="rounded-md border h-52 min-w-64">
                            {analysis.map((irregularity, index) => (
                                <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                    <span>{irregularity}</span>
                                    <Button
                                        onClick={() => {
                                            setAnalysis(analysis.filter((_, i) => i !== index))
                                            toast.message("Irregularity removed")
                                        }}
                                        variant={"outline"}
                                        className={cn(
                                            " h-7 mx-4 justify-start text-left font-normal",
                                        )}>
                                        <Minus className="text-red-500" size={28} />
                                    </Button>
                                </div>
                            ))}
                        </ScrollArea >
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center justify-between w-2/3">
                <div className="flex items-center">
                    <label className="text-md font-semibold m-2 text-center">Tests:
                        <input className="border border-blue-500 rounded-md px-2 m-2" id="analysis" />
                    </label>
                    <Button
                        onClick={() => {
                            if (!document.getElementById('tests').value) return toast.error("Irregularity field is empty")
                            setTests([...tests, document.getElementById('tests').value])
                            document.getElementById('tests').value = ''
                            toast.message("Irregularity added", {
                                description: "See added irregularities to see all the relatives added so far"
                            })
                        }}
                        variant={"outline"}
                        className={cn(
                            " h-7 mx-4 justify-start text-left font-normal",
                        )}>
                        <Plus className="text-gray-700" size={28} />
                    </Button>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[160px] ml-3 justify-start text-left font-normal",
                            )}
                        >Added Tests</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <ScrollArea className="rounded-md border h-52 min-w-64">
                            {tests.map((irregularity, index) => (
                                <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                    <span>{irregularity}</span>
                                    <Button
                                        onClick={() => {
                                            setTests([...tests, document.getElementById('tests').value])
                                                (tests.filter((_, i) => i !== index))
                                            toast.message("Irregularity removed")
                                        }}
                                        variant={"outline"}
                                        className={cn(
                                            " h-7 mx-4 justify-start text-left font-normal",
                                        )}>
                                        <Minus className="text-red-500" size={28} />
                                    </Button>
                                </div>
                            ))}
                        </ScrollArea >
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center justify-between w-2/3">
                <div className="flex items-center">
                    <label className="text-md font-semibold m-1 text-center" >Medicine Name
                        <input className="border border-blue-500 rounded-md px-2" id="medicineName" />
                    </label>
                    <label className="text-md font-semibold m-1 text-center" >Dose description
                        <input className="border border-blue-500 rounded-md px-2" id="doseDescription" />
                    </label>

                    <Button
                        onClick={() => {
                            if (!document.getElementById('medicineName').value || !document.getElementById('doseDescription').value) return toast.error("Both Medication fields are required")
                            setMedications([...medications,
                            {
                                name: document.getElementById('medicineName').value,
                                doseDescription: document.getElementById('doseDescription').value
                            }
                            ])
                            document.getElementById('medicineName').value = ''
                            document.getElementById('doseDescription').value = ''
                            toast.message("Medicine added", {
                                description: "See added Medicines to see all the Medicines added so far"
                            })
                        }}
                        variant={"outline"}
                        className={cn(
                            " h-7 mx-4 justify-start text-left font-normal",
                        )}>
                        <Plus className="text-gray-700" size={28} />
                    </Button>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[160px] justify-start text-left font-normal",
                            )}
                        >Added Medications</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <ScrollArea className="rounded-md border h-52 min-w-96">
                            {medications.map((medication, index) => (
                                <div key={index} className="flex justify-between flex-wrap p-1 border-b border-gray-300 w-full">
                                    <span>{medication.name}</span>
                                    <Separator className="bg-pink-500  w-[2px] h-5 " orientation="vertical" />
                                    <ScrollableContainer style={{ display: 'flex', flexWrap: 'wrap', width: '10rem' }}>{medication.doseDescription}
                                    </ScrollableContainer>

                                    <Button
                                        onClick={() => {
                                            setMedications(medications.filter((_, i) => i !== index))
                                            toast.message("Medication removed")
                                        }}
                                        variant={"outline"}
                                        className={cn(
                                            " h-7 mx-4 justify-start text-left font-normal",
                                        )}>
                                        <Minus className="text-red-500" size={28} />
                                    </Button>
                                </div>
                            ))}
                        </ScrollArea >
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

export function PatientLivePrescriptionPage() {
    const dummyData = {
        "receiverId": 2,
        "doctorname": "Dr. Jhonny Sins",
        "callId": "2417210933683308291",
        "analysis": "You are paralyzed",
        "medications": [
            { "name": "Sapa", "doseDescription": "Bala" },
            { "name": "napa", "doseDescription": "Bhfjdfhjh" }
        ],
        "tests": ["Name", "Name", "Nani"]

    }
    const name = "John Doe";
    const age = 24;
    const height = 5.6;
    const weight = 70;
    const [loading, setLoading] = useState(false);

    const handleGeneratePDF = () => {
        generatePDF('prescriptionSection');
    };

    return (
        <div className="flex flex-col items-center gap-5 relative">
            <button disabled={loading} className="bg-purple-400 hover:scale-90 transition ease-in-out duration-200 text-black px-4 py-1 rounded-md top-24 right-10 z-10 fixed" onClick={() => {
                setLoading(true);
                handleGeneratePDF();
                setLoading(false);
            }}>{loading ? <LoaderCircle size={28} className="text-white animate-spin" /> : "Generate PDF"}
            </button>
            <h1 className="text-2xl font-semibold">Live Prescription</h1>
            <div id="prescriptionSection" className="flex flex-col flex-1 items-center gap-5 w-full">
                <h1 className="text-2xl font-semibold">
                    {dummyData.doctorname}
                </h1>
                <h1 className="text-xl font-semibold">Patient Details</h1>
                <Separator className="h-[1.5px] w-1/2" />
                <div className="flex flex-row justify-center gap-24  w-4/5">
                    <div className="flex flex-col ">
                        <h1 className="text-lg font-semibold">Name: {name}</h1>
                        <h1 className="text-lg font-semibold">Age: {age}</h1>
                    </div>
                    <div className="flex flex-col ">
                        <h1 className="text-lg font-semibold">Height: {height}</h1>
                        <h1 className="text-lg font-semibold">Weight: {weight}</h1>
                    </div>
                </div>
                <Separator className="h-[1.5px] w-1/2" />
                <div className="w-4/5">
                    <table className="w-full table-auto">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-center text-lg text-black font-semibold">Analysis</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="px-6 py-4 text-base text-center text-black break-words whitespace-normal font-semibold">
                                    {dummyData.analysis}
                                </td>
                            </tr>
                            {/* Future rows can be added here */}
                        </tbody>
                    </table>
                </div>
                <Separator className="h-[1.5px] w-1/2" />
                <div className="flex flex-col w-full items-center">
                    <h1 className="text-xl font-semibold mb-5">Medications</h1>
                    <div className="w-4/5">
                        <table className="min-w-full border-collapse border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs text-black font-semibold uppercase tracking-wider border border-gray-300">Name</th>
                                    <th className="px-3 py-2 text-left text-xs text-black font-semibold uppercase tracking-wider border border-gray-300">Description</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dummyData.medications.map((medication, index) => (
                                    <tr key={index}>
                                        <td className="px-3 pt-3 pb-7 items-center whitespace-normal break-words text-sm text-black border border-gray-300">{medication.name}</td>
                                        <td className="px-3 pt-3 pb-7 items-center whitespace-normal break-words text-sm text-black border border-gray-300">{medication.doseDescription}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Separator className="h-[1.5px] w-1/2" />
                <div className="w-4/5">
                    <table className="w-full table-auto">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-center text-lg font-semibold">Tests</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyData.tests.map((test, index) => (
                                <tr key={index}>
                                    <td className="px-3 py-2 text-base text-center text-black break-words whitespace-normal">
                                        {test}
                                    </td>
                                </tr>
                            ))}
                            {/* Future rows can be added here */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}