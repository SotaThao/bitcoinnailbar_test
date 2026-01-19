import clsx from "clsx";
import imgImage from "figma:asset/f84ad6d75c01f5865641dba32416e817dee06ff5.png";
type Container54BackgroundImageProps = {
  additionalClassNames?: string;
};

function Container54BackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<Container54BackgroundImageProps>) {
  return (
    <div style={{ "--transform-inner-width": "27", "--transform-inner-height": "40" } as React.CSSProperties} className={clsx("absolute flex items-center justify-center", additionalClassNames)}>
      {children}
    </div>
  );
}
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
type ContainerBackgroundImageAndText2Props = {
  text: string;
};

function ContainerBackgroundImageAndText2({ text }: ContainerBackgroundImageAndText2Props) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#60a5fa] text-[12px] text-nowrap">
        <p className="leading-[12px]">{text}</p>
      </div>
    </div>
  );
}
type ContainerBackgroundImageAndText1Props = {
  text: string;
};

function ContainerBackgroundImageAndText1({ text }: ContainerBackgroundImageAndText1Props) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap">
        <p className="leading-[12px]">{text}</p>
      </div>
    </div>
  );
}
type ContainerBackgroundImageAndTextProps = {
  text: string;
};

function ContainerBackgroundImageAndText({ text }: ContainerBackgroundImageAndTextProps) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-nowrap">
        <p className="leading-[12px]">{text}</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[7px] text-nowrap">
        <p className="leading-[7px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit]">
        <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[7px] text-nowrap text-white tracking-[0.7px] uppercase">
          <p className="leading-[10.5px]">The First Bitcoin Nail Salon in the USA</p>
        </div>
      </div>
    </div>
  );
}

function OverlayBorderShadowOverlayBlur() {
  return (
    <div className="backdrop-blur-[6px] backdrop-filter bg-[rgba(0,0,0,0.6)] max-w-[712px] relative rounded-[9999px] shrink-0" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div className="content-stretch flex gap-[8px] items-center max-w-[inherit] overflow-clip px-[17px] py-[7px] relative rounded-[inherit]">
        <Container />
        <Container1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_15px_0px_rgba(247,147,26,0.3)]" />
    </div>
  );
}

function Heading() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 1">
      <div className="content-stretch flex flex-col items-start px-[8px] py-0 relative w-full">
        <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[32px] not-italic relative shrink-0 text-[#1f2937] text-[24px] text-nowrap">
          <p className="mb-0">
            <span>{`Unlock `}</span>
            <span className="text-[#d4af37]">VIP Status</span>
          </p>
          <p className="text-[#f7931a]">Get Rewards</p>
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[576px] relative shrink-0 w-[576px]" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Semibold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[18px] text-nowrap">
        <p className="leading-[28px] mb-0">
          <span>{`Elevate your beauty experience with our `}</span>
          <span className="font-['Segoe_UI:Bold',sans-serif] not-italic">Membership Program</span>. Enjoy
        </p>
        <p className="leading-[28px]">
          <span>{`up to `}</span>
          <span className="font-['Segoe_UI:Bold',sans-serif] not-italic text-[#f7931a]">20% Cashback</span>, priority booking, and exclusive access.
        </p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start px-[42px] py-[18px] relative rounded-[9999px] self-stretch shrink-0" data-name="Link" style={{ backgroundImage: "linear-gradient(46.3281deg, rgb(247, 147, 26) 0%, rgb(255, 171, 46) 100%)" }}>
      <div aria-hidden="true" className="absolute border-2 border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_20px_0px_rgba(247,147,26,0.4)]" />
      <a className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-black text-nowrap" href="https://bitcoinnailbarnew1.tiiny.site/#membership">
        <p className="cursor-pointer leading-[28px]">VIEW PACKAGES</p>
      </a>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-left text-nowrap text-white" role="link" tabIndex="0">
        <p className="cursor-pointer leading-[18px]"></p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center relative">
        <Container3 />
        <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-nowrap text-white" role="link" tabIndex="0">
          <p className="cursor-pointer leading-[28px]">PROMOTIONS</p>
        </div>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <a className="backdrop-blur-[2px] backdrop-filter bg-[rgba(255,255,255,0.05)] cursor-pointer relative rounded-[9999px] self-stretch shrink-0" data-name="Link" href="https://bitcoinnailbarnew1.tiiny.site/#promotions">
      <div className="content-stretch flex flex-col h-full items-start overflow-clip px-[42px] py-[18px] relative rounded-[inherit]">
        <div className="absolute bg-white inset-[2px_228.65px_2px_-224.65px]" data-name="Background" />
        <Container4 />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
    </a>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-wrap gap-[0px_20px] items-start pb-0 pt-[8px] px-0 relative shrink-0 w-full" data-name="Container">
      <Link />
      <Link1 />
    </div>
  );
}

function Container6() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start min-h-px min-w-px pb-0 pt-[3.25px] px-0 relative shrink-0" data-name="Container">
      <OverlayBorderShadowOverlayBlur />
      <Heading />
      <Container2 />
      <Container5 />
    </div>
  );
}

function Container7() {
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
        <Container7 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#eab308] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#eab308] text-[9px] text-nowrap tracking-[0.225px]">
        <p className="leading-[9px]">GOLD</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.547px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[4.5px] text-nowrap tracking-[0.9px]">
        <p className="leading-[6.75px]">MEMBERSHIP</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col gap-px items-start relative shrink-0" data-name="Container">
      <Heading2 />
      <Container8 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex gap-[10.793px] items-center left-0 top-0" data-name="Container">
      <BackgroundBorderShadow />
      <Container9 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[21.6px] text-nowrap">
        <p className="leading-[28.8px]"></p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="h-[43.197px] w-[358.202px]">
      <Container10 />
      <div className="absolute flex h-[27px] items-center justify-center left-[330.1px] top-[0.9px] w-[29px]" style={{ "--transform-inner-width": "16.203125", "--transform-inner-height": "28.796875" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <Container11 />
        </div>
      </div>
    </ContainerBackgroundImage1>
  );
}

function Container13() {
  return (
    <div className="h-[13.504px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="absolute flex flex-col font-['Consolas:Regular',sans-serif] h-[14px] justify-center leading-[0] left-0 not-italic text-[#9ca3af] text-[9px] top-[6.3px] tracking-[1.35px] translate-y-[-50%] w-[119.876px]">
        <p className="leading-[13.5px]">**** **** **** 8888</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-0.548px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[3.6px] text-nowrap tracking-[0.36px] uppercase">
        <p className="leading-[4.5px]">VALID THRU</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-0.548px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[7.2px] text-nowrap">
        <p className="leading-[10.8px]">12/25</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.548px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Container14 />
      <Container15 />
    </div>
  );
}

function OverlayBorderShadowOverlayBlur1() {
  return (
    <div className="backdrop-blur-sm backdrop-filter bg-[rgba(234,179,8,0.2)] content-stretch flex items-start justify-end pb-[6.506px] pl-[11.695px] pr-[11.703px] pt-[10.101px] relative rounded-[4px] shrink-0" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(234,179,8,0.3)] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#eab308] text-[9px] text-nowrap text-right uppercase">
        <p className="leading-[13.5px]">10% OFF</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0" data-name="Container">
      <OverlayBorderShadowOverlayBlur1 />
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-end size-full">
        <div className="content-stretch flex items-end justify-between relative w-full">
          <Container16 />
          <Container17 />
        </div>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 w-[358.202px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10.799px] items-start relative w-full">
        <Container13 />
        <Container18 />
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
          <Container12 />
          <Container19 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(234,179,8,0.5)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative w-full" data-name="Container">
      <div className="absolute bg-gradient-to-r blur-sm filter from-[#facc15] inset-[0_-0.01px_0_0] opacity-20 rounded-[12px] to-[#ca8a04]" data-name="Gradient+Blur" />
      <BackgroundBorderShadow1 />
    </div>
  );
}

function Container21() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d4af37] text-[36px] text-nowrap">
        <p className="leading-[40px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur2() {
  return (
    <div className="backdrop-blur-md backdrop-filter bg-[rgba(0,0,0,0.6)] content-stretch flex items-center justify-center pb-[12.003px] pt-[10.993px] px-[2px] relative rounded-[9999px] shrink-0 size-[63.997px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div aria-hidden="true" className="absolute border-2 border-[#d4af37] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_30px_0px_rgba(212,175,55,0.6)]" />
      <Container21 />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_2px_rgba(212,175,55,0.2)]" />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-center relative" data-name="Container">
      <OverlayBorderShadowOverlayBlur2 />
    </div>
  );
}

function Container23() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid','Noto_Sans:Black',sans-serif] justify-center leading-[0] relative shrink-0 text-[#f7931a] text-[24px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 900" }}>
        <p className="leading-[32px]">%</p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur3() {
  return (
    <div className="backdrop-blur-md backdrop-filter bg-[rgba(0,0,0,0.6)] content-stretch flex items-center justify-center p-[2px] relative rounded-[9999px] shrink-0 size-[56.003px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div aria-hidden="true" className="absolute border-2 border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_30px_0px_rgba(247,147,26,0.6)]" />
      <Container23 />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_2px_rgba(247,147,26,0.2)]" />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-center relative" data-name="Container">
      <OverlayBorderShadowOverlayBlur3 />
    </div>
  );
}

function Container25() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[30px] text-nowrap">
        <p className="leading-[36px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur4() {
  return (
    <div className="backdrop-blur-[2px] backdrop-filter bg-[rgba(0,0,0,0.8)] relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div className="content-stretch flex items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Container25 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-text bg-gradient-to-b flex flex-col font-['Georgia:Bold',sans-serif] from-[#fef9c3] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-nowrap to-[#ca8a04] tracking-[0.25px] via-50% via-[#fde047]" style={{ WebkitTextFillColor: "transparent" }}>
        <p className="leading-[10px]">BITCOIN NAIL BAR</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[5px] text-[rgba(255,255,255,0.8)] text-nowrap tracking-[1px]">
        <p className="leading-[7.5px]">VIP MEMBERSHIP</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col gap-px items-start relative shrink-0" data-name="Container">
      <Heading3 />
      <Container26 />
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-0 top-0" data-name="Container">
      <OverlayBorderShadowOverlayBlur4 />
      <Container27 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-80 relative" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[24px] text-nowrap">
        <p className="leading-[32px]"></p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="h-[48px] w-[398px]">
      <Container28 />
      <div className="absolute flex h-[30px] items-center justify-center left-[367px] top-px w-[32px]" style={{ "--transform-inner-width": "18", "--transform-inner-height": "32" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <Container29 />
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

function Container31() {
  return (
    <div className="relative shrink-0 w-[398px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[8px] pr-0 py-0 relative w-full">
        <BackgroundBorderShadow2 />
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Consolas:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white tracking-[1.5px] w-full">
        <p className="leading-[15px]">8888 8888 8888 8888</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[4px] text-nowrap tracking-[0.4px] uppercase">
        <p className="leading-[5px]">VALID THRU</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[8px] text-nowrap text-white">
        <p className="leading-[12px]">12/30</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container33 />
      <Container34 />
    </div>
  );
}

function Heading1() {
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

function Container36() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Container">
      <Heading1 />
      <OverlayBorderOverlayBlur />
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container35 />
      <Container36 />
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0 w-[398px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start relative w-full">
        <Container32 />
        <Container37 />
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
          <Container30 />
          <Container31 />
          <Container38 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(247,147,26,0.5)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_0px_50px_0px_rgba(247,147,26,0.3)]" />
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[448px] relative shrink-0 w-[448px]" data-name="Container">
      <div className="absolute bg-gradient-to-r blur-sm filter from-[#f7931a] inset-0 opacity-30 rounded-[16px] to-[#eab308]" data-name="Gradient+Blur" />
      <BackgroundBorderShadow3 />
    </div>
  );
}

function Container40() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f472b6] text-[30px] text-nowrap">
        <p className="leading-[36px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur5() {
  return (
    <div className="backdrop-blur-md backdrop-filter bg-[rgba(0,0,0,0.6)] content-stretch flex items-center justify-center p-[2px] relative rounded-[16px] shrink-0 size-[64.001px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div aria-hidden="true" className="absolute border-2 border-[#ec4899] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_0px_30px_0px_rgba(236,72,153,0.8)]" />
      <Container40 />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_2px_rgba(236,72,153,0.2)]" />
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col h-full items-center relative" data-name="Container">
      <OverlayBorderShadowOverlayBlur5 />
    </div>
  );
}

function Container42() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#c084fc] text-[24px] text-nowrap">
        <p className="leading-[32px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur6() {
  return (
    <div className="backdrop-blur-md backdrop-filter bg-[rgba(0,0,0,0.6)] content-stretch flex items-center justify-center p-[2px] relative rounded-[12px] shrink-0 size-[48.009px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div aria-hidden="true" className="absolute border-2 border-[#a855f7] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_0px_30px_0px_rgba(168,85,247,0.8)]" />
      <Container42 />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_2px_rgba(168,85,247,0.2)]" />
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col h-full items-center relative" data-name="Container">
      <OverlayBorderShadowOverlayBlur6 />
    </div>
  );
}

function Container44() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#2dd4bf] text-[24px] text-nowrap">
        <p className="leading-[32px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur7() {
  return (
    <div className="backdrop-blur-md backdrop-filter bg-[rgba(0,0,0,0.6)] content-stretch flex items-center justify-center p-[2px] relative rounded-[9999px] shrink-0 size-[56.003px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div aria-hidden="true" className="absolute border-2 border-[#2dd4bf] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_30px_0px_rgba(45,212,191,0.8)]" />
      <Container44 />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_2px_rgba(45,212,191,0.2)]" />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-center relative" data-name="Container">
      <OverlayBorderShadowOverlayBlur7 />
    </div>
  );
}

function Container46() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[36px] text-nowrap">
        <p className="leading-[40px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur8() {
  return (
    <div className="backdrop-blur-md backdrop-filter bg-[rgba(0,0,0,0.6)] content-stretch flex items-center justify-center pb-[19.993px] pt-[19.002px] px-[2px] relative rounded-[9999px] shrink-0 size-[79.998px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div aria-hidden="true" className="absolute border-2 border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_30px_0px_rgba(247,147,26,0.6)]" />
      <Container46 />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_2px_rgba(247,147,26,0.2)]" />
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-center relative" data-name="Container">
      <OverlayBorderShadowOverlayBlur8 />
    </div>
  );
}

function Container48() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#4ade80] text-[24px] text-nowrap">
        <p className="leading-[32px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur9() {
  return (
    <div className="backdrop-blur-md backdrop-filter bg-[rgba(0,0,0,0.6)] content-stretch flex items-center justify-center p-[2px] relative rounded-[8px] shrink-0 size-[56.003px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div aria-hidden="true" className="absolute border-2 border-[#4ade80] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_0px_30px_0px_rgba(74,222,128,0.8)]" />
      <Container48 />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_2px_rgba(74,222,128,0.2)]" />
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex flex-col h-full items-center relative" data-name="Container">
      <OverlayBorderShadowOverlayBlur9 />
    </div>
  );
}

function Container50() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#60a5fa] text-[20px] text-nowrap">
        <p className="leading-[28px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur10() {
  return (
    <div className="backdrop-blur-md backdrop-filter bg-[rgba(0,0,0,0.6)] content-stretch flex items-center justify-center pb-[10.002px] pt-[9.002px] px-[2px] relative rounded-[9999px] shrink-0 size-[48.003px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div aria-hidden="true" className="absolute border-2 border-[#60a5fa] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_30px_0px_rgba(96,165,250,0.8)]" />
      <Container50 />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_2px_rgba(96,165,250,0.2)]" />
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex flex-col items-center relative" data-name="Container">
      <OverlayBorderShadowOverlayBlur10 />
    </div>
  );
}

function Container52() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[14px] text-left text-nowrap" role="link" tabIndex="0">
        <p className="cursor-pointer leading-[14px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function Link2() {
  return (
    <a className="backdrop-blur-[6px] backdrop-filter bg-[rgba(0,0,0,0.6)] cursor-pointer relative rounded-[9999px] self-stretch shrink-0" data-name="Link" href="https://bitcoinnailbarnew1.tiiny.site/#egift">
      <div className="content-stretch flex gap-[8px] h-full items-center overflow-clip pb-[13.5px] pt-[12.5px] px-[33px] relative rounded-[inherit]">
        <Container52 />
        <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[14px] text-left text-nowrap" role="link" tabIndex="0">
          <p className="cursor-pointer leading-[20px]">DESIGN YOUR CARD</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(247,147,26,0.6)] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_25px_0px_rgba(247,147,26,0.3)]" />
    </a>
  );
}

function Container53() {
  return (
    <div className="absolute bottom-[48px] content-stretch flex items-start justify-center left-0 right-0" data-name="Container">
      <Link2 />
    </div>
  );
}

function Container54() {
  return (
    <div className="basis-0 content-stretch flex grow h-[600px] items-center justify-center min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="absolute blur-2xl filter left-[228px] opacity-20 rounded-[9999px] size-[256px] top-[172px]" data-name="Gradient+Blur" style={{ backgroundImage: "linear-gradient(45deg, rgb(247, 147, 26) 0%, rgb(253, 224, 71) 100%)" }} />
      <div className="absolute flex items-center justify-center left-[191.27px] max-w-[403.20013427734375px] right-[95.28px] top-[114.57px]">
        <div className="flex-none h-[234.002px] rotate-[354deg] w-[403.2px]">
          <Container20 />
        </div>
      </div>
      <Container54BackgroundImage additionalClassNames="right-[-45.95px] size-[75.905px] top-[-45.95px]">
        <div className="flex-none rotate-[12deg]">
          <Container22 />
        </div>
      </Container54BackgroundImage>
      <div className="absolute bottom-[34.79px] flex items-center justify-center left-[-45.21px] size-[66.423px]" style={{ "--transform-inner-width": "21.34375", "--transform-inner-height": "32" } as React.CSSProperties}>
        <div className="flex-none rotate-[348deg]">
          <Container24 />
        </div>
      </div>
      <Container39 />
      <div className="absolute bottom-[63.81%] flex items-center justify-center right-[-83.17px] top-[24.47%]">
        <div className="flex-none h-[64px] rotate-[6deg] w-[64.001px]">
          <Container41 />
        </div>
      </div>
      <div className="absolute bottom-[32.59%] flex items-center justify-center right-[-52.47px] top-[57.92%]">
        <div className="flex-none h-[48px] rotate-[348deg] w-[48.009px]">
          <Container43 />
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-[-11.6px] size-[79.2px] top-[-11.6px]" style={{ "--transform-inner-width": "18", "--transform-inner-height": "32" } as React.CSSProperties}>
        <div className="flex-none rotate-[45deg]">
          <Container45 />
        </div>
      </div>
      <Container54BackgroundImage additionalClassNames="bottom-[32.56px] left-[-47.44px] size-[94.882px]">
        <div className="flex-none rotate-[348deg]">
          <Container47 />
        </div>
      </Container54BackgroundImage>
      <div className="absolute bottom-[24.13%] flex items-center justify-center right-[74.79px] top-[64.8%]">
        <div className="flex-none h-[56px] rotate-[12deg] w-[56.003px]">
          <Container49 />
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-[77.62px] size-[52.758px] top-[37.62px]" style={{ "--transform-inner-width": "15", "--transform-inner-height": "28" } as React.CSSProperties}>
        <div className="flex-none rotate-[354deg]">
          <Container51 />
        </div>
      </div>
      <Container53 />
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex gap-[80px] items-center relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Container54 />
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[1536px] px-[16px] py-0 relative shrink-0 w-[1536px]" data-name="Container">
      <Container55 />
    </div>
  );
}

function Section() {
  return (
    <div className="absolute bg-black content-stretch flex items-center justify-center left-0 min-h-[1080px] overflow-clip px-0 py-[240px] right-0 top-[137px]" data-name="Section">
      <div className="absolute bg-[rgba(247,147,26,0.1)] blur-[50px] filter right-0 rounded-[9999px] size-[500px] top-1/2 translate-y-[-50%]" data-name="Overlay+Blur" />
      <div className="absolute bg-[rgba(59,130,246,0.05)] blur-2xl bottom-0 filter left-0 rounded-[9999px] size-[300px]" data-name="Overlay+Blur" />
      <Container56 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex items-center leading-[0] not-italic relative shrink-0 text-[#4ade80] text-[12px] text-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{`$64,231.45 `}</p>
      </div>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0">
        <p className="leading-[12px] text-nowrap"></p>
      </div>
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{` (+2.4%)`}</p>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerBackgroundImageAndText text="" />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-nowrap">
        <p className="leading-[16px]">BTC/USD</p>
      </div>
      <Paragraph />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="content-stretch flex items-center leading-[0] not-italic relative shrink-0 text-[#4ade80] text-[12px] text-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{`$3,456.10 `}</p>
      </div>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0">
        <p className="leading-[12px] text-nowrap"></p>
      </div>
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{` (+1.8%)`}</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerBackgroundImageAndText1 text="" />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap">
        <p className="leading-[16px]">ETH/USD</p>
      </div>
      <Paragraph1 />
    </div>
  );
}

function Container59() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#4ade80] text-[12px] text-nowrap">
        <p className="leading-[12px]"></p>
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex items-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0 text-white">
        <p className="leading-[16px] text-nowrap">{`$1.00 `}</p>
      </div>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0 text-[#6b7280]">
        <p className="leading-[12px] text-nowrap"></p>
      </div>
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0 text-white">
        <p className="leading-[16px] text-nowrap">{` (0.0%)`}</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container59 />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#4ade80] text-[12px] text-nowrap">
        <p className="leading-[16px]">USDT</p>
      </div>
      <Paragraph2 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="content-stretch flex items-center leading-[0] not-italic relative shrink-0 text-[#4ade80] text-[12px] text-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{`$0.85 `}</p>
      </div>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0">
        <p className="leading-[12px] text-nowrap"></p>
      </div>
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{` (+5.2%)`}</p>
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerBackgroundImageAndText2 text="" />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#60a5fa] text-[12px] text-nowrap">
        <p className="leading-[16px]">VLP</p>
      </div>
      <Paragraph3 />
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] text-nowrap">
        <p className="leading-[12px]"></p>
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="content-stretch flex items-center leading-[0] not-italic relative shrink-0 text-[#f87171] text-[12px] text-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{`$145.20 `}</p>
      </div>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0">
        <p className="leading-[12px] text-nowrap"></p>
      </div>
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{` (-0.5%)`}</p>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container62 />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] text-nowrap">
        <p className="leading-[16px]">SOL/USD</p>
      </div>
      <Paragraph4 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="content-stretch flex items-center leading-[0] not-italic relative shrink-0 text-[#4ade80] text-[12px] text-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{`$64,231.45 `}</p>
      </div>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0">
        <p className="leading-[12px] text-nowrap"></p>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerBackgroundImageAndText text="" />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-nowrap">
        <p className="leading-[16px]">BTC/USD</p>
      </div>
      <Paragraph5 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="content-stretch flex items-center leading-[0] not-italic relative shrink-0 text-[#4ade80] text-[12px] text-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{`$3,456.10 `}</p>
      </div>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0">
        <p className="leading-[12px] text-nowrap"></p>
      </div>
    </div>
  );
}

function Container65() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerBackgroundImageAndText1 text="" />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap">
        <p className="leading-[16px]">ETH/USD</p>
      </div>
      <Paragraph6 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="content-stretch flex items-center leading-[0] not-italic relative shrink-0 text-[#4ade80] text-[12px] text-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{`$0.85 `}</p>
      </div>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0">
        <p className="leading-[12px] text-nowrap"></p>
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerBackgroundImageAndText2 text="" />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#60a5fa] text-[12px] text-nowrap">
        <p className="leading-[16px]">VLP</p>
      </div>
      <Paragraph7 />
    </div>
  );
}

function Container67() {
  return (
    <div className="absolute content-stretch flex gap-[40px] items-center left-0 top-[7.5px] w-[1920px]" data-name="Container">
      <Container57 />
      <Container58 />
      <Container60 />
      <Container61 />
      <Container63 />
      <Container64 />
      <Container65 />
      <Container66 />
    </div>
  );
}

function BackgroundHorizontalBorder() {
  return (
    <div className="absolute bg-[#050505] border-[#1f2937] border-[0px_0px_1px] border-solid h-[32px] left-0 overflow-clip right-0 top-0" data-name="Background+HorizontalBorder">
      <Container67 />
    </div>
  );
}

function Container68() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-center text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[12px]"></p>
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-end pb-px pt-0 px-[16px] relative">
        <Container68 />
        <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-white tracking-[1.2px] uppercase">
          <p className="leading-[15px]">{` Group Booking (5+): Complimentary Champagne Bottle`}</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundHorizontalBorder1() {
  return (
    <div className="absolute bg-black left-0 min-h-[32px] right-0 top-[32px]" data-name="Background+HorizontalBorder">
      <div className="content-stretch flex items-center justify-center min-h-[inherit] overflow-clip pb-[9px] pt-[7.5px] px-0 relative rounded-[inherit] w-full">
        <Container69 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1f2937] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <BackgroundHorizontalBorder />
      <BackgroundHorizontalBorder1 />
      <Section />
    </div>
  );
}