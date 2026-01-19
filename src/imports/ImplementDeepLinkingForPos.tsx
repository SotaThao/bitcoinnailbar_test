import svgPaths from "./svg-eano1ysaus";
import imgImageBitcoinLogo from "figma:asset/8504cf526757125a74c4095fde998e4033127268.png";

function Container() {
  return <div className="absolute bg-[rgba(247,147,26,0.1)] blur-[100px] left-[-161.39px] rounded-[33554400px] size-[500px] top-[-94.39px]" data-name="Container" />;
}

function Container1() {
  return <div className="absolute bg-[rgba(255,248,225,0.2)] blur-[100px] left-[1275.39px] rounded-[33554400px] size-[500px] top-[538.39px]" data-name="Container" />;
}

function ImageBitcoinLogo() {
  return (
    <div className="relative shadow-[0px_0px_20px_0px_rgba(247,147,26,0.6)] shrink-0 size-[48px]" data-name="Image (Bitcoin Logo)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-contain pointer-events-none size-full" src={imgImageBitcoinLogo} />
    </div>
  );
}

function Text() {
  return (
    <div className="h-[32px] relative shadow-[0px_0px_16px_0px_rgba(247,147,26,0.5)] shrink-0 w-[104.594px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Georgia:Bold',sans-serif] leading-[32px] left-0 not-italic text-[#f7931a] text-[24px] top-0 tracking-[-1.2px] whitespace-pre">BITCOIN</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Georgia:Bold',sans-serif] leading-[32px] left-0 not-italic text-[#1a1a1a] text-[24px] top-0 tracking-[-1.2px] whitespace-pre">NAIL BAR</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-start relative size-full">
        <Text />
        <Text1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[48px] relative shrink-0 w-[284.109px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <ImageBitcoinLogo />
        <Container2 />
      </div>
    </div>
  );
}

function LogIn() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="log-in">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="log-in">
          <path d={svgPaths.p19316a80} id="Vector" stroke="var(--stroke-0, #212B36)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[9px] items-center relative">
        <LogIn />
        <p className="font-['Arial:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#212b36] text-[12px] text-center whitespace-pre">Login</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex h-[96px] items-center justify-between left-0 px-[24px] py-0 top-0 w-[1614px]" data-name="Container">
      <Container3 />
      <Frame />
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[128px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[128px] left-[144.88px] not-italic text-[#1a1a1a] text-[128px] text-center top-[-11px] tracking-[-6.4px] translate-x-[-50%] whitespace-pre">09:47</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex h-[32px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arial:Regular',sans-serif] leading-[32px] not-italic relative shrink-0 text-[#737373] text-[24px] text-center tracking-[2.4px] uppercase whitespace-pre">Thursday, January 15</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[176px] relative shrink-0 w-[289.906px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative size-full">
        <Heading />
        <Paragraph />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[130px] size-[20px] top-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p1beb9580} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p32ab0300} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#f7931a] h-[56px] left-0 rounded-[33554400px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] top-[-21px] w-[384px]" data-name="Button">
      <Icon />
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[28px] left-[210.42px] not-italic text-[18px] text-center text-white top-[13px] translate-x-[-50%] whitespace-pre">Self-Checkin</p>
    </div>
  );
}

function Link() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Link">
      <Button />
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[120px] relative shrink-0 w-[384px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[30px] items-start pb-0 pt-[21px] px-0 relative size-full">
        <Link />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[48px] h-[760px] items-center justify-center left-0 top-[96px] w-[1614px]" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[24px] top-[24px] w-[1566px]" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Arial:Regular',sans-serif] leading-[16px] min-h-px min-w-px not-italic relative text-[12px] text-[rgba(115,115,115,0.5)] text-center whitespace-pre-wrap">LuxeNail POS v2.0 • Designed for Tablet</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[88px] left-0 top-[856px] w-[1614px]" data-name="Container">
      <Paragraph1 />
    </div>
  );
}

export default function ImplementDeepLinkingForPos() {
  return (
    <div className="bg-[#fafafa] relative size-full" data-name="Implement Deep Linking for POS">
      <Container />
      <Container1 />
      <Container4 />
      <Container7 />
      <Container8 />
    </div>
  );
}