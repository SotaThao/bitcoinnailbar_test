import svgPaths from "./svg-d968ie0vvw";
import clsx from "clsx";
type ContainerBackgroundImage1Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage1({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage1Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">{children}</div>
    </div>
  );
}
type ContainerBackgroundImageProps = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImageProps>) {
  return (
    <div className={clsx("relative rounded-[10px] shrink-0 size-[40px]", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">{children}</div>
    </div>
  );
}

function IconBackgroundImage1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute left-0 size-[16px] top-[2px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}
type IconBackgroundImageProps = {
  additionalClassNames?: string;
};

function IconBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<IconBackgroundImageProps>) {
  return (
    <div className={clsx("size-[20px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}
type ListItemBackgroundImageAndText1Props = {
  text: string;
};

function ListItemBackgroundImageAndText1({ text }: ListItemBackgroundImageAndText1Props) {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full">
      <p className="basis-0 font-['Arial:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[#973c00] text-[14px]">{text}</p>
    </div>
  );
}
type ListItemBackgroundImageAndTextProps = {
  text: string;
};

function ListItemBackgroundImageAndText({ text }: ListItemBackgroundImageAndTextProps) {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full">
      <p className="font-['Arial:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#973c00] text-[14px] text-nowrap">{text}</p>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute content-stretch flex h-[21px] items-start left-[41.23px] top-px w-[68.484px]" data-name="Text">
      <p className="font-['Arial:Bold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#0f172b] text-[16px] text-nowrap">John Doe</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#45556c] text-[16px] text-nowrap top-[-2px]">Hello</p>
      <Text />
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[24px] left-[109.72px] not-italic text-[#45556c] text-[16px] text-nowrap top-[-2px]">,</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#45556c] text-[16px] text-nowrap top-[-2px]">{`Thank you for registering! We're excited to see you at the event.`}</p>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[56px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph />
      <Paragraph1 />
    </div>
  );
}

function Icon() {
  return (
    <IconBackgroundImage additionalClassNames="absolute left-0 top-[5px]">
      <path d={svgPaths.p111ed900} id="Vector" stroke="var(--stroke-0, #F54900)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    </IconBackgroundImage>
  );
}

function Heading() {
  return (
    <div className="h-[30px] relative shrink-0 w-full" data-name="Heading 2">
      <Icon />
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[30px] left-[28px] not-italic text-[#0f172b] text-[20px] text-nowrap top-[-3px]">Event Details</p>
    </div>
  );
}

function Icon1() {
  return (
    <IconBackgroundImage additionalClassNames="relative shrink-0">
      <path d={svgPaths.p17233a00} id="Vector" stroke="var(--stroke-0, #F54900)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    </IconBackgroundImage>
  );
}

function Container1() {
  return (
    <ContainerBackgroundImage additionalClassNames="bg-[#ffedd4]">
      <Icon1 />
    </ContainerBackgroundImage>
  );
}

function Paragraph2() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[24px] left-0 not-italic text-[#0f172b] text-[16px] text-nowrap top-[-2px]">Leadership Summit 2026</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[#45556c] text-[14px]">Houston, TX</p>
    </div>
  );
}

function Container2() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="h-[46px] w-[179.594px]">
      <Paragraph2 />
      <Paragraph3 />
    </ContainerBackgroundImage1>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[12px] h-[46px] items-start relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}

function Icon2() {
  return (
    <IconBackgroundImage additionalClassNames="relative shrink-0">
      <path d={svgPaths.p26e51d00} id="Vector" stroke="var(--stroke-0, #155DFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    </IconBackgroundImage>
  );
}

function Container4() {
  return (
    <ContainerBackgroundImage additionalClassNames="bg-[#dbeafe]">
      <Icon2 />
    </ContainerBackgroundImage>
  );
}

function Paragraph4() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#0f172b] text-[16px] text-nowrap top-[-2px]">{`Date & Time`}</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arial:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#45556c] text-[14px] text-nowrap">January 10, 2026 15:30 (UTC)</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[20px] left-0 not-italic text-[#45556c] text-[14px] top-[-2px] w-[194px]">to January 11, 2026 23:59 (UTC)</p>
    </div>
  );
}

function Container5() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="h-[66px] w-[193.828px]">
      <Paragraph4 />
      <Paragraph5 />
      <Paragraph6 />
    </ContainerBackgroundImage1>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[12px] h-[66px] items-start relative shrink-0 w-full" data-name="Container">
      <Container4 />
      <Container5 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[124px] items-start relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[220px] relative rounded-[14px] shrink-0 w-full" data-name="Container" style={{ backgroundImage: "linear-gradient(162.646deg, rgb(248, 250, 252) 0%, rgb(241, 245, 249) 100%)" }}>
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Heading />
        <Container7 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <IconBackgroundImage additionalClassNames="absolute left-0 top-[5px]">
      <path d={svgPaths.pc43cc40} id="Vector" stroke="var(--stroke-0, #F54900)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    </IconBackgroundImage>
  );
}

function Heading2() {
  return (
    <div className="h-[30px] relative shrink-0 w-full" data-name="Heading 2">
      <Icon3 />
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[30px] left-[28px] not-italic text-[#0f172b] text-[20px] text-nowrap top-[-3px]">Your Ticket</p>
    </div>
  );
}

function QrCodeSvg() {
  return (
    <div className="h-[160px] overflow-clip relative shrink-0 w-full" data-name="QRCodeSVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160 160">
        <path d="M0 0H160V160H0V0Z" fill="var(--fill-0, white)" id="Vector" />
      </svg>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160 160">
        <path d={svgPaths.p1b291180} fill="var(--fill-0, black)" id="Vector" />
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[192px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[16px] px-[16px] relative size-full">
        <QrCodeSvg />
      </div>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[256px] relative shrink-0 w-[258px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135.223deg, rgb(15, 23, 43) 0%, rgb(29, 41, 61) 100%)" }}>
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-[0px_2px_0px_0px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-0 pr-[2px] py-0 relative size-full">
        <Container9 />
      </div>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',sans-serif] grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#62748e] text-[12px] tracking-[0.6px] uppercase">Ticket</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="bg-[#f1f5f9] h-[42px] relative rounded-[10px] shrink-0 w-full" data-name="Paragraph">
      <div aria-hidden="true" className="absolute border border-[#cad5e2] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <p className="absolute font-['Consolas:Regular',sans-serif] leading-[24px] left-[13px] not-italic text-[#0f172b] text-[16px] text-nowrap top-[8px] tracking-[0.8px]">UE4BTW07</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[62px] relative shrink-0 w-[102.781px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Paragraph7 />
        <Paragraph8 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="bg-[#dcfce7] h-[24px] relative rounded-[3.35544e+07px] shrink-0 w-[57.547px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[12px] py-[4px] relative size-full">
        <p className="font-['Arial:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#016630] text-[12px] text-nowrap">Active</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex h-[62px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container11 />
      <Container12 />
    </div>
  );
}

function Icon4() {
  return (
    <IconBackgroundImage1>
      <path d={svgPaths.p38e26100} id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </IconBackgroundImage1>
  );
}

function Container14() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <Icon4 />
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[20px] left-[24px] not-italic text-[#45556c] text-[14px] text-nowrap top-[-2px]">John Doe</p>
    </div>
  );
}

function Icon5() {
  return (
    <IconBackgroundImage1>
      <path d={svgPaths.p15a17180} id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </IconBackgroundImage1>
  );
}

function Container15() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <Icon5 />
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[20px] left-[24px] not-italic text-[#45556c] text-[14px] text-nowrap top-[-2px]">john.doe@example.com</p>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[69px] items-start pb-0 pt-[17px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <Container14 />
      <Container15 />
    </div>
  );
}

function Container17() {
  return (
    <div className="basis-0 grow h-[256px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-0 pt-[24px] px-[24px] relative size-full">
        <Container13 />
        <Container16 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex h-[256px] items-start relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <Container17 />
    </div>
  );
}

function Container19() {
  return (
    <div className="bg-white h-[260px] relative rounded-[14px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[2px] relative size-full">
          <Container18 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[306px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <Container19 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p39a39680} id="Vector" stroke="var(--stroke-0, #E17100)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[27px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[27px] left-0 not-italic text-[#7b3306] text-[18px] text-nowrap top-[-2px]">Important Check-in Information</p>
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[92px] items-start relative shrink-0 w-full" data-name="List">
      <ListItemBackgroundImageAndText text="• Please present this QR code at the event entrance" />
      <ListItemBackgroundImageAndText text="• You can save this email or screenshot the QR code" />
      <ListItemBackgroundImageAndText1 text="• Arrive 15-30 minutes before the event starts" />
      <ListItemBackgroundImageAndText1 text="• One QR code = One entry" />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[127px] relative shrink-0 w-[319.438px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Heading1 />
        <List />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex gap-[12px] h-[127px] items-start relative shrink-0 w-full" data-name="Container">
      <Icon6 />
      <Container21 />
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-[#fffbeb] h-[167px] relative rounded-br-[10px] rounded-tr-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#fe9a00] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-br-[10px] rounded-tr-[10px]" />
      <div className="content-stretch flex flex-col items-start pb-0 pl-[24px] pr-[20px] pt-[20px] relative size-full">
        <Container22 />
      </div>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="absolute h-[24px] left-[24px] top-[24px] w-[656px]" data-name="Paragraph">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[24px] left-[327.84px] not-italic text-[16px] text-center text-nowrap text-white top-[-2px] translate-x-[-50%]">Need to check in online?</p>
    </div>
  );
}

function Link() {
  return (
    <div className="absolute bg-white h-[48px] left-[255.09px] rounded-[10px] top-[60px] w-[193.797px]" data-name="Link">
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[24px] left-[97px] not-italic text-[#f54900] text-[16px] text-center text-nowrap top-[10px] translate-x-[-50%]">Visit Check-in Portal</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-[24px] top-[120px] w-[656px]" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.8)] text-center">http://localhost:8080/event/checkin</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="bg-gradient-to-r from-[#f54900] h-[164px] relative rounded-[14px] shrink-0 to-[#fe9a00] w-full" data-name="Container">
      <Paragraph9 />
      <Link />
      <Paragraph10 />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[#62748e] text-[14px] text-center">Questions? Contact our support team</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',sans-serif] grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#90a1b9] text-[12px] text-center">© 2025 Nail Hub. All rights reserved.</p>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[77px] items-start pb-0 pt-[33px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <Paragraph11 />
      <Paragraph12 />
    </div>
  );
}

export default function Container26() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start pb-0 pt-[40px] px-[32px] relative size-full" data-name="Container">
      <Container />
      <Container8 />
      <Container20 />
      <Container23 />
      <Container24 />
      <Container25 />
    </div>
  );
}