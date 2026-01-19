import clsx from "clsx";
import imgImage from "figma:asset/f84ad6d75c01f5865641dba32416e817dee06ff5.png";
import imgQr from "figma:asset/67a09cd28fc49fe9fb982254a0abba67cf925b41.png";

function ContainerBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">{children}</div>
    </div>
  );
}
type MarginBackgroundImageAndTextProps = {
  text: string;
};

function MarginBackgroundImageAndText({ text }: MarginBackgroundImageAndTextProps) {
  return (
    <div className="content-stretch flex flex-col items-start pl-0 pr-[8px] py-0 relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-nowrap">
        <p className="leading-[12px]">{text}</p>
      </div>
    </div>
  );
}
type ButtonBackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ButtonBackgroundImageAndText({ text, additionalClassNames = "" }: ButtonBackgroundImageAndTextProps) {
  return (
    <div className={clsx("bg-[#111827] content-stretch flex flex-col items-center justify-center py-[14px] relative rounded-[8px] shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-[#374151] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[18px] text-center text-nowrap">
        <p className="leading-[28px]">{text}</p>
      </div>
    </div>
  );
}
type LabelBackgroundImageAndTextProps = {
  text: string;
};

function LabelBackgroundImageAndText({ text }: LabelBackgroundImageAndTextProps) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] tracking-[1.2px] uppercase w-full">
        <p className="leading-[16px]">{text}</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[30px] text-nowrap">
        <p className="leading-[36px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorderShadowOverlayBlur() {
  return (
    <div className="backdrop-blur-[2px] backdrop-filter bg-[rgba(0,0,0,0.8)] relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div className="content-stretch flex items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Container />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-text bg-gradient-to-b flex flex-col font-['Georgia:Bold',sans-serif] from-[#fef9c3] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-nowrap to-[#ca8a04] tracking-[0.45px] via-1/2" style={{ WebkitTextFillColor: "transparent" }}>
        <p className="leading-[28px]">BITCOIN NAIL BAR</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.8)] text-nowrap tracking-[2px]">
        <p className="leading-[15px]">LUXURY GIFT CARD</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0" data-name="Container">
      <Heading1 />
      <Container1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-0 top-0" data-name="Container">
      <OverlayBorderShadowOverlayBlur />
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-80 relative" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[24px] text-nowrap">
        <p className="leading-[32px]"></p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[48px] relative shrink-0 w-[398px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container3 />
        <div className="absolute flex h-[30px] items-center justify-center left-[367px] top-px w-[32px]" style={{ "--transform-inner-width": "18", "--transform-inner-height": "32" } as React.CSSProperties}>
          <div className="flex-none rotate-[90deg]">
            <Container4 />
          </div>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="h-[36px] relative rounded-[6px] shrink-0 w-[48px]" data-name="Background+Border+Shadow" style={{ backgroundImage: "linear-gradient(143.13deg, rgb(254, 240, 138) 0%, rgb(250, 204, 21) 50%, rgb(202, 138, 4) 100%)" }}>
      <div className="content-stretch flex items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <div className="h-[16px] relative rounded-[2px] shrink-0 w-[20px]" data-name="Border">
          <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-[2px]" />
        </div>
        <div className="absolute bg-[rgba(0,0,0,0.2)] h-px left-px right-px top-[calc(50%+0.5px)] translate-y-[-50%]" data-name="Horizontal Divider" />
        <div className="absolute bg-[rgba(0,0,0,0.2)] inset-[1px_63.9%_1px_34.02%]" data-name="Vertical Divider" />
        <div className="absolute bg-[rgba(0,0,0,0.2)] inset-[1px_34.02%_1px_63.9%]" data-name="Vertical Divider" />
      </div>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_2px_4px_1px_rgba(0,0,0,0.05)]" />
      <div aria-hidden="true" className="absolute border border-[rgba(253,224,71,0.5)] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[8px] text-nowrap text-right tracking-[0.8px] uppercase">
        <p className="leading-[12px]">Balance</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[14px] text-nowrap text-right">
        <p className="leading-[20px]">$</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-0 pl-0 pr-[2px] pt-[4px] relative shrink-0" data-name="Margin">
      <Container7 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex items-start justify-end relative shrink-0 w-full" data-name="Container">
      <Margin />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[36px] text-nowrap text-right text-white">
        <p className="leading-[40px]">100</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0" data-name="Container">
      <Container6 />
      <Container8 />
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 w-[398px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[4px] py-0 relative w-full">
        <BackgroundBorderShadow />
        <Container9 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Consolas:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-white tracking-[3px] w-full">
        <p className="leading-[28px]">4589 1234 5678 9010</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.75px] pt-0 px-0 relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[7.5px] not-italic relative shrink-0 text-[#d1d5db] text-[6px] text-nowrap tracking-[0.6px] uppercase">
        <p className="mb-0">VALID</p>
        <p>THRU</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[20px]">12/30</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container13 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[150px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-white tracking-[1.2px] uppercase">
        <p className="leading-[16px]">RECIPIENT NAME</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Container">
      <Container14 />
      <Container15 />
    </div>
  );
}

function Heading2Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[4px] pt-0 px-0 relative shrink-0" data-name="Heading 2:margin">
      <div className="flex flex-col font-['Georgia:Bold_Italic',sans-serif] italic justify-center leading-[0] relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[16px]">E-GIFT</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container16 />
      <Heading2Margin />
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-[398px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start relative w-full">
        <Container11 />
        <Container17 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow1() {
  return (
    <div className="absolute inset-0 rounded-[12px]" data-name="Background+Border+Shadow" style={{ backgroundImage: "linear-gradient(149.871deg, rgb(17, 24, 39) 0%, rgb(0, 0, 0) 50%, rgb(31, 41, 55) 100%)" }}>
      <div className="content-stretch flex flex-col items-start justify-between overflow-clip p-[25px] relative rounded-[inherit] size-full">
        <div className="absolute bg-repeat bg-size-[24px_22px] bg-top-left inset-px opacity-30" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
        <Container5 />
        <Container10 />
        <Container18 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(55,65,81,0.5)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#1a1a1a] h-[32px] relative shrink-0 w-full" data-name="Background">
      <div className="absolute inset-0 opacity-30" data-name="Gradient" style={{ backgroundImage: "linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 0.44843%, rgb(34, 34, 34) 0.44843%, rgb(34, 34, 34) 0.89686%)" }} />
    </div>
  );
}

function Margin1() {
  return (
    <div className="h-[48px] relative shrink-0 w-[446px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[16px] px-0 relative size-full">
        <Background />
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute inset-px opacity-20" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start p-[4px] relative size-full">
        <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#bfdbfe] text-[6px] text-nowrap">
          <p className="leading-[6px]">BITCOIN NAIL BAR</p>
        </div>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[8px] pr-0 py-0 relative">
        <div className="flex flex-col font-['Georgia:Italic',sans-serif] italic justify-center leading-[0] relative shrink-0 text-[#9ca3af] text-[12px] text-nowrap">
          <p className="leading-[16px]">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="basis-0 bg-white grow h-[32px] min-h-px min-w-px relative shrink-0" data-name="Background+Border">
      <div className="content-stretch flex items-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Background1 />
        <Container19 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#d1d5db] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container20() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Consolas:Bold_Italic',sans-serif] italic justify-center leading-[0] relative shrink-0 text-[14px] text-black text-nowrap">
        <p className="leading-[20px]">982</p>
      </div>
    </ContainerBackgroundImage>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-white content-stretch flex h-[32px] items-center justify-center p-px relative rounded-[2px] shrink-0 w-[48px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#d1d5db] border-solid inset-0 pointer-events-none rounded-[2px]" />
      <Container20 />
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-0 relative w-full">
          <BackgroundBorder />
          <BackgroundBorder1 />
        </div>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="relative shrink-0 w-[446px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[16px] px-0 relative w-full">
        <Container21 />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex flex-col font-['Segoe_UI:Regular',sans-serif] items-start leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[8px] text-nowrap w-full" data-name="Paragraph">
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[10px] text-nowrap">{`This card is issued by Bitcoin Nail Bar. Redeemable for services & products only. Treat this card like cash. Lost or`}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[10px] text-nowrap">stolen cards may not be replaced.</p>
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center leading-[0] not-italic relative shrink-0 text-[8px] text-nowrap w-full" data-name="Paragraph">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0 text-[#f7931a]">
        <p className="leading-[8px] text-nowrap"></p>
      </div>
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center relative shrink-0 text-white">
        <p className="leading-[12px] text-nowrap">{` 832-799-2748 / 346-802-4906`}</p>
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center leading-[0] not-italic relative shrink-0 text-[8px] text-nowrap w-full" data-name="Paragraph">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0 text-[#f7931a]">
        <p className="leading-[8px] text-nowrap"></p>
      </div>
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center relative shrink-0 text-[#9ca3af]">
        <p className="leading-[12px] text-nowrap">{` 9793 Westheimer Rd, Houston`}</p>
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center leading-[0] not-italic relative shrink-0 text-[8px] text-nowrap w-full" data-name="Paragraph">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center relative shrink-0 text-[#f7931a]">
        <p className="leading-[8px] text-nowrap"></p>
      </div>
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center relative shrink-0 text-[#9ca3af]">
        <p className="leading-[12px] text-nowrap">{` bitcoinnailbar.com`}</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.5px] items-start relative">
        <Paragraph1 />
        <Paragraph2 />
        <Paragraph3 />
      </div>
    </div>
  );
}

function Qr() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="QR">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgQr} />
      </div>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-white relative rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0" data-name="Background+Shadow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start p-[4px] relative">
        <Qr />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex items-end justify-between pb-0 pt-[9px] px-0 relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#1f2937] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <Container22 />
      <BackgroundShadow />
    </div>
  );
}

function Container23() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[446px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between px-[24px] py-[16px] relative size-full">
        <Paragraph />
        <HorizontalBorder />
      </div>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="bg-[#0a0b10] relative rounded-[12px] size-full" data-name="Background+Border">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <Margin1 />
        <Margin2 />
        <Container23 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#1f2937] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container24() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Container">
      <BackgroundBorderShadow1 />
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none h-[260px] rotate-[180deg] scale-y-[-100%] w-[448px]">
          <BackgroundBorder2 />
        </div>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col h-[260px] items-start justify-center max-w-[448px] relative shrink-0 w-full" data-name="Container">
      <Container24 />
    </div>
  );
}

function Margin3() {
  return (
    <div className="h-[260px] relative shrink-0 w-full" data-name="Margin">
      <div className="content-stretch flex flex-col items-start px-[132px] py-0 relative size-full">
        <Container25 />
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="content-stretch flex gap-[4px] items-center leading-[0] relative shrink-0 text-[#6b7280] text-[12px] text-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center not-italic relative shrink-0">
        <p className="leading-[12px] text-nowrap"></p>
      </div>
      <div className="flex flex-col font-['Segoe_UI:Italic',sans-serif] italic justify-center relative shrink-0">
        <p className="leading-[16px] text-nowrap">{` Tap card to flip`}</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start pb-0 pt-[16px] px-0 relative shrink-0" data-name="Margin">
      <Paragraph4 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[16px]">Select Card Design</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-start flex flex-wrap gap-[0px_12px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(31, 41, 55) 0%, rgb(0, 0, 0) 100%)" }}>
        <div aria-hidden="true" className="absolute border-2 border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(209, 213, 219) 100%)" }}>
        <div aria-hidden="true" className="absolute border-2 border-[#9ca3af] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(244, 114, 182) 0%, rgb(225, 29, 72) 100%)" }}>
        <div aria-hidden="true" className="absolute border-2 border-[#f9a8d4] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(49, 46, 129) 100%)" }}>
        <div aria-hidden="true" className="absolute border-2 border-[#60a5fa] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(6, 78, 59) 100%)" }}>
        <div aria-hidden="true" className="absolute border-2 border-[#4ade80] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="bg-black relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
        <div aria-hidden="true" className="absolute border-2 border-[#d4af37] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="bg-black relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
        <div aria-hidden="true" className="absolute border-2 border-[#e5e4e2] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="bg-[#111827] relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
        <div aria-hidden="true" className="absolute border-2 border-[#4b5563] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(249, 230, 170) 0%, rgb(212, 175, 55) 50%, rgb(153, 101, 21) 100%)" }}>
        <div aria-hidden="true" className="absolute border-2 border-[#fef08a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(249, 115, 22) 0%, rgb(194, 65, 12) 100%)" }}>
        <div aria-hidden="true" className="absolute border-2 border-[#fdba74] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Container26 />
      <Container27 />
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start pb-0 pt-[32px] px-0 relative shrink-0 w-full" data-name="Margin">
      <Container28 />
    </div>
  );
}

function Container29() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-center min-h-px min-w-px relative shrink-0" data-name="Container">
      <Margin3 />
      <Margin4 />
      <Margin5 />
    </div>
  );
}

function Container30() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[16px] text-nowrap">
        <p className="leading-[16px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function Container31() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[16px]">The Perfect Gift</p>
      </div>
    </ContainerBackgroundImage>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(247,147,26,0.1)] content-stretch flex gap-[8px] items-center px-[17px] py-[5px] relative rounded-[9999px] shrink-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(247,147,26,0.5)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Container30 />
      <Container31 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[48px] text-white w-full">
        <p className="leading-[48px]">
          <span>{`Send `}</span>
          <span className="bg-clip-text bg-gradient-to-r from-[#fde047] to-[#fde047] via-1/2" style={{ WebkitTextFillColor: "transparent" }}>
            LUXURY
          </span>
          <span>{` Instantly`}</span>
        </p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Light',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[18px] w-full">
        <p className="leading-[28px]">Surprise your loved ones with a digital key to relaxation. Delivered instantly via Email/SMS.</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[18px] w-full">
          <p className="leading-[normal]">{`Enter recipient's name...`}</p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#111827] relative rounded-[12px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center px-[21px] py-[19px] relative w-full">
          <Container33 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#374151] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute bottom-[37.1%] content-stretch flex flex-col items-start right-[20px] top-[37.1%]" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[16px] text-nowrap">
        <p className="leading-[16px]"></p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Input />
      <Container34 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <LabelBackgroundImageAndText text="Recipient Name" />
      <Container35 />
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Label">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[16px]">Gift Message</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex items-center justify-center pl-[4px] pr-0 py-0 relative shrink-0" data-name="Button">
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-center text-nowrap">
        <p className="leading-[16px]">AI Writer</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Label />
      <Button />
    </div>
  );
}

function Container38() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[14px] w-full">
          <p className="leading-[20px]">Write a sweet note...</p>
        </div>
      </div>
    </div>
  );
}

function Textarea() {
  return (
    <div className="bg-[#111827] relative rounded-[12px] shrink-0 w-full" data-name="Textarea">
      <div className="flex flex-row justify-center overflow-auto size-full">
        <div className="content-stretch flex items-start justify-center pb-[53px] pt-[13px] px-[21px] relative w-full">
          <Container38 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#374151] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pb-[6px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <Container37 />
      <Textarea />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(247,147,26,0.1)] content-stretch flex flex-col items-center justify-center pl-[45.68px] pr-[45.7px] py-[14px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-nowrap text-white">
        <p className="leading-[28px]">$100</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <ButtonBackgroundImageAndText text="$50" additionalClassNames="pl-[50.86px] pr-[50.88px]" />
      <Button1 />
      <ButtonBackgroundImageAndText text="$200" additionalClassNames="px-[45.69px]" />
      <ButtonBackgroundImageAndText text="$500" additionalClassNames="px-[45.69px]" />
      <ButtonBackgroundImageAndText text="Custom" additionalClassNames="px-[34.17px]" />
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <LabelBackgroundImageAndText text="Select Amount" />
      <Container40 />
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex items-center justify-center px-[2px] py-[18px] relative rounded-[9999px] shrink-0 w-full" data-name="Button" style={{ backgroundImage: "linear-gradient(46.6865deg, rgb(247, 147, 26) 0%, rgb(255, 171, 46) 100%)" }}>
      <div aria-hidden="true" className="absolute border-2 border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_20px_0px_rgba(247,147,26,0.4)]" />
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-black text-center text-nowrap tracking-[0.9px] uppercase">
        <p className="leading-[28px]">Purchase E-Gift Card</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <MarginBackgroundImageAndText text="" />
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] text-nowrap">
        <p className="leading-[16px]">Secure Payment</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <MarginBackgroundImageAndText text="" />
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] text-nowrap">
        <p className="leading-[16px]">Instant Delivery</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container42 />
      <Container43 />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start pb-0 pt-[16px] px-0 relative shrink-0 w-full" data-name="Container">
      <Container36 />
      <Container39 />
      <Container41 />
      <Button2 />
      <Container44 />
    </div>
  );
}

function Container46() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <OverlayBorder />
      <Heading />
      <Container32 />
      <Container45 />
    </div>
  );
}

function Container47() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[80px] items-start relative w-full">
        <Container29 />
        <Container46 />
      </div>
    </div>
  );
}

export default function Section() {
  return (
    <div className="bg-black relative size-full" data-name="Section">
      <div className="content-stretch flex flex-col items-start pb-[96px] pt-[97px] px-[208px] relative size-full">
        <div className="absolute bg-[rgba(247,147,26,0.2)] blur-3xl filter h-[384px] left-1/4 right-[55%] rounded-[9999px] top-[calc(50%+0.5px)] translate-y-[-50%]" data-name="Overlay+Blur" />
        <Container47 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1f2937] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}