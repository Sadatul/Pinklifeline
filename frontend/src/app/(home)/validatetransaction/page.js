'use client'

import Loading from "@/app/components/loading";
import { Suspense } from "react";
import ValidatePage from "./validatePage";

export default function ValidateTransaction() {

    return (
        <Suspense fallback={<Loading chose="hand" />}>
            <ValidatePage />
        </Suspense>
    );
}
