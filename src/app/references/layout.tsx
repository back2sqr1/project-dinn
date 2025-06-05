import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Project Dinn",
  description: "Project Dinn - A retro-styled web application",
};

export default function BGLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
    </div>
  );
}
