import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/** Typed accessor for auth state; throws if used outside the provider. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an <AuthProvider>");
  return ctx;
}
