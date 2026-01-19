type ContainerText2Props = {
  text: string;
};

function ContainerText2({ text }: ContainerText2Props) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#60a5fa] text-[12px] text-nowrap">
        <p className="leading-[12px]">{text}</p>
      </div>
    </div>
  );
}
type ContainerText1Props = {
  text: string;
};

function ContainerText1({ text }: ContainerText1Props) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap">
        <p className="leading-[12px]">{text}</p>
      </div>
    </div>
  );
}
type ContainerTextProps = {
  text: string;
};

function ContainerText({ text }: ContainerTextProps) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-nowrap">
        <p className="leading-[12px]">{text}</p>
      </div>
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

function Container() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerText text="" />
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

function Container1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerText1 text="" />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap">
        <p className="leading-[16px]">ETH/USD</p>
      </div>
      <Paragraph1 />
    </div>
  );
}

function Container2() {
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

function Container3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container2 />
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

function Container4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerText2 text="" />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#60a5fa] text-[12px] text-nowrap">
        <p className="leading-[16px]">VLP</p>
      </div>
      <Paragraph3 />
    </div>
  );
}

function Container5() {
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

function Container6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container5 />
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

function Container7() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerText text="" />
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

function Container8() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerText1 text="" />
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

function Container9() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <ContainerText2 text="" />
      <div className="flex flex-col font-['Consolas:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#60a5fa] text-[12px] text-nowrap">
        <p className="leading-[16px]">VLP</p>
      </div>
      <Paragraph7 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex gap-[40px] items-center left-0 top-[7.5px] w-[1920px]" data-name="Container">
      <Container />
      <Container1 />
      <Container3 />
      <Container4 />
      <Container6 />
      <Container7 />
      <Container8 />
      <Container9 />
    </div>
  );
}

function BackgroundHorizontalBorder() {
  return (
    <div className="absolute bg-[#050505] border-[#1f2937] border-[0px_0px_1px] border-solid h-[32px] left-0 overflow-clip right-0 top-0" data-name="Background+HorizontalBorder">
      <Container10 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-center text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[12px]"></p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-end pb-px pt-0 px-[16px] relative">
        <Container11 />
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
        <Container12 />
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
    </div>
  );
}