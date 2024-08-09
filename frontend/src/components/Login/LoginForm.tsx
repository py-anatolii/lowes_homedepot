/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AtSymbolIcon, KeyIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import { useNotification } from "@/context/NotificationContext";
import useAuth from "@/hooks/useAuth";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const { setSuccessMessage, setErrorMessage } = useNotification();

  const { data, error, loading, fetchData } = useAuth({
    url: "/users/login",
    requestData: { email, password },
  });

  useEffect(() => {
    if (data) {
      localStorage.setItem("token", data?.access_token);
      router.push("/dashboard");
      setSuccessMessage("Login Successfully");
    }
  }, [data]);

  useEffect(() => {
    setErrorMessage(error);
  }, [error]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className="mb-3 font-bold text-2xl">Sign in</h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="username"
            >
              Email:
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password:
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <LoginButton pending={loading} />
        </div>
        <div className="flex justify-center p-6">
          <Link href="/auth/register" className="flex items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Not registered?</span>
              <span className="hover:underline text-sm text-green-600">
                Create a account
              </span>
            </div>
          </Link>
        </div>
      </div>
    </form>
  );
}

function LoginButton({ pending }: { pending: boolean }) {
  return (
    <button
      className="flex h-10 items-center rounded-lg bg-green-500 px-4 text-sm font-medium text-white transition-colors hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 mt-4 w-full"
      aria-disabled={pending}
    >
      Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </button>
  );
}
