'use client'
import Link from "next/link"
import logoIcon from '../../../public/fav.ico';
import logoText from '../../../public/file.svg';
import Image from 'next/image';
import { useEffect } from "react";

export default function Layout({ children }) {
    const navBarLinksCSS = "h-full text-center items-center justify-center transition-transform ease-out duration-300 hover:scale-110 hover:underline-offset-8 hover:underline";

    const checkScroll = () => {
        if (window.scrollY > 0) {
          document.getElementById('navbar').classList.add('scale-90', 'shadow-md');
        }
        else {
          document.getElementById('navbar').classList.remove('scale-90', 'shadow-md');
        }
      }
    
      useEffect(() => {
        window.addEventListener('scroll', checkScroll);
      }, []);

    return (
        <div className="w-screen h-screen">
            <nav
                id="navbar" className="bg-white min-h-20 flex sticky top-0 z-50 flex-row justify-center items-center flex-wrap flex-shrink"
            >
                <Link href={"/"} className="w-4/12 pt-3 h-full flex flex-row justify-center items-center flex-wrap">
                    <Image loading="lazy" className="hidden md:block mr-5 shrink animate-bounce delay-700" src={logoIcon.src} alt="logo" width={50} height={60} />
                    <Image loading='lazy' className="shrink" src={logoText.src} alt="logo-text" width={250} height={100} />
                </Link >
                <div className="w-6/12 text-xl text-center h-full flex flex-row justify-center items-center space-x-6 flex-wrap">
                    <Link href="#features" className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Features</Link>
                    <Link href="#blog" className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Blog</Link>
                    <Link href="#forum" className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Forum</Link>
                </div>
                <div className="flex flex-shrink flex-row justify-center items-center w-2/12">
                    <Link href={'/reglogin'} prefetch={true} id="reglogin" className="h-16 scale-75 hover:underline text-center rounded-2xl border-4 py-3 px-3 bg-blue-400  hover:bg-white text-xl font-semibold hover:text-pink-800 hover:border-pink-800 hover:shadow-lg border-double transition ease-out duration-500">Logout</Link>
                </div>
            </nav>
            {children}
        </div>
    )
}