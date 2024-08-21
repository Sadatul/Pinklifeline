// 'use client'

// import * as toxicity from '@tensorflow-models/toxicity';
// import '@tensorflow/tfjs-core';
// import '@tensorflow/tfjs-backend-cpu';
// import '@tensorflow/tfjs-backend-webgl';
// import { useRef } from 'react';

export default function ToxicityTestPage() {
//     const threshold = 0.9;
//     const modelRef = useRef(null);
    

//     return(
//         <div className='w-full' >
//             <h1>Testing Toxicity</h1>
//             <input id="toxic-input" className='w-72 border border-black' />
//             <button className='border border-black' onClick={
//                 async () => {
//                     if(!document.getElementById('toxic-input').value) {
//                         return;
//                     }
//                     if(!modelRef.current) {
//                         console.log('loading model');
//                         modelRef.current = await toxicity.load(threshold);
//                     }
//                     console.log('classifying');
//                     modelRef.current.classify(document.getElementById('toxic-input').value).then(predictions => {
//                         console.log(predictions);
//                     }).catch(err => {
//                         console.log(err);
//                     });
//                 }
//             } >
//                 Test Toxicity
//             </button>
//         </div>
//     )
}