"use client"

import { Source_Sans_3 } from 'next/font/google'

const roboto = Source_Sans_3({
    weight: ['400', '700'],
    style: ['italic'],
    subsets: ['latin'],
    display: 'swap',
});

export default function Logo({ textSize }: { textSize: string }) {
    return (
        <div className="flex items-center rounded-md w-full"
        >
            <div className={`${roboto.className} flex flex-row w-full items-center leading-none text-white`}>
                <div className={`text-white text-center w-full font-bold ${textSize}`}>
                    Lowe's vs Home Depot
                </div>
            </div>
        </div>
    );
}