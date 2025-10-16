// app/Components/Footer.tsx
'use client';

import { useEffect, useState } from "react";

export default function Footer() {
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(new Date().toLocaleDateString());
  }, []);

  return (
    <footer
      style={{
        marginTop: "2rem",
        padding: "12px 0",
        borderTop: "2px solid var(--border) !important",
        textAlign: "center",
        fontWeight: 500,
      }}
    >
      Copyright Mibis Shrestha, 21934327, {today}
    </footer>
  );
}