"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {

  const handleSignOut = () =>{
    localStorage.setItem('token', '');
  }
  
  return (
    <nav className="bg-white mx-2 border-gray-200 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          href="/dashboard"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image
            src="/logo.png"
            className="h-8"
            width={100}
            height={100}
            alt="Logo"
            style={{ width: '40px', height: '40px' }}
          />
          <span className="self-center text-3xl text-green-600 font-semibold whitespace-nowrap dark:text-white">
            Lowe's vs Home Depot
          </span>
        </Link>
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button
            type="button"
            className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
