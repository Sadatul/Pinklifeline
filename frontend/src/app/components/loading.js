import Lottie from "lottie-react"
import animationData from '../../../public/loading-animation.json'

export default function Loading() {
    return (
        <div className="flex flex-col w-screen h-screen justify-center items-center">
            <Lottie
                animationData={animationData}
                className="flex justify-center items-center"
                loop={true}
            />
        </div>
    )
}