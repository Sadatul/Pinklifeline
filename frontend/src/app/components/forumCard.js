'use client'
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

export default function ForumPostCard({
  postHeading,
  postContent,
  avaterUrl,
  commentsCount,
  postedBy,
  postType,
  className
}) {
  return (
    <div className={className}>
      <div className="flex flex-col flex-shrink rounded-xl border-2 border-gray-100 bg-white">
        <div className="flex items-start p-5">
          <Link href="#" className="shrink">
            <Image
              alt=""
              src={avaterUrl}
              width={60}
              height={60}
              className=" rounded-lg object-cover"
            />
          </Link>
          <div className="ml-3">
            <h3 className="font-medium sm:text-lg flex items-center">
              <Link href="#" className="hover:underline"> {postHeading} </Link>
              <span className="ml-2 rounded-2xl border scale-75 px-1 border-black">{postType}</span>
            </h3>
            <p className="line-clamp-2 text-sm text-gray-700">
              {postContent}
            </p>
            <div className="mt-2">
              <div className="flex items-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
                <p className="text-xs ml-1">{commentsCount} comments</p>
              </div>
              <span className="hidden sm:block" aria-hidden="true">&middot;</span>
              <p className="hidden sm:block sm:text-xs sm:text-gray-500">
                Posted by
                <Link href="#" className="font-medium underline hover:text-gray-700"> {postedBy} </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
