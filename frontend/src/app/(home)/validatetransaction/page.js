import { Suspense } from "react";
import ValidatePage from "./validatePage";
import Loading from "@/app/components/loading";

export default function ValidateTransaction() {
    return (
        <Suspense fallback={<Loading />}>
            <ValidatePage />
        </Suspense>
    )
}