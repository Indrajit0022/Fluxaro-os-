"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_GROUPS } from "@/lib/nav";
import { Icon } from "./Icon";

const STORAGE_KEY = "fluxaro-os.sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // localStorage doesn't exist during SSR, so the collapsed preference can
  // only be read after mount — this is the one-time external-source sync
  // the lint rule's own guidance calls out as a valid use of an effect.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div
      className={`flex ${collapsed ? "w-[76px]" : "w-[212px]"} flex-none flex-col rounded-l-[24px] bg-sidebar py-4 transition-[width] duration-150`}
    >
      <div className={`mb-6 flex items-center gap-2.5 ${collapsed ? "justify-center px-0" : "px-3"}`}>
        <Link
          href="/"
          className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-[14px] bg-white"
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
        {!collapsed && <div className="min-w-0 text-sm font-bold text-white">Fluxaro OS</div>}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {group.label}
              </div>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                // Every nav item is a flat, standalone destination — none of
                // them own sub-pages that should also highlight them — so
                // exact match is correct. (A prefix/boundary match briefly
                // lived here, but /social/calendar being a literal sub-path
                // of /social made "Social Media" light up too.)
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center gap-2.5 rounded-full py-2.5 ${collapsed ? "justify-center px-0" : "px-3"}`}
                    style={{ background: active ? "#2A2A2A" : "transparent" }}
                  >
                    <Icon paths={item.icon} color={active ? "#fff" : "#8A8A86"} size={18} />
                    {!collapsed && (
                      <span
                        className="truncate text-[13px] font-medium"
                        style={{ color: active ? "#fff" : "#8A8A86" }}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-3 flex items-center gap-2.5 border-t border-white/10 pt-3 ${collapsed ? "flex-col px-0" : "px-3"}`}>
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full hover:bg-white/5"
        >
          <Icon
            paths={
              collapsed
                ? '<polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline>'
                : '<polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline>'
            }
            color="#8A8A86"
            size={16}
          />
        </button>
        <div className="h-9 w-9 flex-none overflow-hidden rounded-full">
          <Image
            src="/avatar.png"
            alt="Profile"
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
