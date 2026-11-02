import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  size?: "small" | "default" | "large";
}

export function BrandLogo({ className = "", size = "default" }: BrandLogoProps) {
  let dimensions = "h-8 w-32 sm:h-9 sm:w-36";

  if (size === "large") {
    dimensions = "h-11 w-44 sm:h-12 sm:w-48";
  } else if (size === "default") {
    dimensions = "h-8 w-32 sm:h-9 sm:w-36";
  } else if (size === "small") {
    dimensions = "h-7 w-28 sm:h-8 sm:w-32";
  }

  return (
    <Link href="/" className={`inline-flex items-center group ${className}`}>
      <div className={`relative ${dimensions} transition-transform duration-150 group-hover:scale-105`}>
        <Image
          src="/images/logo-bantuiin.png"
          alt="Bantuiin.id"
          fill
          priority
          className="object-contain object-left"
          sizes="(max-width: 768px) 150px, 200px"
        />
      </div>
    </Link>
  );
}
