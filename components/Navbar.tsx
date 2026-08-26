"use client";

import Link from "next/link";
import { logout } from "@/app/login/actions";
import { useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/skills", label: "Skills" },
  { href: "/tasks", label: "Tasks" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-semibold text-gray-900">
          Personal OS
        </Link>

        {/* Desktop nav — hidden on small screens */}
        <div className="hidden items-center gap-4 text-sm text-gray-600 sm:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gray-900">
              {link.label}
            </Link>
          ))}
          <form action={logout}>
            <button type="submit" className="hover:text-gray-900">
              Log out
            </button>
          </form>
        </div>

        {/* Hamburger — only visible on small screens */}
        <button
          onClick={() => setOpen(!open)}
          className="text-xl sm:hidden"
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="flex flex-col border-t border-gray-200 px-4 py-2 text-sm text-gray-600 sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2.5"
            >
              {link.label}
            </Link>
          ))}
          <form action={logout}>
            <button type="submit" className="w-full py-2.5 text-left">
              Log out
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}