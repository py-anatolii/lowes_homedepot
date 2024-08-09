import { Metadata } from 'next';

import RegisterForm from '@/components/Register/RegisterForm';
import Logo from '@/components/common/Logo';

export const metadata: Metadata = {
    title: "Register"
}

export default function RegisterPage() {
    return (
        <main className="flex items-center justify-center h-screen border-2">
            <div className="relative mx-auto flex w-full max-w-[450px] flex-col space-y-2.5 p-4 -mt-16">
                <div className="flex w-full rounded-lg bg-green-500 h-28">
                    <Logo textSize='text-4xl' />
                </div>
                <RegisterForm />
            </div>
        </main>
    );
}