import svgPaths from "./svg-krgxt07t80";

function Earth() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Earth">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Earth">
          <path d={svgPaths.p33a3f200} fill="var(--fill-0, #F7931A)" id="Vector" />
          <path d={svgPaths.p2d3e1240} fill="var(--fill-0, #F7931A)" id="Vector_2" />
          <path d={svgPaths.p1cff8c00} fill="var(--fill-0, #F7931A)" id="Vector_3" />
          <path d={svgPaths.p12081000} fill="var(--fill-0, #F7931A)" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function LanguageSelector() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] h-[24px] items-center justify-center relative shrink-0" data-name="Language Selector">
      <Earth />
      <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold h-[8px] leading-none not-italic relative shrink-0 text-[#f7931a] text-[9px] w-[13px]">EN</p>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="chevron-down">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #F7931A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative size-full">
      <LanguageSelector />
      <ChevronDown />
    </div>
  );
}