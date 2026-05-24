"use client";

import { useEffect, useState } from "react";

function getGreeting(hour: number): string {
  if (hour < 5) return "夜深了";
  if (hour < 11) return "早上好";
  if (hour < 13) return "中午好";
  if (hour < 18) return "下午好";
  if (hour < 23) return "晚上好";
  return "夜深了";
}

export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("你好");

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  return (
    <>
      {greeting}，我是 {name}。
    </>
  );
}
