import { Suspense } from "react";
import ForgotPasswordPage from "./ForgotPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
