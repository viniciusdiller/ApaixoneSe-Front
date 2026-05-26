"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /admin/login agora é apenas um redirect para /login.
 * Mantemos o arquivo para não quebrar links antigos salvos.
 */
export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/login"); }, [router]);
  return null;
}
