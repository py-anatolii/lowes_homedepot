import { Metadata } from "next";

import Dashboard from "@/components/Dashboard";
import Container from "@/components/common/Container";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="flex w-full">
      <Container>
        <Dashboard />
      </Container>
    </main>
  );
}
