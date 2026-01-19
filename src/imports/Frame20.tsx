import clsx from "clsx";
import imgImage from "figma:asset/f84ad6d75c01f5865641dba32416e817dee06ff5.png";
type ContainerBackgroundImage1Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage1({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage1Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}

function ContainerBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">{children}</div>
    </div>
  );
}

function Container() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#eab308] text-[21.6px] text-nowrap">
        <p className="leading-[28.8px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="bg-black h-[43.197px] relative rounded-[9999px] shrink-0 w-[43.207px]" data-name="Background+Border+Shadow">
      <div className="content-stretch flex items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Container />
      </div>
      <div aria-hidden="true" className="absolute border border-[#eab308] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#eab308] text-[9px] text-nowrap tracking-[0.225px]">
        <p className="leading-[9px]">GOLD</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.547px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[4.5px] text-nowrap tracking-[0.9px]">
        <p className="leading-[6.75px]">MEMBERSHIP</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-px items-start relative shrink-0" data-name="Container">
      <Heading1 />
      <Container1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex gap-[10.793px] items-center left-0 top-0" data-name="Container">
      <BackgroundBorderShadow />
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[21.6px] text-nowrap">
        <p className="leading-[28.8px]"></p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="h-[43.197px] w-[358.202px]">
      <Container3 />
      <div className="absolute flex h-[27px] items-center justify-center left-[330.1px] top-[0.9px] w-[29px]" style={{ "--transform-inner-width": "16.203125", "--transform-inner-height": "28.796875" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <Container4 />
        </div>
      </div>
    </ContainerBackgroundImage1>
  );
}

function Container6() {
  return (
    <div className="h-[13.504px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="absolute flex flex-col font-['Consolas:Regular',sans-serif] h-[14px] justify-center leading-[0] left-0 not-italic text-[#9ca3af] text-[9px] top-[6.3px] tracking-[1.35px] translate-y-[-50%] w-[119.876px]">
        <p className="leading-[13.5px]">**** **** **** 8888</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-0.548px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[3.6px] text-nowrap tracking-[0.36px] uppercase">
        <p className="leading-[4.5px]">VALID THRU</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-0.548px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[7.2px] text-nowrap">
        <p className="leading-[10.8px]">12/25</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.548px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Container7 />
      <Container8 />
    </div>
  );
}

function OverlayBorderShadowOverlayBlur() {
  return (
    <div className="backdrop-blur-sm backdrop-filter bg-[rgba(234,179,8,0.2)] content-stretch flex items-start justify-end pb-[6.506px] pl-[11.695px] pr-[11.703px] pt-[10.101px] relative rounded-[4px] shrink-0" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(234,179,8,0.3)] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#eab308] text-[9px] text-nowrap text-right uppercase">
        <p className="leading-[13.5px]">10% OFF</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0" data-name="Container">
      <OverlayBorderShadowOverlayBlur />
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-end size-full">
        <div className="content-stretch flex items-end justify-between relative w-full">
          <Container9 />
          <Container10 />
        </div>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0 w-[358.202px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10.799px] items-start relative w-full">
        <Container6 />
        <Container11 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow1() {
  return (
    <div className="h-[234.002px] relative rounded-[12px] shrink-0 w-full" data-name="Background+Border+Shadow" style={{ backgroundImage: "linear-gradient(149.871deg, rgb(17, 24, 39) 0%, rgb(0, 0, 0) 100%)" }}>
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start justify-between pb-[22.501px] pl-[22.501px] pr-[22.502px] pt-[22.505px] relative size-full">
          <div className="absolute bg-repeat bg-size-[24px_22px] bg-top-left inset-[0.9px] opacity-30" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
          <Container5 />
          <Container12 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(234,179,8,0.5)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative w-[403.2px]" data-name="Container">
      <div className="absolute bg-gradient-to-r blur-sm filter from-[#facc15] inset-[0_-0.01px_0_0] opacity-20 rounded-[12px] to-[#ca8a04]" data-name="Gradient+Blur" />
      <BackgroundBorderShadow1 />
    </div>
  );
}

function Container14() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[30px] text-nowrap">
        <p className="leading-[36px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur1() {
  return (
    <div className="backdrop-blur-[2px] backdrop-filter bg-[rgba(0,0,0,0.8)] relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div className="content-stretch flex items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Container14 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-text bg-gradient-to-b flex flex-col font-['Georgia:Bold',sans-serif] from-[#fef9c3] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-nowrap to-[#ca8a04] tracking-[0.25px] via-1/2" style={{ WebkitTextFillColor: "transparent" }}>
        <p className="leading-[10px]">BITCOIN NAIL BAR</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[5px] text-[rgba(255,255,255,0.8)] text-nowrap tracking-[1px]">
        <p className="leading-[7.5px]">VIP MEMBERSHIP</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col gap-px items-start relative shrink-0" data-name="Container">
      <Heading2 />
      <Container15 />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-0 top-0" data-name="Container">
      <OverlayBorderShadowOverlayBlur1 />
      <Container16 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-80 relative" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[24px] text-nowrap">
        <p className="leading-[32px]"></p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="h-[48px] w-[398px]">
      <Container17 />
      <div className="absolute flex h-[30px] items-center justify-center left-[367px] top-px w-[32px]" style={{ "--transform-inner-width": "18", "--transform-inner-height": "32" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <Container18 />
        </div>
      </div>
    </ContainerBackgroundImage1>
  );
}

function BackgroundBorderShadow2() {
  return (
    <div className="h-[36px] relative rounded-[6px] shrink-0 w-[48px]" data-name="Background+Border+Shadow" style={{ backgroundImage: "linear-gradient(143.13deg, rgb(254, 240, 138) 0%, rgb(250, 204, 21) 50%, rgb(202, 138, 4) 100%)" }}>
      <div className="content-stretch flex items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <div className="h-[16px] relative rounded-[2px] shrink-0 w-[20px]" data-name="Border">
          <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-[2px]" />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_2px_4px_1px_rgba(0,0,0,0.05)]" />
      <div aria-hidden="true" className="absolute border border-[rgba(253,224,71,0.5)] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0 w-[398px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[8px] pr-0 py-0 relative w-full">
        <BackgroundBorderShadow2 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Consolas:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white tracking-[1.5px] w-full">
        <p className="leading-[15px]">8888 8888 8888 8888</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[4px] text-nowrap tracking-[0.4px] uppercase">
        <p className="leading-[5px]">VALID THRU</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[8px] text-nowrap text-white">
        <p className="leading-[12px]">12/30</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container22 />
      <Container23 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Georgia:Bold_Italic',sans-serif] italic justify-center leading-[0] relative shrink-0 text-[#e5e7eb] text-[6px] text-nowrap text-right tracking-[0.6px] uppercase">
        <p className="leading-[9px]">CASHBACK</p>
      </div>
    </div>
  );
}

function OverlayBorderOverlayBlur() {
  return (
    <div className="backdrop-blur-sm backdrop-filter bg-[rgba(0,0,0,0.4)] relative rounded-[4px] shrink-0 w-full" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(247,147,26,0.3)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-col items-end size-full">
        <div className="content-stretch flex flex-col items-end pb-[6.5px] pt-[12.5px] px-[9px] relative w-full">
          <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[10px] text-nowrap text-right">
            <p className="leading-[15px]">20%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Container">
      <Heading />
      <OverlayBorderOverlayBlur />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container24 />
      <Container25 />
    </div>
  );
}

function Container27() {
  return (
    <div className="relative shrink-0 w-[398px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start relative w-full">
        <Container21 />
        <Container26 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow3() {
  return (
    <div className="h-[260px] relative rounded-[12px] shrink-0 w-full" data-name="Background+Border+Shadow" style={{ backgroundImage: "linear-gradient(149.871deg, rgb(10, 10, 10) 0%, rgb(26, 26, 26) 100%)" }}>
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start justify-between p-[25px] relative size-full">
          <div className="absolute inset-px opacity-40" data-name="Image" />
          <Container19 />
          <Container20 />
          <Container27 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(247,147,26,0.5)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_0px_50px_0px_rgba(247,147,26,0.3)]" />
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 max-w-[448px] top-[55.43px] w-[448px]" data-name="Container">
      <div className="absolute bg-gradient-to-r blur-sm filter from-[#f7931a] inset-0 opacity-30 rounded-[16px] to-[#eab308]" data-name="Gradient+Blur" />
      <BackgroundBorderShadow3 />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute flex h-[274.866px] items-center justify-center left-[59.27px] max-w-[403.20013427734375px] top-0 w-[425.451px]" style={{ "--transform-inner-width": "63.1875", "--transform-inner-height": "15.296875" } as React.CSSProperties}>
        <div className="flex-none rotate-[354deg]">
          <Container13 />
        </div>
      </div>
      <Container28 />
    </div>
  );
}