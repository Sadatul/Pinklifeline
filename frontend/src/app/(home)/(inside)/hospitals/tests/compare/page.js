'use client'
import AsyncSelect from 'react-select/async'
import { useState } from 'react'
import makeAnimated from 'react-select/animated'
import { cn } from '@/lib/utils'
import { getHospitalsAnonymousUrl, getMedicalTestAnonymousUrl, radicalGradient } from '@/utils/constants'

const animatedComponents = makeAnimated()

export default function CompareTestFees() {

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
                const options = response.data?.map((hospital) => ({ value: hospital.id, label: hospital.name }));
                callback(options);
            } catch (error) {
                console.log(error);
                callback([]);
            }
        }, 500), []);

    return (
        <div className={cn(radicalGradient, "from-slate-200 to-slate-100 flex flex-col w-full flex-1 gap-4 p-5")}>
            <div className="flex flex-col w-11/12 gap-4 bg-white">
                <h1 className="text-2xl font-bold text-slate-900">Compare Test Fees</h1>
                <div className="flex flex-col gap-2">
                    <label className="text-lg font-semibold text-slate-900 flex items-center gap-2 w-72">Select Test
                        <AsyncSelect
                            cacheOptions
                            isMulti={false}
                            loadOptions={getTestOptions}
                            components={animatedComponents}
                            placeholder="Search for a test"
                            className="w-full"
                        />
                    </label>
                </div>
                <div className='flex flex-row gap-4 items-center w-full'>
                    <label className='flex flex-row items-center gap-2 text-base w-full'>
                        <AsyncSelect
                            cacheOptions
                            isMulti={true}
                            loadOptions={getHospitalOptions}
                            components={animatedComponents}
                            placeholder="Search for a hospital"
                            className="w-1/2"
                        />
                    </label>
                </div>
            </div>
        </div>
    )
}