"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useEffect, useState } from "react"

function Logo() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    const logoSrc = !mounted ? "/logos/logo-light.png" : (resolvedTheme === "dark"
        ? "/logos/logo-dark.png"
        : "/logos/logo-light.png")

    return (
        <Link href="/" className="flex items-center gap-2">
            <Image 
                src={logoSrc} 
                alt="Fincare Logo" 
                width={124}  
                height={40}  
                className="h-auto w-auto"
                priority
            />
        </Link>
    )
}

export function LogoMobile() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    const logoSrc = !mounted ? "/logos/logo-light.png" : (resolvedTheme === "dark"
        ? "/logos/logo-dark.png"
        : "/logos/logo-light.png")
    return (
        <Link href="/" className="flex items-center gap-2">
            <Image 
                src={logoSrc} 
                alt="Fincare Logo" 
                width={100}  
                height={32}  
                className="h-auto w-auto"
                priority
            />
        </Link>
    )
}

export default Logo