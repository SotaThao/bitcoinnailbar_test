import clsx from "clsx";
import imgImage from "figma:asset/f84ad6d75c01f5865641dba32416e817dee06ff5.png";
type ButtonBackgroundImageProps = {
  additionalClassNames?: string;
  text: string;
};

function ButtonBackgroundImage({ children, additionalClassNames = "", text }: React.PropsWithChildren<ButtonBackgroundImageProps>) {
  return (
    <div className={clsx("absolute backdrop-blur-[6px] backdrop-filter bg-[rgba(0,0,0,0.5)] rounded-[9999px] size-[40px] top-1/2 translate-y-[-50%]", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <div className="relative shrink-0">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
            <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-nowrap text-white">
              <p className="leading-[16px]">{text}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContainerBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow max-w-[1536px] min-h-px min-w-px relative shrink-0">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] px-[64px] py-0 relative w-full">{children}</div>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Playfair_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[16px] text-center text-nowrap tracking-[1.6px] uppercase">
        <p className="leading-[24px]">Special Offers</p>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[8px] pt-0 px-0 relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[36px] text-center text-nowrap text-white">
        <p className="leading-[40px]">Current Promotions</p>
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

function OverlayBorder() {
  return (
    <div className="absolute bg-[rgba(247,147,26,0.2)] content-stretch flex items-start left-0 px-[13px] py-[5px] rounded-[4px] top-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[12px] text-nowrap tracking-[1.2px]">
        <p className="leading-[16px]">PAYMENT 4.0</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[42px]" data-name="Heading 3">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[60px] not-italic relative shrink-0 text-[60px] text-nowrap text-white">
        <p className="mb-0">PAY WITH</p>
        <p className="text-[#f7931a]">CRYPTO</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[60px] leading-[0] left-0 not-italic right-0 top-[170px]" data-name="Paragraph">
      <div className="absolute flex flex-col font-['Segoe_UI:Regular',sans-serif] h-[28px] justify-center left-0 text-[#d1d5db] text-[20px] top-[17.5px] translate-y-[-50%] w-[128.989px]">
        <p className="leading-[28px]">{`Get an instant `}</p>
      </div>
      <div className="absolute flex flex-col font-['Segoe_UI:Bold',sans-serif] h-[32px] justify-center left-[128.59px] text-[24px] text-white top-[16px] translate-y-[-50%] w-[98.552px]">
        <p className="leading-[32px]">10% OFF</p>
      </div>
      <div className="absolute flex flex-col font-['Segoe_UI:Regular',sans-serif] h-[28px] justify-center left-[226.8px] text-[#d1d5db] text-[20px] top-[17.5px] translate-y-[-50%] w-[319.134px]">
        <p className="leading-[28px]">{` when you pay with Bitcoin, USDT or`}</p>
      </div>
      <div className="absolute flex flex-col font-['Segoe_UI:Regular',sans-serif] h-[28px] justify-center left-0 text-[#d1d5db] text-[20px] top-[45.5px] translate-y-[-50%] w-[139.998px]">
        <p className="leading-[28px]">VLinkPay wallet.</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-black text-left text-nowrap" role="link" tabIndex="0">
          <p className="cursor-pointer leading-[16px]"></p>
        </div>
      </div>
    </div>
  );
}

function Link() {
  return (
    <a className="absolute cursor-pointer left-0 rounded-[9999px] top-[254px]" data-name="Link" href="https://bitcoinnailbarnew1.tiiny.site/#contact" style={{ backgroundImage: "linear-gradient(46.5776deg, rgb(247, 147, 26) 0%, rgb(255, 171, 46) 100%)" }}>
      <div className="content-stretch flex gap-[8px] items-center overflow-clip px-[34px] py-[14px] relative rounded-[inherit]">
        <Container1 />
        <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-black text-left text-nowrap" role="link" tabIndex="0">
          <p className="cursor-pointer leading-[24px]">PAY NOW</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#f7931a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </a>
  );
}

function Container2() {
  return (
    <div className="h-[306px] relative shrink-0 w-[574.67px]" data-name="Container">
      <OverlayBorder />
      <Heading1 />
      <Paragraph />
      <Link />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[287.33px]" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic opacity-80 relative shrink-0 text-[#f7931a] text-[150px] text-center text-nowrap">
        <p className="leading-[150px]"></p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <ContainerBackgroundImage>
      <Container2 />
      <Container3 />
    </ContainerBackgroundImage>
  );
}

function Background() {
  return (
    <div className="absolute bg-gradient-to-r content-stretch flex from-[#111827] inset-0 items-center justify-center opacity-0 to-black" data-name="Background">
      <div className="absolute bg-repeat bg-size-[24px_22px] bg-top-left inset-0 opacity-20" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
      <div className="absolute bg-[rgba(247,147,26,0.2)] blur-2xl filter right-0 rounded-[9999px] size-[256px] top-0" data-name="Overlay+Blur" />
      <Container4 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[34px] top-[34px]" data-name="Heading 3">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[60px] text-center text-nowrap text-white">
        <p className="leading-[60px]">GOLDEN HOUR</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[34px] px-[121.77px] py-0 top-[130px]" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-nowrap text-white">
        <p className="leading-[32px]">MONDAY - THURSDAY</p>
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute content-stretch flex items-center justify-center leading-[0] left-[34px] not-italic px-[160.7px] py-0 text-[18px] text-[rgba(255,255,255,0.9)] text-center text-nowrap top-[170px]" data-name="Paragraph">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Regular',sans-serif] justify-center relative shrink-0">
        <p className="leading-[18px]"></p>
      </div>
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center relative shrink-0">
        <p className="leading-[28px]">{` 12:00 PM - 3:30 PM`}</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[34px] pl-[151.53px] pr-[151.54px] py-0 top-[222px]" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[48px] text-center text-nowrap text-white">
        <p className="leading-[48px]">15% OFF</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="absolute bg-white content-stretch flex items-start justify-center left-[calc(50%+0.35px)] overflow-clip px-[32px] py-[12px] rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] top-[294px] translate-x-[-50%]" data-name="Link">
      <a className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#996515] text-[16px] text-center text-nowrap" href="https://bitcoinnailbarnew1.tiiny.site/#contact">
        <p className="cursor-pointer leading-[24px]">BOOK APPOINTMENT</p>
      </a>
    </div>
  );
}

function OverlayBorderOverlayBlur() {
  return (
    <div className="backdrop-blur-[2px] backdrop-filter bg-[rgba(255,255,255,0.1)] h-[376px] relative rounded-[12px] shrink-0 w-[567.48px]" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Heading3 />
      <div className="absolute bg-white h-[4px] left-[calc(50%-0.01px)] top-[110px] translate-x-[-50%] w-[96px]" data-name="Background" />
      <Container5 />
      <Paragraph1 />
      <Container6 />
      <Link1 />
    </div>
  );
}

function Container7() {
  return (
    <div className="basis-0 grow max-w-[1536px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="flex flex-col items-center max-w-[inherit] size-full">
        <div className="content-stretch flex flex-col items-center max-w-[inherit] px-[64px] py-0 relative w-full">
          <OverlayBorderOverlayBlur />
        </div>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute content-stretch flex inset-0 items-center justify-center opacity-0" data-name="Background" style={{ backgroundImage: "linear-gradient(158.625deg, rgb(153, 101, 21) 0%, rgb(212, 175, 55) 50%, rgb(249, 230, 170) 100%)" }}>
      <div className="absolute bg-[rgba(0,0,0,0.1)] inset-0" data-name="Overlay" />
      <Container7 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[287.33px]" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic opacity-80 relative shrink-0 text-[#60a5fa] text-[120px] text-center text-nowrap">
        <p className="leading-[120px]"></p>
      </div>
    </div>
  );
}

function OverlayBorder1() {
  return (
    <div className="absolute bg-[rgba(59,130,246,0.2)] content-stretch flex items-start justify-end left-[441.81px] px-[13px] py-[5px] rounded-[4px] top-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[#3b82f6] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#93c5fd] text-[12px] text-nowrap text-right tracking-[1.2px]">
        <p className="leading-[16px]">MEMBERS ONLY</p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute content-stretch flex flex-col items-end left-0 right-0 top-[42px]" data-name="Heading 3">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[60px] text-nowrap text-right text-white">
        <p className="leading-[60px]">
          <span>{`VIP `}</span>
          <span className="text-[#60a5fa]">ROYALTY</span>
        </p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col items-end left-0 right-0 top-[110px]" data-name="Container">
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[28px] not-italic relative shrink-0 text-[#d1d5db] text-[20px] text-nowrap text-right">
        <p className="mb-0">
          <span>{`Join our exclusive club today. Receive `}</span>
          <span className="font-['Segoe_UI:Bold',sans-serif] not-italic text-white">$50 CREDIT</span>
          <span>{` instantly upon`}</span>
        </p>
        <p>registration.</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end relative">
        <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#60a5fa] text-[16px] text-nowrap text-right" role="link" tabIndex="0">
          <p className="cursor-pointer leading-[16px]"></p>
        </div>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <a className="absolute bg-[rgba(255,255,255,0)] content-stretch cursor-pointer flex gap-[8px] items-center px-[34px] py-[14px] right-[-2.94px] rounded-[9999px] top-[190px]" data-name="Link" href="https://bitcoinnailbarnew1.tiiny.site/#membership">
      <div aria-hidden="true" className="absolute border-2 border-[#60a5fa] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_20px_0px_rgba(96,165,250,0.4)]" />
      <Container10 />
      <div className="flex flex-col font-['Segoe_UI:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#60a5fa] text-[16px] text-nowrap text-right" role="link" tabIndex="0">
        <p className="cursor-pointer leading-[24px]">JOIN CLUB</p>
      </div>
    </a>
  );
}

function Container11() {
  return (
    <div className="h-[242px] relative shrink-0 w-[574.67px]" data-name="Container">
      <OverlayBorder1 />
      <Heading4 />
      <Container9 />
      <Link2 />
    </div>
  );
}

function Container12() {
  return (
    <ContainerBackgroundImage>
      <Container8 />
      <Container11 />
    </ContainerBackgroundImage>
  );
}

function Background2() {
  return (
    <div className="absolute bg-gradient-to-r content-stretch flex from-[#1e3a8a] inset-0 items-center justify-center to-black" data-name="Background">
      <div className="absolute bg-[rgba(59,130,246,0.2)] blur-2xl bottom-0 filter left-0 rounded-[9999px] size-[256px]" data-name="Overlay+Blur" />
      <Container12 />
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[400px] relative shrink-0 w-[1022px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Background />
        <Background1 />
        <Background2 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute bottom-[17px] h-[12px] left-[47.46%] right-[47.46%]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <div className="absolute bg-[#4b5563] left-0 rounded-[9999px] size-[12px] top-0" data-name="Button" />
        <div className="absolute bg-[#4b5563] left-[20px] rounded-[9999px] size-[12px] top-0" data-name="Button" />
        <div className="absolute bg-white left-[38.5px] rounded-[9999px] size-[15px] top-[-1.5px]" data-name="Button" />
      </div>
    </div>
  );
}

function OverlayBorderShadow() {
  return (
    <div className="bg-[rgba(255,255,255,0)] max-w-[1024px] relative rounded-[16px] shrink-0 w-[1024px]" data-name="Overlay+Border+Shadow">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] overflow-clip p-px relative rounded-[inherit] w-full">
        <Container13 />
        <ButtonBackgroundImage additionalClassNames="left-[17px]" text="" />
        <ButtonBackgroundImage additionalClassNames="right-[17px]" text="" />
        <Container14 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#1f2937] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

export default function Container15() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-center px-[16px] py-0 relative size-full" data-name="Container">
      <Container />
      <OverlayBorderShadow />
    </div>
  );
}