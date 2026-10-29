import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  size?: "default" | "large";
}

export function BrandLogo({ className = "", size = "default" }: BrandLogoProps) {
  const dimensions =
    size === "large"
      ? "h-14 w-60 sm:h-16 sm:w-64"
      : "h-11 w-48 sm:h-12 sm:w-52";

  return (
    <Link href="/" className={`inline-flex items-center group ${className}`}>
      <div className={`relative ${dimensions} transition-transform duration-150 group-hover:scale-105`}>
        <Image
          src="/images/logo.png"
          alt="Bantuiin.id"
          fill
          priority
          className="object-contain object-left"
          sizes="(max-width: 768px) 200px, 260px"
        />
      </div>
    </Link>
  );
}

