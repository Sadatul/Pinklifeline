// 'use client'
// import { Progress } from '@/components/ui/progress';
// import Image from 'next/image';
// import { useState, useRef } from 'react';
// import { createWorker } from 'tesseract.js';
// // import * as qna from '@tensorflow-models/qna';
// // import '@tensorflow/tfjs-core';
// // import '@tensorflow/tfjs-backend-cpu';
// // import '@tensorflow/tfjs-backend-webgl';
// import { GoogleGenerativeAI } from '@google/generative-ai';

export default function DashBoard() {

//   const modelRef = useRef(null);
//   const workerRef = useRef(null);
//   const [imagePath, setImagePath] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(null);
//   const [answers, setAnswer] = useState(null);
//   const genAI = new GoogleGenerativeAI("AIzaSyBvcy9QAT7bHEv9OUUrm4n45jUrYlPKilY")

//   const handleChange = (event) => {
//     setImagePath(URL.createObjectURL(event.target.files[0]));
//   }

//   function safeStringify(obj, space) {
//     const cache = new Set();
//     return JSON.stringify(obj, (key, value) => {
//       if (typeof value === 'object' && value !== null) {
//         if (cache.has(value)) {
//           // Circular reference found, discard key
//           return;
//         }
//         // Store value in the cache
//         cache.add(value);
//       }
//       return value;
//     }, space);
//   }

//   function downloadJSONFile(jsonObject, fileName) {
//     // Convert JSON object to string safely
//     const jsonString = safeStringify(jsonObject, 2);

//     // Create a Blob from the JSON string
//     const blob = new Blob([jsonString], { type: "application/json" });

//     // Create a link element
//     const link = document.createElement("a");

//     // Set the download attribute with a filename
//     link.download = fileName;

//     // Create a URL for the Blob and set it as the href attribute
//     link.href = window.URL.createObjectURL(blob);

//     // Append the link to the document body
//     document.body.appendChild(link);

//     // Programmatically click the link to trigger the download
//     link.click();

//     // Remove the link from the document
//     document.body.removeChild(link);
//   }

//   const getAnswerBERT = async () => {
//     const question = document.getElementById('question').value;
//     const passage = document.getElementById('extracted-text').value;
//     setAnswer(null);
//     console.log('loading model')
//     if (!modelRef.current) modelRef.current = await qna.load();
//     console.log('model loaded')
//     console.log('finding answers')
//     const answers = await modelRef.current.findAnswers(question, passage);
//     console.log('answers found')
//     console.log(answers);
//     setAnswer(answers);
//   }

//   const getAnswer = async () => {
//     const question = document.getElementById('question').value;
//     const passage = document.getElementById('extracted-text').value;
//     setAnswer(null);
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent([`
//       Context: ${passage}

//       Question: ${question}`]);
//     console.log(result.response.text());
//     // setAnswer(answers);
//   }


//   const handleTextExtract = async () => {
//     if (!workerRef.current) {
//       workerRef.current = await createWorker(['eng', 'ben'], 1,
//         {
//           logger: (m) => {
//             console.log(m);
//             setUploadProgress(Number(m.progress) * 100);
//           }
//         }
//       );
//     }
//     workerRef.current.setParameters({
//       tessedit_pageseg_mode: document.getElementById('psm-mode')?.value || '3'
//     })

//     workerRef.current.recognize(imagePath).then(({ data: { text } }) => {
//       document.getElementById('extracted-text').value = text;
//     });
//   }

//   return (
//     <div className='flex flex-col flex-1 bg-gray-100'>
//       <div className='flex flex-row w-full'>
//         <div className='flex flex-col items-center w-1/2'>
//           <Image src={imagePath || "https://cdn.vectorstock.com/i/1000v/50/20/no-photo-or-blank-image-icon-loading-images-vector-37375020.avif"} width={400} height={400} alt='alter' />
//           <input type="file" onChange={handleChange} />
//           <button onClick={handleTextExtract} className='border bg-gray-500 text-white'>Extract Text</button>
//           <select id="psm-mode" defaultValue={'2'} className='border bg-gray-100 text-black m-3 text-center'>
//             <option value='1'>Automatic page segmentation with OSD.</option>
//             <option value='3'>Fully automatic page segmentation, but no OSD. (Default)</option>
//             <option value='4'>Assume a single column of text of variable sizes.</option>
//             <option value='5'>Assume a single uniform block of vertically aligned text.</option>
//             <option value='6'>Assume a single uniform block of text.</option>
//             <option value='7'>Treat the image as a single text line.</option>
//             <option value='8'>Treat the image as a single word.</option>
//             <option value='9'>Treat the image as a single word in a circle.</option>
//             <option value='10'>Treat the image as a single character.</option>
//             <option value='11'>Sparse text. Find as much text as possible in no particular order.</option>
//             <option value='12'>Sparse text with OSD.</option>
//             <option value='13'>Raw line. Treat the image as a single text line, bypassing hacks that are Tesseract-specific.</option>
//           </select>
//         </div>
//         <div className='flex flex-col w-1/2 p-2 items-center'>
//           <textarea id='extracted-text' className='w-full min-h-96' />
//           <Progress value={uploadProgress} className="m-2" color="cyan" />
//           <h1>Ask Question:</h1>
//           <input type='text' id='question' className=' w-1/2 p-2' />
//           <button onClick={getAnswer} className='border bg-gray-500 text-white w-1/3'>Get Answer</button>
//           {
//             answers?.map((answer, index) => (
//               <div key={index} className='border p-2'>
//                 <h1>Answer: {answer.text}</h1>
//                 <h1>Score: {answer.score}</h1>
//               </div>
//             ))
//           }
//           {
//             answers?.length === 0 && <h1>No Answer Found</h1>
//           }
//         </div>
//       </div>
//     </div>
//   );
}