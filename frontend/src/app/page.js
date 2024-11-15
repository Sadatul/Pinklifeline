'use client'
import Image from "next/image";
import Link from "next/link";
import ForumIcon from '@mui/icons-material/Forum';  //forumicon
import BorderColorSharpIcon from '@mui/icons-material/BorderColorSharp';  //blogicon
import DomainAddSharpIcon from '@mui/icons-material/DomainAddSharp';  //hospitalicon
import VaccinesSharpIcon from '@mui/icons-material/VaccinesSharp';  //doctoricon
import { useState, useEffect } from "react";
import BlogCard from '@/app/components/blogCard';
import ForumPostCard from "./components/forumCard";
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';    //view forum icon
import { useForm } from 'react-hook-form';
// import SlideAnimate from "./components/slideAnimate";
import { motion } from "framer-motion";
import { pagePaths } from "@/utils/constants";
import { SearchX } from "lucide-react";


export default function Home() {
  const navBarLinksCSS = "h-full flex text-center items-center justify-center transition-transform ease-out duration-300 hover:scale-110 hover:underline-offset-8 hover:underline";
  const featureIconCSS = "flex justify-center flex-shrink items-center w-16 h-16 bg-gradient-to-br from-pink-300 to-pink-600 rounded-full";
  const featureTextCSS = "text-xl font-serif font-semibold text-wrap p-3";
  const [blogPost, setBlogPosts] = useState({
    blogId: 3,
    title: "Noteworthy technology",
    imageUrl: "/blog_demo.jpg",
    description: "Here are the biggest enterprise technology acquisitions of 2021 so far...",
    blogUrl: "/"
  });

  const [forumPosts, setForumPosts] = useState([
    {
      postId: 1,
      postHeading: "How to deal with anxiety during treatment?",
      postContent: "I have been feeling very anxious lately and it's making it hard for me to focus on my treatment. Does anyone have any tips on how to deal with anxiety?",
      avaterUrl: "/forumPostDemo.jpg",
      commentsCount: 5,
      postedBy: "Namita",
      postType: "Question"
    },
    {
      postId: 2,
      postHeading: "My experience with chemotherapy",
      postContent: "I recently finished my chemotherapy treatment and wanted to share my experience with others who are going through the same thing. It was a difficult journey, but I'm grateful for the support I received from my family and friends.",
      avaterUrl: "/forumPostDemo.jpg",
      commentsCount: 15,
      postedBy: "Bonny",
      postType: "Experience sharing"
    },
    {
      postId: 3,
      postHeading: "Looking for a support group",
      postContent: "I'm looking for a support group for people who have gone through cancer treatment. I think it would be helpful to connect with others who have had similar experiences.",
      avaterUrl: "/forumPostDemo.jpg",
      commentsCount: 10,
      postedBy: "Nico Robin",
      postType: "Discussion"
    },
  ]);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = (data) => {
    console.log("Form data: ");
    console.log(data);
  }
  // console.log(errors);

  const checkScroll = () => {
    if (window.scrollY > 0) {
      document.getElementById('navbar')?.classList.add('scale-90', 'shadow-md');
    }
    else {
      document.getElementById('navbar')?.classList.remove('scale-90', 'shadow-md');
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', checkScroll);
  }, []);

  return (
    <main className="w-full min-h-screen">
      <nav
        id="navbar" className="bg-white h-16 flex sticky top-0 z-50 flex-row justify-between items-center flex-wrap flex-shrink"
      >
        <Link href={"/"} className="w-fit h-full flex flex-row justify-center items-center flex-wrap ml-16">
          <Image loading="lazy" className="hidden md:block mr-3 shrink delay-700" src={"/Pink-removebg.png"} alt="logo" width={250} height={100} />
          {/* <Image loading='lazy' className="shrink" src={logoText.src} alt="logo-text" width={250} height={100} /> */}
        </Link >
        <div className="w-6/12 text-xl text-center h-full flex flex-row justify-center items-center space-x-6 flex-wrap">
          <Link href="#features" className={navBarLinksCSS}>Features</Link>
          <Link href="#aboutus" className={navBarLinksCSS}>About Us</Link>
          <Link href="#blog" className={navBarLinksCSS}>Blog</Link>
          <Link href="#forum" className={navBarLinksCSS}>Forum</Link>
          <Link href="#hospital" className={navBarLinksCSS}>Hospitals</Link>
          <Link href="#team" className={navBarLinksCSS}>Team</Link>
          <Link href="#contact" className={navBarLinksCSS}>Contact Us</Link>
        </div>
        <div className="flex flex-shrink flex-row justify-end items-center w-2/12 mr-10">
          <Link href={pagePaths.register} prefetch={true} id="reglogin" className="scale-90 rounded-2xl border-4 py-1 px-2 bg-pink-300 hover:scale-95 hover:bg-white text-xl hover:text-pink-800 hover:border-pink-800 hover:shadow-lg border-double transition ease-out duration-500">Register/Login</Link>
        </div>
      </nav>
      <motion.div className="relative w-full h-[800px] flex flex-col justify-center items-center bg-cover bg-center" style={{ backgroundImage: `url(${"/background_home.jpg"})` }}
        variants={{
          hidden: { opacity: 0, scale: 0.5 },
          visible: { opacity: 1, scale: 1 }
        }}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h1 className="text-7xl font-mono font-bold" style={{ WebkitTextStroke: '1px pink', color: 'black' }}>
          Pink Life Line
        </h1>
        <h2 className="text-4xl font-mono font-bold mt-5" style={{ WebkitTextStroke: '1px pink', color: 'black' }}>
          Connecting You to Hope, Health and Healing.
        </h2>
        <Link href="#features" className="mt-10 py-2 px-3 scale-110 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-800 text-white hover:to-blue-600 hover:scale-105 transition ease-in">Learn more</Link>
      </motion.div>
      {/* <SlideAnimate direction="rightToLeft" color="LightBlue"> */}
      <div id="features" className="w-full bg-gray-200 bg-opacity-75 flex flex-col flex-shrink p-5 justify-evenly items-center text-center min-h-80">
        <h1 className="relative text-5xl font-sans font-bold py-4 after:content-[''] after:absolute after:w-2/3 after:h-1 after:bg-pink-500 after:left-1/2 after:bottom-0 after:transform after:-translate-x-1/2">Features</h1>
        <div className="flex flex-row flex-shrink flex-wrap justify-evenly items-center w-full p-5 mt-5">
          <div className="flex max-w-72 flex-col shadow-md border-black flex-wrap bg-indigo-200 flex-shrink justify-center items-center p-5 rounded m-3 m  h-72">
            <div className={featureIconCSS}>
              <ForumIcon fontSize="large" />
            </div>
            <h2 className={featureTextCSS}>Forum of people</h2>
            <p>
              Ask questions, discuss topics, share experiences and help each other.
            </p>
          </div>
          <div className="flex max-w-72 flex-col shadow-md border-black flex-wrap bg-indigo-200 flex-shrink justify-center items-center p-5 rounded m-3 m  h-72">
            <div className={featureIconCSS}>
              <BorderColorSharpIcon fontSize="large" />
            </div>
            <h2 className={featureTextCSS}>Blog posts from experts</h2>
            <p>
              Read blog posts from experts in the field.
            </p>
          </div>
          <div className="flex max-w-72 flex-col shadow-md border-black flex-wrap bg-indigo-200 flex-shrink justify-center items-center p-5 rounded m-3 m  h-72">
            <div className={featureIconCSS}>
              <DomainAddSharpIcon fontSize="large" />
            </div>
            <h2 className={featureTextCSS}>Hospitals for treatment</h2>
            <p>
              Find hospitals for your treatment. Get information about hospitals.
            </p>
          </div>
          <div className="flex max-w-72 flex-col shadow-md border-black flex-wrap bg-indigo-200 flex-shrink justify-center items-center p-5 rounded m-3 m  h-72">
            <div className={featureIconCSS}>
              <VaccinesSharpIcon fontSize="large" />
            </div>
            <h2 className={featureTextCSS}>Doctor&apos;s here for help</h2>
            <p>
              Find doctors for your treatment. See reviews and other informatios.
            </p>
          </div>
        </div>
      </div>
      {/* </SlideAnimate> */}
      {/* <SlideAnimate direction="leftToRight"> */}
      <div id="aboutus" className="flex flex-row flex-wrap divide-x-8 flex-shrink justify-between items-center w-full bg-purple-800 bg-opacity-65 p-10">
        <div className="w-1/2 bg-cover bg-center min-h-80" style={{ backgroundImage: `url(${"/about-us.png"})` }}>
        </div>
        <div className="w-1/2 flex p-5 flex-col min-h-80">
          <div className="relative text-center">
            <h1 className="text-5xl font-sans font-bold text-white inline-block">
              About Us
              <span className="block relative after:content-[''] after:absolute after:w-1/2 after:h-1 after:bg-pink-200 after:left-1/2 after:bottom-[-10px] after:transform after:-translate-x-1/2"></span>
            </h1>
          </div>
          <p className="text-xl font-serif font-semibold p-5 text-white sm:block line-clamp-6">
            Pink Life Line is a platform that connects people to hope, health and healing. We provide a forum for people to share their experiences and connect with others who are going through similar situations. We also provide blog posts from experts in the field, as well as information on hospitals and doctors who can help with treatment. Our goal is to help people find the support and resources they need to live healthy, happy lives.
          </p>
        </div>
      </div>
      {/* </SlideAnimate> */}
      {/* <SlideAnimate direction="bottomToTop" hidden={true}> */}
      <div id="blog" className="relative min-h-[550px] flex flex-row flex-wrap flex-shrink justify-between items-center w-full bg-white bg-opacity-75 p-10 divide-x-4">
        <div className="relative w-8/12 min-h-80 justify-center items-center m-auto">
          <BlogCard title={blogPost.title} imageUrl={"https://domf5oio6qrcr.cloudfront.net/medialibrary/15609/gettyimages-2166741669.jpg"} description={blogPost.description} blogUrl={pagePaths.blogsPage} className={"absolute max-w-[600px] -top-24 left-[450px] z-10 rounded-md"} />
          <BlogCard title={blogPost.title} imageUrl={"https://domf5oio6qrcr.cloudfront.net/medialibrary/15620/gettyimages-1766446189.jpg"} description={blogPost.description} blogUrl={pagePaths.blogsPage} className={"absolute max-w-[600px] -top-16 left-64 z-10 rounded-md"} />
          <BlogCard title={blogPost.title} imageUrl={"https://domf5oio6qrcr.cloudfront.net/medialibrary/15179/9c2ee9da-d6d9-4ab3-81fa-4e2f021c4b74.jpg"} description={blogPost.description} blogUrl={pagePaths.blogsPage} className={"absolute max-w-[600px] -top-10 left-10 z-10 rounded-md"} />
        </div>
        <div className="flex-1 px-10 flex flex-col items-center">
          <div className="flex flex-col justify-center items-center">
            <div className="w-full flex p-5 flex-col items-center justify-evenly">
              <div className="relative text-center">
                <h1 className="text-5xl font-sans font-bold inline-block">
                  Blog
                  <span className="block relative after:content-[''] after:absolute after:w-2/3 after:h-1 after:bg-purple-500 after:left-1/2 after:bottom-[-15px] after:transform after:-translate-x-1/2"></span>
                </h1>
              </div>
              <h2 className="text-xl font-serif font-semibold p-5">Experience, Knowledge, Share</h2>
            </div>
          </div>
          <Link className="mt-1 ml-8 items-center gap-3 w-56 flex flex-row text-lg hover:underline hover:scale-110 transition ease-in-out duration-300" href={pagePaths.blogsPage} >
            <ArrowCircleRightOutlinedIcon fontSize="large" sx={{ color: 'purple' }} />
            Go to Blogs
          </Link>
        </div>
      </div>
      {/* </SlideAnimate> */}
      {/* <SlideAnimate direction="rightToLeft" color="Cornsilk"> */}
      <div id="forum" className="relative min-h-[450px] flex flex-row flex-wrap flex-shrink justify-between items-center w-full bg-gray-100 bg-opacity-75 p-10 divide-x-4">
        <div className="w-4/12 px-10">
          <h1 className="text-5xl font-sans font-bold inline-block">
            Forum
            <span className="block relative after:content-[''] after:absolute after:w-2/3 after:h-1 after:bg-pink-500 after:left-0 after:bottom-[-15px] after:transform "></span>
          </h1>
          <h2 className="mt-5 text-2xl font-semibold">Ask, Discuss, Share, Help</h2>
          <Link href={pagePaths.forumPage} className="mt-5 items-center gap-3 w-56 flex flex-row text-lg hover:underline hover:scale-110 transition ease-in-out duration-300" >
            <ArrowCircleRightOutlinedIcon fontSize="large" sx={{ color: 'rgb(255,20,147)' }} />
            Go to Forum
          </Link>
        </div>
        <div className="relative w-8/12 min-h-80 justify-center items-center m-auto">
          <ForumPostCard
            postHeading={forumPosts[0].postHeading}
            postContent={forumPosts[0].postContent}
            avaterUrl={forumPosts[0].avaterUrl}
            commentsCount={forumPosts[0].commentsCount}
            postedBy={forumPosts[0].postedBy}
            postType={forumPosts[0].postType}
            className="absolute max-w-[600px] top-5 left-5 z-10 rounded-md"
          />
          <ForumPostCard
            postHeading={forumPosts[1].postHeading}
            postContent={forumPosts[1].postContent}
            avaterUrl={forumPosts[1].avaterUrl}
            commentsCount={forumPosts[1].commentsCount}
            postedBy={forumPosts[1].postedBy}
            postType={forumPosts[1].postType}
            className="absolute max-w-[600px] top-40 left-40 z-20 rounded-md hidden md:block"
          />
          <ForumPostCard
            postHeading={forumPosts[2].postHeading}
            postContent={forumPosts[2].postContent}
            avaterUrl={forumPosts[2].avaterUrl}
            commentsCount={forumPosts[2].commentsCount}
            postedBy={forumPosts[2].postedBy}
            postType={forumPosts[2].postType}
            className="absolute max-w-[600px] -top-10 left-96  z-15 rounded-md hidden md:block"
          />
        </div>
      </div>
      {/* </SlideAnimate> */}
      {/* <SlideAnimate direction="bottomToTop" hidden={true}> */}
      <div id="hospital" className="flex flex-row items-center flex-wrap flex-shrink w-full p-5 gap-7 bg-blue-50 bg-opacity-70 min-h-[500px] divide-x-4">
        <div className="flex flex-row items-center justify-center flex-1 gap-10">
          <Image src={"/hospital.png"} width={300} height={300} alt="hospital-image" />
          <div className="relative size-fit">
            <Image src={"https://img.freepik.com/premium-vector/personal-data-sheet-icon-outline-personal-data-sheet-vector-icon-color-flat-isolated_96318-114028.jpg"} width={300} height={300} alt="hospital-image" />
            <SearchX size={65} className="absolute bottom-20 right-24 text-blue-800 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-4/12 gap-3 h-full">
          <div className="flex flex-col items-center justify-center w-full gap-2">
            <span className="text-5xl font-bold text-blue-800">
              Hospital Info
            </span>
            <span className="text-2xl font-semibold text-blue-700 text-center">
              Treatment, Tests, Reccommendations.
            </span>
          </div>
          <Link href={pagePaths.allHospitalsPage} className="mt-5 items-center gap-3 w-56 flex flex-row text-lg hover:underline hover:scale-110 transition ease-in-out duration-300" >
            <ArrowCircleRightOutlinedIcon fontSize="large" sx={{ color: 'blue' }} />
            Search Hospitals
          </Link>
        </div>
      </div>
      <div id="team" className="flex flex-col flex-wrap flex-shrink w-full p-5">
        <div className="relative text-center">
          <h1 className="text-5xl font-sans font-bold inline-block">
            Team
            <span className="block relative after:content-[''] after:absolute after:w-3/5 after:h-1 after:bg-blue-700 after:left-1/2 after:bottom-[-15px] after:transform after:-translate-x-1/2"></span>
          </h1>
        </div>
        <div className="flex flex-row mt-12 flex-wrap divide-x-2 flex-shrink w-full">

          <div className="flex flex-col flex-wrap flex-shrink w-1/2 justify-evenly items-center">
            <Image src={"/sadi_profile.jpg"} alt="sadi" width={200} height={200} className="rounded-full" loading='lazy' />
            <h1 className="text-2xl font-serif font-semibold mt-5">Sadatul Islam Sadi</h1>
            <Link prefetch={true} href="https://www.facebook.com/profile.php?id=100075469924262" className="m-5">
              <Image src={"/Facebook_Logo_Primary.png"} width={30} height={30} alt="facebooklink" />
            </Link>
          </div>
          <div className="flex flex-col flex-wrap flex-shrink w-1/2 justify-evenly items-center">
            <Image src={"/adil_profile.jpg"} alt="sadi" width={200} height={200} className="rounded-full" loading='lazy' />
            <h1 className="text-2xl font-serif font-semibold mt-5">MD. Hasnaen Adil</h1>
            <Link prefetch={true} href="https://www.facebook.com/hasnainadil.13" className="m-5">
              <Image src={"/Facebook_Logo_Primary.png"} width={30} height={30} alt="facebooklink" />
            </Link>
          </div>
        </div>
      </div>
      {/* </SlideAnimate> */}
      {/* <SlideAnimate direction="topToBottom" color="BlueViolet"> */}
      <div id="contact" className="flex flex-col flex-wrap flex-shrink w-full bg-blue-800 opacity-80">
        <h1 className="text-3xl font-sans font-bold text-white text-center p-5 underline underline-offset-4">Contact Us</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row divide-x flex-wrap flex-shrink justify-center items-center w-full p-5">
          <div className="w-1/2 p-15 m-auto flex flex-col justify-center items-center">
            <textarea maxLength={200} {...register("Text", { required: true, maxLength: 200 })} className="w-3/4 m-auto min-h-40 p-5 rounded-xl border-2 border-gray-100" placeholder="Enter your message here"></textarea>
            {errors.Text?.type === "required" && (
              <p role="alert" className="text-pink-100">Text is required</p>
            )}
            {
              errors.Text?.type === "maxLength" && (
                <p role="alert" className="text-pink-100">Text is too long. Max length is 200.</p>
              )
            }
          </div>
          <div className="w-1/2 flex flex-col h-full flex-wrap flex-shrink justify-evenly items-center">
            <div className="flex flex-col h-full flex-wrap flex-shrink justify-evenly items-center">
              <label className="text-white text-xl font-serif font-semibold">Name</label>
              <input {...register("Name", { required: true, maxLength: 32 })} type="text" className="w-80 p-2 rounded-xl border-2 border-gray-100 " placeholder="Enter your name" />
              {errors.Name?.type === "required" && (
                <p role="alert" className="text-pink-100">Name is required</p>
              )}
              {errors.Name?.type === "maxLength" && (
                <p role="alert" className="text-pink-100">Name is too long. Max length is 32.</p>
              )}
              <label className="text-white text-xl font-serif font-semibold mt-3">Email</label>
              <input {...register("Email", { required: true, maxLength: 32 })} type="email" className="w-80 p-2 rounded-xl border-2 border-gray-100" placeholder="Enter your email" />
              {errors.Email?.type === "required" && (
                <p role="alert" className="text-pink-100" onClick={console.log(errors)}>Email is required</p>
              )}
              {errors.Email?.type === "maxLength" && (
                <p role="alert" className="text-pink-100">Email is too long. Max length is 32.</p>
              )}
              <button type="submit" className="w-32 px-2 text-center mt-5 text-lg rounded-xl border-2 border-gray-100 bg-white text-black hover:bg-black hover:text-white transition ease-in-out duration-300">Send</button>
            </div>
          </div>
        </form>
      </div>
      {/* </SlideAnimate> */}
      <div id="footer" className="flex flex-col justify-center bg-gray-800 text-sm text-white w-full text-center h-12 items-center" >
        <p>
          &copy; This website is done by Sadatul Islam Sadi and MD. Hasnaen Adil for JavaFest 2024 arranged by Therap.
        </p>
      </div>
    </main>
  );
}

