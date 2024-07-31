'use client'

import { useEffect, useState } from "react";

export default function TestPage() {
    const [state, setState] = useState(true);

    useEffect(() => {
        const handleBeforeunload = (event) => {
            if (!state) return;
            event.preventDefault();
            return (event.returnValue = '');
        }

        window.addEventListener('beforeunload', handleBeforeunload, { capture: true });

        return () => {
            window.removeEventListener('beforeunload', handleBeforeunload, { capture: true });
        }

    }, [state]);

    return (
        <div className="h-screen w-full flex flex-col justify-center items-center">
            <button onClick={() => { setState((prev) => !prev) }} className="p-2 border border-black">Test: {state?"true":"false"}</button>
        </div>
    )
}