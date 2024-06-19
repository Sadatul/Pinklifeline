'use client'
import { useEffect, useRef } from "react"
import { useInView, motion, useAnimation } from "framer-motion"



export default function SlideAnimate({ children, direction = "topToBottom", color = "pink", hidden = false }) {
    const directions = {
        leftToRight: { hidden: { opacity: 0, x: -75 }, visible: { opacity: 1, x: 0 } },
        rightToLeft: { hidden: { opacity: 0, x: 75 }, visible: { opacity: 1, x: 0 } },
        topToBottom: { hidden: { opacity: 0, y: -75 }, visible: { opacity: 1, y: 0 } },
        bottomToTop: { hidden: { opacity: 0, y: 75 }, visible: { opacity: 1, y: 0 } },
    }
    const blockDirections = {
        leftToRight:{ hidden: {left: 0}, visible: {left: '100%'}},
        rightToLeft:{ hidden: {right: 0}, visible: {left: '-100%'}},
        topToBottom:{ hidden: {opacity: 1, y : 0}, visible: {opacity: 0, y: '100%'}},
        bottomToTop:{ hidden: {opacity: 1, y : 0}, visible: {opacity: 0, y: '-100%'}},
    }
    const reverseDirections = {leftToRight: "rightToLeft", rightToLeft: "leftToRight", topToBottom: "bottomToTop", bottomToTop: "topToBottom"};
    if (!directions[direction]) direction = "topToBottom";
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const mainControls = useAnimation();
    const slideControls = useAnimation();
    useEffect(() => {
        if (isInView) {
            mainControls.start('visible');
            slideControls.start('visible');
        }
    }, [isInView, mainControls, slideControls]);
    return (
        <div ref={ref} className="relative w-full overflow-hidden">
            <motion.div
                variants={directions[direction]}
                initial="hidden"
                animate={mainControls}
                transition={{ duration: 0.75, delay: 0.25 }}
            >
                {children}
            </motion.div>
            <motion.div
                variants={blockDirections[reverseDirections[direction]]}
                initial="hidden"
                animate={slideControls}
                transition={{ duration: 0.5, ease: 'easeIn' }}
                style={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 0,
                    right: 0,
                    zIndex: 40,
                    width: '100%',
                    height: '100%',
                    background: color,
                }}
                hidden={hidden}
            />
        </div>
    )
}