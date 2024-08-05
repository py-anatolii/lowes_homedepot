import type { Metadata } from "next";

import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen">
      <Header />
      {children}
    </div>
  );
}
