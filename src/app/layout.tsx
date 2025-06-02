import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Dinn",
  description: "Project Dinn - A retro-styled web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
      <meta charSet="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      <title>Project Dinn</title>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet"/>
    </head>
    <body className="old-crt-monitor">
        <div className="retro-container">
            <main>
                {children}
            </main>
        </div>
    </body>
    </html>
  );
}
