import Lottie from "lottie-react"
import animationData from '../../../public/loading-animation.json'
import handAnimation from '../../../public/loadingHand.json'
import dotsAnimation from '../../../public/loading-dots.json'

export default function Loading({ chose = "default" }) {
    let animation;
    if (chose === "hand") {
        animation = handAnimation
    }
    else if (chose === "dots") {
        animation = dotsAnimation
    }
    else {
        animation = animationData
    }
    return (
        <div className="flex flex-col w-full h-full justify-center items-center">
            <Lottie
                animationData={animation}
                className="flex justify-center items-center"
                loop={true}
            />
        </div>
    )
}