import Lottie from "lottie-react"
import animationData from '../../../public/loading-animation.json'
import handAnimation from '../../../public/loadingHand.json'

export default function Loading({ chose = "default" }) {
    return (
        <div className="flex flex-col w-full h-full justify-center items-center">
            <Lottie
                animationData={chose === "hand" ? handAnimation : animationData}
                className="flex justify-center items-center"
                loop={true}
            />
        </div>
    )
}