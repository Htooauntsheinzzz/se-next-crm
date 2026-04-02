import Image from "next/image";

export const Brand = () => {
  return (
    <div className="flex items-center justify-center gap-3 text-white">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 shadow-lg shadow-[#6E55A8]/30">
        <Image src="/applogo.svg" alt="Sales Surge logo" width={26} height={26} priority />
      </span>
      <h1 className="text-[42px] leading-none font-bold tracking-tight md:text-[44px]">
        Sales Surge
      </h1>
    </div>
  );
};
