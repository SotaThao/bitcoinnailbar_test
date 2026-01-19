import clsx from "clsx";

function BackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="overflow-clip rounded-[inherit] size-full">
      <div className="content-stretch flex flex-col items-start p-[25px] relative size-full">{children}</div>
    </div>
  );
}
type ContainerBackgroundImage2Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage2({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage2Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[24px] px-0 relative w-full">{children}</div>
    </div>
  );
}
type ContainerBackgroundImage1Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage1({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage1Props>) {
  return (
    <div className={clsx("basis-0 grow min-h-px min-w-px relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}

function ContainerBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">{children}</div>
    </div>
  );
}
type ItemBackgroundImageAndText3Props = {
  text: string;
};

function ItemBackgroundImageAndText3({ text }: ItemBackgroundImageAndText3Props) {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <MarginBackgroundImageAndText3 text="" />
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap">
        <p className="leading-[16px]">{text}</p>
      </div>
    </div>
  );
}
type MarginBackgroundImageAndText3Props = {
  text: string;
};

function MarginBackgroundImageAndText3({ text }: MarginBackgroundImageAndText3Props) {
  return (
    <div className="content-stretch flex flex-col items-start pl-0 pr-[8px] py-0 relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-white">
        <p className="leading-[12px]">{text}</p>
      </div>
    </div>
  );
}
type ItemBackgroundImageAndText2Props = {
  text: string;
};

function ItemBackgroundImageAndText2({ text }: ItemBackgroundImageAndText2Props) {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <MarginBackgroundImageAndText2 text="" />
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap">
        <p className="leading-[16px]">{text}</p>
      </div>
    </div>
  );
}
type MarginBackgroundImageAndText2Props = {
  text: string;
};

function MarginBackgroundImageAndText2({ text }: MarginBackgroundImageAndText2Props) {
  return (
    <div className="content-stretch flex flex-col items-start pl-0 pr-[8px] py-0 relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-nowrap">
        <p className="leading-[12px]">{text}</p>
      </div>
    </div>
  );
}
type BackgroundShadowBackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function BackgroundShadowBackgroundImageAndText({ text, additionalClassNames = "" }: BackgroundShadowBackgroundImageAndTextProps) {
  return (
    <div className={clsx("absolute bg-[#dc2626] rounded-br-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip px-[12px] py-[4px] relative rounded-[inherit]">
        <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-nowrap text-white">
          <p className="leading-[15px]">{text}</p>
        </div>
      </div>
    </div>
  );
}
type ItemBackgroundImageAndText1Props = {
  text: string;
};

function ItemBackgroundImageAndText1({ text }: ItemBackgroundImageAndText1Props) {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <MarginBackgroundImageAndText1 text="" />
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap">
        <p className="leading-[16px]">{text}</p>
      </div>
    </div>
  );
}
type MarginBackgroundImageAndText1Props = {
  text: string;
};

function MarginBackgroundImageAndText1({ text }: MarginBackgroundImageAndText1Props) {
  return (
    <div className="content-stretch flex flex-col items-start pl-0 pr-[8px] py-0 relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#eab308] text-[12px] text-nowrap">
        <p className="leading-[12px]">{text}</p>
      </div>
    </div>
  );
}
type ContainerBackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ContainerBackgroundImageAndText({ text, additionalClassNames = "" }: ContainerBackgroundImageAndTextProps) {
  return (
    <div className={clsx("absolute content-stretch flex flex-col items-center left-0 right-0", additionalClassNames)}>
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] text-center text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[16px]">
          <span>{`Valued at: `}</span>
          <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid line-through text-[#6b7280]">{text}</span>
        </p>
      </div>
    </div>
  );
}
type ItemBackgroundImageAndTextProps = {
  text: string;
};

function ItemBackgroundImageAndText({ text }: ItemBackgroundImageAndTextProps) {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <MarginBackgroundImageAndText text="" />
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap">
        <p className="leading-[16px]">{text}</p>
      </div>
    </div>
  );
}
type BackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function BackgroundImageAndText({ text, additionalClassNames = "" }: BackgroundImageAndTextProps) {
  return (
    <div className={clsx("content-stretch flex flex-col items-start relative shrink-0", additionalClassNames)}>
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-white">
        <p className="leading-[16px]">{text}</p>
      </div>
    </div>
  );
}
type MarginBackgroundImageAndTextProps = {
  text: string;
};

function MarginBackgroundImageAndText({ text }: MarginBackgroundImageAndTextProps) {
  return (
    <div className="content-stretch flex flex-col items-start pl-0 pr-[8px] py-0 relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] text-nowrap">
        <p className="leading-[12px]">{text}</p>
      </div>
    </div>
  );
}
type ParagraphBackgroundImageProps = {
  text: string;
  text1: string;
  additionalClassNames?: string;
};

function ParagraphBackgroundImage({ text, text1, additionalClassNames = "" }: ParagraphBackgroundImageProps) {
  return (
    <div className={clsx("absolute content-stretch flex gap-[4px] items-baseline justify-center leading-[0] left-0 not-italic right-0 text-center text-nowrap top-[129px]", additionalClassNames)}>
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center relative shrink-0 text-[36px] text-white">
        <p className="leading-[40px] text-nowrap">{text}</p>
      </div>
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center relative shrink-0 text-[#9ca3af] text-[14px]">
        <p className="leading-[20px] text-nowrap">{text1}</p>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Playfair_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[16px] text-center text-nowrap tracking-[1.6px] uppercase">
        <p className="leading-[24px]">YOUR LOOK</p>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[16px] pt-0 px-0 relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[48px] text-center text-nowrap text-white">
        <p className="leading-[48px]">Annual Membership Packages</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <Heading />
      <div className="bg-[#f7931a] h-[4px] rounded-[9999px] shrink-0 w-[96px]" data-name="Background" />
    </div>
  );
}

function Container1() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[20px] text-center text-nowrap">
        <p className="leading-[28px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="absolute bg-black content-stretch flex items-center justify-center left-1/2 p-[2px] rounded-[9999px] size-[56px] top-0 translate-x-[-50%]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border-2 border-[#9ca3af] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_15px_0px_rgba(156,163,175,0.5)]" />
      <Container1 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 right-0 top-[72px]" data-name="Heading 3">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[24px] text-center text-nowrap tracking-[2.4px]">
        <p className="leading-[32px]">SILVER</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 right-0 top-[173px]" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[16px]">Entry Level</p>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Item">
      <MarginBackgroundImageAndText text="" />
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap">
        <p className="leading-[16px]">Access to</p>
      </div>
      <BackgroundImageAndText text="Member Pricing" additionalClassNames="pl-[4px] pr-0 py-0" />
    </div>
  );
}

function List() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 pl-[8px] pr-0 py-0 right-0 top-[213px]" data-name="List">
      <Item />
      <ItemBackgroundImageAndText text="10% Cashback in Bitcoin" />
      <ItemBackgroundImageAndText text="Free Gel Removal" />
      <ItemBackgroundImageAndText text="Birthday Gift ($25)" />
    </div>
  );
}

function Container3() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="w-[308px]">
      <BackgroundBorderShadow />
      <Heading1 />
      <div className="absolute bg-gradient-to-r from-[rgba(107,114,128,0)] h-px left-0 right-0 to-[rgba(107,114,128,0)] top-[112px] via-1/2" data-name="Horizontal Divider" />
      <ParagraphBackgroundImage text="$99" text1="/year" additionalClassNames="text-shadow-[0px_0px_10px_rgba(156,163,175,0.5)]" />
      <Container2 />
      <List />
    </ContainerBackgroundImage1>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0)] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div className="content-stretch flex items-center justify-center overflow-clip px-px py-[13px] relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[14px] text-center text-nowrap">
          <p className="leading-[20px]">JOIN SILVER</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#6b7280] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container4() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="w-[308px]">
      <Button />
    </ContainerBackgroundImage2>
  );
}

function BackgroundBorder() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[16px] shrink-0 w-full" data-name="Background+Border" style={{ backgroundImage: "linear-gradient(127.297deg, rgb(17, 24, 39) 0%, rgb(0, 0, 0) 100%)" }}>
      <BackgroundImage>
        <div className="absolute opacity-20 right-px size-[96px] top-px" data-name="Gradient" style={{ backgroundImage: "linear-gradient(225deg, rgb(107, 114, 128) 0%, rgba(107, 114, 128, 0) 100%)" }} />
        <Container3 />
        <Container4 />
      </BackgroundImage>
      <div aria-hidden="true" className="absolute border border-[rgba(107,114,128,0.5)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col inset-[0_1146px_0_0] items-start justify-center" data-name="Container">
      <div className="absolute bg-gradient-to-r blur-sm filter from-[#6b7280] inset-0 opacity-25 rounded-[16px] to-[#d1d5db]" data-name="Gradient+Blur" />
      <BackgroundBorder />
    </div>
  );
}

function Container6() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#eab308] text-[20px] text-center text-nowrap">
        <p className="leading-[28px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function BackgroundBorderShadow1() {
  return (
    <div className="absolute bg-black content-stretch flex items-center justify-center left-1/2 p-[2px] rounded-[9999px] size-[56px] top-0 translate-x-[-50%]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border-2 border-[#eab308] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_15px_0px_rgba(234,179,8,0.5)]" />
      <Container6 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 right-0 top-[72px]" data-name="Heading 3">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#facc15] text-[24px] text-center text-nowrap tracking-[2.4px]">
        <p className="leading-[32px]">GOLD</p>
      </div>
    </div>
  );
}

function List1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 pl-[8px] pr-0 py-0 right-0 top-[213px]" data-name="List">
      <ItemBackgroundImageAndText1 text="$50 Monthly Credit" />
      <ItemBackgroundImageAndText1 text="10% Cashback on Services" />
      <ItemBackgroundImageAndText1 text="Priority Booking" />
      <ItemBackgroundImageAndText1 text="25% Discount on Birthday" />
    </div>
  );
}

function Container7() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="w-[308px]">
      <BackgroundBorderShadow1 />
      <Heading3 />
      <div className="absolute bg-gradient-to-r from-[rgba(234,179,8,0)] h-px left-0 right-0 to-[rgba(234,179,8,0)] top-[112px] via-1/2" data-name="Horizontal Divider" />
      <ParagraphBackgroundImage text="$479" text1="/year" additionalClassNames="text-shadow-[0px_0px_10px_rgba(234,179,8,0.5)]" />
      <ContainerBackgroundImageAndText text="$600" additionalClassNames="top-[173px]" />
      <List1 />
    </ContainerBackgroundImage1>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Button" style={{ backgroundImage: "linear-gradient(47.1163deg, rgb(247, 147, 26) 0%, rgb(255, 171, 46) 100%)" }}>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[2px] py-[14px] relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black text-center text-nowrap">
          <p className="leading-[20px]">JOIN GOLD</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container8() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="w-[308px]">
      <Button1 />
    </ContainerBackgroundImage2>
  );
}

function BackgroundBorder1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[16px] shrink-0 w-full" data-name="Background+Border" style={{ backgroundImage: "linear-gradient(127.297deg, rgb(31, 41, 55) 0%, rgb(0, 0, 0) 100%)" }}>
      <BackgroundImage>
        <div className="absolute opacity-20 right-px size-[96px] top-px" data-name="Gradient" style={{ backgroundImage: "linear-gradient(225deg, rgb(234, 179, 8) 0%, rgba(234, 179, 8, 0) 100%)" }} />
        <Container7 />
        <Container8 />
        <BackgroundShadowBackgroundImageAndText text="SAVE 20%" additionalClassNames="left-px top-px" />
      </BackgroundImage>
      <div aria-hidden="true" className="absolute border border-[rgba(234,179,8,0.5)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col inset-[0_764px_0_382px] items-start justify-center" data-name="Container">
      <div className="absolute bg-gradient-to-r blur-sm filter from-[#ca8a04] inset-0 opacity-25 rounded-[16px] to-[#facc15]" data-name="Gradient+Blur" />
      <BackgroundBorder1 />
    </div>
  );
}

function Container10() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[20px] text-center text-nowrap">
        <p className="leading-[28px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function BackgroundBorderShadow2() {
  return (
    <div className="absolute bg-black content-stretch flex items-center justify-center left-1/2 p-[2px] rounded-[9999px] size-[56px] top-0 translate-x-[-50%]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border-2 border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_15px_0px_rgba(247,147,26,0.5)]" />
      <Container10 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 right-0 top-[72px]" data-name="Heading 3">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[24px] text-center text-nowrap tracking-[2.4px]">
        <p className="leading-[32px]">VIP CRYPTO</p>
      </div>
    </div>
  );
}

function List2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 pl-[8px] pr-0 py-0 right-0 top-[213px]" data-name="List">
      <ItemBackgroundImageAndText2 text="$80 Monthly Credit" />
      <ItemBackgroundImageAndText2 text="20% Cashback (Best Value)" />
      <ItemBackgroundImageAndText2 text="All Inclusive Perks" />
      <ItemBackgroundImageAndText2 text="Crypto Payment Bonus" />
    </div>
  );
}

function Container11() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="w-[308px]">
      <BackgroundBorderShadow2 />
      <Heading4 />
      <div className="absolute bg-gradient-to-r from-[rgba(247,147,26,0)] h-px left-0 right-0 to-[rgba(247,147,26,0)] top-[112px] via-1/2" data-name="Horizontal Divider" />
      <ParagraphBackgroundImage text="$624" text1="/year" additionalClassNames="text-shadow-[0px_0px_10px_rgba(247,147,26,0.5)]" />
      <ContainerBackgroundImageAndText text="$960" additionalClassNames="top-[173px]" />
      <List2 />
    </ContainerBackgroundImage1>
  );
}

function Button2() {
  return (
    <div className="bg-[rgba(255,255,255,0)] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div className="content-stretch flex items-center justify-center overflow-clip px-px py-[13px] relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[14px] text-center text-nowrap">
          <p className="leading-[20px]">JOIN VIP</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container12() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="w-[308px]">
      <Button2 />
    </ContainerBackgroundImage2>
  );
}

function BackgroundBorder2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[16px] shrink-0 w-full" data-name="Background+Border" style={{ backgroundImage: "linear-gradient(127.297deg, rgb(0, 0, 0) 0%, rgb(17, 24, 39) 100%)" }}>
      <BackgroundImage>
        <div className="absolute opacity-20 right-px size-[96px] top-px" data-name="Gradient" style={{ backgroundImage: "linear-gradient(225deg, rgb(247, 147, 26) 0%, rgba(247, 147, 26, 0) 100%)" }} />
        <Container11 />
        <Container12 />
        <BackgroundShadowBackgroundImageAndText text="SAVE 35%" additionalClassNames="left-px top-px" />
      </BackgroundImage>
      <div aria-hidden="true" className="absolute border border-[rgba(247,147,26,0.5)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex flex-col inset-[0_0_0_1146px] items-start justify-center" data-name="Container">
      <div className="absolute bg-gradient-to-r blur-sm filter from-[#f7931a] inset-0 opacity-25 rounded-[16px] to-[#ef4444]" data-name="Gradient+Blur" />
      <BackgroundBorder2 />
    </div>
  );
}

function Container14() {
  return (
    <ContainerBackgroundImage>
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-nowrap text-white">
        <p className="leading-[32px]"></p>
      </div>
    </ContainerBackgroundImage>
  );
}

function BackgroundBorderShadow3() {
  return (
    <div className="absolute bg-black content-stretch flex items-center justify-center left-1/2 p-[2px] rounded-[9999px] size-[64px] top-0 translate-x-[-50%]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_20px_0px_rgba(255,255,255,0.4)]" />
      <Container14 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 right-0 top-[80px]" data-name="Heading 3">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[30px] text-center text-nowrap text-white tracking-[3px]">
        <p className="leading-[36px]">PLATINUM</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-baseline justify-center leading-[0] left-0 not-italic right-0 text-center text-nowrap text-shadow-[0px_0px_15px_rgba(255,255,255,0.6)] top-[141px]" data-name="Paragraph">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center relative shrink-0 text-[48px] text-white">
        <p className="leading-[48px] text-nowrap">$539</p>
      </div>
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center relative shrink-0 text-[#9ca3af] text-[14px]">
        <p className="leading-[20px] text-nowrap">/year</p>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Item">
      <MarginBackgroundImageAndText3 text="" />
      <BackgroundImageAndText text="$60 Monthly Credit" />
    </div>
  );
}

function List3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 pl-[8px] pr-0 py-0 right-0 top-[234px]" data-name="List">
      <Item1 />
      <ItemBackgroundImageAndText3 text="15% Cashback on Services" />
      <ItemBackgroundImageAndText3 text="VIP Lounge Access" />
      <ItemBackgroundImageAndText3 text="Premium Drinks Included" />
    </div>
  );
}

function Container15() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="w-[306px]">
      <BackgroundBorderShadow3 />
      <Heading5 />
      <div className="absolute bg-gradient-to-r from-[rgba(255,255,255,0)] h-px left-0 right-0 to-[rgba(255,255,255,0)] top-[124px] via-1/2" data-name="Horizontal Divider" />
      <Paragraph />
      <ContainerBackgroundImageAndText text="$720" additionalClassNames="top-[194px]" />
      <List3 />
    </ContainerBackgroundImage1>
  );
}

function Button3() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center px-0 py-[12px] relative rounded-[8px] shadow-[0px_0px_20px_0px_rgba(255,255,255,0.4)] shrink-0 w-full" data-name="Button">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-black text-center text-nowrap">
        <p className="leading-[24px]">JOIN PLATINUM</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="w-[306px]">
      <Button3 />
    </ContainerBackgroundImage2>
  );
}

function BackgroundShadow() {
  return (
    <div className="absolute bg-white right-[1.37px] rounded-bl-[8px] shadow-[0px_10px_20px_0px_rgba(0,0,0,0.5)] top-[2px]" data-name="Background+Shadow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[12px] py-[4px] relative">
        <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-black text-nowrap">
          <p className="leading-[15px]">MOST POPULAR</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorderShadow4() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[16px] shrink-0 w-full" data-name="Background+Border+Shadow" style={{ backgroundImage: "linear-gradient(127.297deg, rgb(17, 24, 39) 0%, rgb(31, 41, 55) 100%)" }}>
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[26px] relative size-full">
          <div className="absolute left-[2px] opacity-10 size-[128px] top-[2px]" data-name="Gradient" style={{ backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)" }} />
          <Container15 />
          <Container16 />
          <BackgroundShadow />
          <BackgroundShadowBackgroundImageAndText text="SAVE 25%" additionalClassNames="left-[2px] top-[2px]" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[rgba(255,255,255,0.7)] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col inset-[-16px_382px_16px_764px] items-start justify-center" data-name="Container">
      <div className="absolute bg-gradient-to-r blur-sm filter from-[#d1d5db] inset-0 opacity-25 rounded-[16px] to-white" data-name="Gradient+Blur" />
      <BackgroundBorderShadow4 />
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[470px] relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <Container9 />
      <Container13 />
      <Container17 />
    </div>
  );
}

function Container19() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[64px] items-start max-w-[inherit] px-[16px] py-0 relative w-full">
        <Container />
        <Container18 />
      </div>
    </div>
  );
}

export default function Section() {
  return (
    <div className="bg-[#111827] relative size-full" data-name="Section">
      <div className="content-stretch flex flex-col items-start pb-[136px] pt-[97px] px-[192px] relative size-full">
        <Container19 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1f2937] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}