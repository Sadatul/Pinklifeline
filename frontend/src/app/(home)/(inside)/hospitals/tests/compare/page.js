'use client'
import AsyncSelect from 'react-select/async'
import { useCallback, useEffect, useState } from 'react'
import makeAnimated from 'react-select/animated'
import { cn } from '@/lib/utils'
import { compareHospitalsAnonymous, generatePairs, getHospitalsAnonymousUrl, getMedicalTestAnonymousUrl, medicalTestHospitalAnonymousUrl, pagePaths, radicalGradient } from '@/utils/constants'
import { debounce } from 'lodash'
import axiosInstance from '@/utils/axiosInstance'
import { ArrowLeft, Loader } from 'lucide-react'
import Link from 'next/link'

const animatedComponents = makeAnimated()

export default function CompareTestFees() {
    const [isMounted, setIsMounted] = useState(false)
    const [selectedTest, setSelectedTest] = useState(null)
    const [selectedHospitals, setSelectedHospitals] = useState([])
    const [loading, setLoading] = useState(false)
    const [hospitalNameMap, setHospitalNameMap] = useState(null)
    const [compareData, setCompareData] = useState([])
    const [testName, setTestName] = useState(null)

    const loadHospitalOptions = (inputValue) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                axiosInstance.get(getHospitalsAnonymousUrl, { params: { name: inputValue.trim() } }).then((response) => {
                    const options = response.data?.content?.map((hospital) => ({ value: hospital.id, label: hospital.name }));
                    resolve(options);
                }).catch((error) => {
                    console.log(error);
                    resolve([]);
                });
            }, 500);
        })
    }

    const loadTestOptions = (inputValue) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                axiosInstance.get(getMedicalTestAnonymousUrl, { params: { name: inputValue.trim() } }).then((response) => {
                    const options = response.data?.map((test) => ({ value: test.id, label: test.name }));
                    resolve(options);
                }).catch((error) => {
                    console.log(error);
                    resolve([]);
                });
                // resolve(filterTests(inputValue));
            }, 500);
        })
    }

    useEffect(() => {
        setIsMounted(true)
    }, [])
    const getTestOptions = useCallback(
        debounce(async (searchText, callback) => {
            try {
                const response = await axiosInstance.get(getMedicalTestAnonymousUrl, { params: { name: searchText.trim() } });
                const options = response.data?.map((test) => ({ value: test.id, label: test.name }));
                callback(options);
            } catch (error) {
                console.log(error);
                callback([]);
            }
        }, 500), []);

    const getHospitalOptions = useCallback(
        debounce(async (searchText, callback) => {
            try {
                const response = await axiosInstance.get(getHospitalsAnonymousUrl, { params: { name: searchText.trim() } });
                const options = response.data?.content?.map((hospital) => ({ value: hospital.id, label: hospital.name }));
                callback(options);
            } catch (error) {
                console.log(error);
                callback([]);
            }
        }, 500), []);

    if (!isMounted) return null

    return (
        <div className={cn(radicalGradient, "from-slate-200 to-slate-100 flex flex-col w-full flex-1 gap-4 p-5 items-center")}>
            <div className="flex flex-col w-11/12 gap-4 bg-white p-6 rounded-md">
                <div className='flex flex-row gap-2 items-center w-full'>
                    <Link href={pagePaths.allHospitalsPage} className="w-fit" >
                        <ArrowLeft className="cursor-pointer" size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Compare Test Fees</h1>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-base flex items-center gap-2 w-fit">
                        <span className='text-base w-32'>Select Test</span>
                        <AsyncSelect
                            cacheOptions
                            isMulti={false}
                            loadOptions={loadTestOptions}
                            components={animatedComponents}
                            placeholder="Search for a test"
                            className="w-64"
                            value={selectedTest}
                            onChange={(selectedOption) => setSelectedTest(selectedOption)}
                        />
                    </label>
                </div>
                <div className='flex flex-row gap-4 items-center w-full'>
                    <label className='flex flex-row items-center gap-2 text-base w-full'>
                        <span className='text-base w-32'>Select Hospital</span>
                        <AsyncSelect
                            cacheOptions
                            isMulti={true}
                            loadOptions={loadHospitalOptions}
                            components={animatedComponents}
                            placeholder="Search for a hospital"
                            className="w-1/2"
                            value={selectedHospitals}
                            onChange={(selectedOption) => setSelectedHospitals(selectedOption)}
                        />
                    </label>
                </div>
                <button className='bg-slate-900 text-white rounded-md p-2 w-28' onClick={async () => {
                    try {
                        setLoading(true)
                        const tempCompareData = []
                        const hospitalNameMap = new Map()
                        for (const hospital of selectedHospitals) {
                            const data = (await axiosInstance.get(medicalTestHospitalAnonymousUrl, {
                                params: {
                                    testIds: selectedTest.value,
                                    hospitalId: hospital.value
                                }
                            })).data.content
                            tempCompareData.push({
                                hospitalId: hospital.value,
                                testFee: data[0] ? data[0].fee : 'N/A',
                                hospitalName: hospital.label
                            })
                        }
                        setCompareData([...tempCompareData])
                        setLoading(false)
                        setTestName(selectedTest.label)
                    } catch (error) {
                        console.log(error)
                        setLoading(false)
                    }
                }}>
                    Compare
                </button>
                <div className='flex flex-col gap-2 w-full'>
                    {loading && <Loader size={44} className='animate-spin' />}
                    {!loading && compareData.length === 0 && <p className='text-base text-slate-900'>Select a test and hospitals to compare</p>}
                    {!loading && compareData.length > 0 &&
                        <table className=" border-separate border-spacing-0 border border-slate-300 rounded-lg">
                            <thead>
                                <tr>
                                    <th className="text-base text-slate-900 border border-slate-300 px-4 py-2">Hospital</th>
                                    <th className="text-base text-slate-900 border border-slate-300 px-4 py-2">
                                        {testName} Fee
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {compareData.map((data, index) => (
                                    <tr key={index} className="border border-slate-300">
                                        <td className="text-base text-slate-900 border border-slate-300 px-4 py-2">
                                            {data.hospitalName}
                                        </td>
                                        <td className="text-base text-slate-900 border border-slate-300 px-4 py-2">
                                            {data.testFee}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    }
                </div>
            </div>
        </div>
    )
}