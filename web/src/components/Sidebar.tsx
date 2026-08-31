"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { Icon } from "./Icon";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-[76px] flex-none flex-col items-center rounded-l-[24px] bg-sidebar py-4">
      <Link
        href="/"
        className="mb-7 flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-[14px] bg-white"
      >
        <Image
          src="/logo.png"
          alt="Fluxaro logo"
          width={44}
          height={44}
          className="h-full w-full object-cover"
          style={{ transform: "scale(1.18)" }}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              title={item.label}
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ background: active ? "#2A2A2A" : "transparent" }}
            >
              <Icon paths={item.icon} color={active ? "#fff" : "#8A8A86"} size={18} />
            </Link>
          );
        })}
      </div>

      <div className="mt-3 h-9 w-9 flex-none overflow-hidden rounded-full">
        <Image
          src="/avatar.png"
          alt="Profile"
          width={36}
          height={36}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
