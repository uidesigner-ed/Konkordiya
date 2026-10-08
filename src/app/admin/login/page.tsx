import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import { Logo } from "@/components/ui/LogoMark";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Вхід" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  return (
    <main className="adm-login">
      <div className="adm-login__card">
        <Logo />
        <h1 className="adm-login__title">Вхід в адмінку</h1>
        <LoginForm />
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- сайт — інший макет, повне завантаження */}
        <a href="/" className="adm-login__back">
          ← На сайт
        </a>
      </div>
    </main>
  );
}
