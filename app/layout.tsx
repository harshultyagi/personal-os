import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import { createClient } from "@/utils/supabase/server";
import { getSuggestions } from "@/lib/suggestions";

export const metadata: Metadata = {
  title: "Personal OS",
  description: "Personal career and project operating system",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const suggestions = user ? await getSuggestions(supabase, user.id) : [];

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        {user && <ChatWidget initialSuggestions={suggestions} />}
      </body>
    </html>
  );
}