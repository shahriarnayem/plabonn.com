import Link from "next/link";

export function PokeMeButton({
  href = "/contact",
  label = "POKE ME",
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-stretch rounded-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a000f]"
    >
      <span className="flex min-h-[38px] items-center justify-center rounded-l-[13px] rounded-r-[11px] bg-[#b90016] px-[22px] text-[12px] font-medium uppercase text-white transition-colors duration-200 group-hover:bg-[#9a000f]">
        {label}
      </span>

      <span className="-ml-[2px] flex min-h-[38px] w-[40px] items-center justify-center rounded-[11px] bg-[#b90016] text-white transition-colors duration-200 group-hover:bg-[#9a000f]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 17L17 7M9 7H17V15"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}