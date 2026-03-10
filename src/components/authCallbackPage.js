import { useEffect, useState } from "react";
import "./style/authCallbackPage.css";

export default function AuthCallbackPage() {
 const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (!code) {
        setStatus("error");
        return;
      }

      try {
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) throw new Error("Auth failed");

        setStatus("success");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="callback-page">
      <div className="callback-card">

        {status === "loading" && (
          <>
            <div className="callback-spinner" />
            <p className="callback-body">Signing you in...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="callback-circle callback-circle--success">✓</div>
            <h2 className="callback-heading">Successfully Logged In</h2>
            <p className="callback-body">
              Welcome back. Redirecting you to the calendar...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="callback-circle callback-circle--error">✕</div>
            <h2 className="callback-heading">There Was an Error</h2>
            <p className="callback-body">
              Something went wrong during sign in.
            </p>
          </>
        )}

      </div>
    </div>
  );
}