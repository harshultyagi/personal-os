import Link from "next/link";
import { logout } from '@/app/login/actions'

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/skills", label: "Skills" },
  { href: "/tasks", label: "Tasks" },
];

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-semibold text-gray-900">
          Personal OS
        </Link>
        <div className="flex gap-4 text-sm text-gray-600">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-gray-900"
            >
              {link.label}
            </Link>            
          ))}
          <form action={logout}>
                <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                  Log out
                </button>
              </form>
        </div>
      </div>
    </nav>
  );
}



