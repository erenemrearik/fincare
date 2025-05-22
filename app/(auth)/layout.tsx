import { AuthBackground } from "@/components/auth-background";
import Logo from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className=" relative flex flex-col w-full h-screen items-center justify-center">
            <AuthBackground />
            <Logo />
            <div className="mt-12">{children}</div>
        </div>
    )
}