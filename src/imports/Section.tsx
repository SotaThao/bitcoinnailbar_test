import clsx from "clsx";
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("absolute content-stretch flex flex-col items-center right-[24px] top-[126px]", additionalClassNames)}>
      <div className="flex flex-col font-['Segoe_UI:Regular',sans-serif] justify-center leading-[20px] not-italic relative shrink-0 text-[#9ca3af] text-[14px] text-center text-nowrap">{children}</div>
    </div>
  );
}
type Container3Props = {
  text: string;
  text1: string;
};

function Container3({ text, text1 }: Container3Props) {
  return (
    <Wrapper additionalClassNames="left-[25px]">
      <p className="mb-0">{text}</p>
      <p>{text1}</p>
    </Wrapper>
  );
}
type ContainerTextProps = {
  text: string;
};

function ContainerText({ text }: ContainerTextProps) {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[25px] pb-0 pt-[2px] px-0 right-[24px] top-[24px]">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[48px] text-center text-nowrap">
        <p className="leading-[48px]">{text}</p>
      </div>
    </div>
  );
}
type HeadingTextProps = {
  text: string;
  additionalClassNames?: string;
};

function HeadingText({ text, additionalClassNames = "" }: HeadingTextProps) {
  return (
    <div className={clsx("absolute content-stretch flex flex-col items-center right-[24px] top-[90px]", additionalClassNames)}>
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-center text-nowrap text-white">
        <p className="leading-[28px]">{text}</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[24px] pb-0 pt-[2px] px-0 right-[24px] top-[24px]" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f7931a] text-[48px] text-center text-nowrap">
        <p className="leading-[48px]"></p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <Wrapper additionalClassNames="left-[24px]">
      <p className="mb-0">Accepting Bitcoin, USDT, VLINKPAY.</p>
      <p>{`Fast & Absolutely Secure.`}</p>
    </Wrapper>
  );
}

function Container2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[4px] self-stretch shrink-0" data-name="Container">
      <Container />
      <HeadingText text="Crypto Payments" additionalClassNames="left-[24px]" />
      <Container1 />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[25px] right-[24px] top-[90px]" data-name="Heading 3">
      <div className="flex flex-col font-['Georgia:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-center text-nowrap text-white">
        <p className="leading-[28px]">{`Bar & Cocktails`}</p>
      </div>
    </div>
  );
}

function VerticalBorder() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[4px] self-stretch shrink-0" data-name="VerticalBorder">
      <div aria-hidden="true" className="absolute border-[#1f2937] border-[0px_0px_0px_1px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <ContainerText text="" />
      <Heading />
      <Container3 text="Enjoy free drinks at our luxury Bar" text1="while relaxing." />
    </div>
  );
}

function VerticalBorder1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[4px] self-stretch shrink-0" data-name="VerticalBorder">
      <div aria-hidden="true" className="absolute border-[#1f2937] border-[0px_0px_0px_1px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <ContainerText text="" />
      <HeadingText text="Medical Hygiene" additionalClassNames="left-[25px]" />
      <Container3 text="Hospital-grade Autoclave sterilization" text1="process. Safety first." />
    </div>
  );
}

function VerticalBorder2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[4px] self-stretch shrink-0" data-name="VerticalBorder">
      <div aria-hidden="true" className="absolute border-[#1f2937] border-[0px_0px_0px_1px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <ContainerText text="" />
      <HeadingText text="10,000+ SQF" additionalClassNames="left-[25px]" />
      <Container3 text="The largest space in Houston," text1="designed for privacy and class." />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[32px] items-start justify-center relative w-full">
        <Container2 />
        <VerticalBorder />
        <VerticalBorder1 />
        <VerticalBorder2 />
      </div>
    </div>
  );
}

export default function Section() {
  return (
    <div className="bg-[#111827] content-stretch flex flex-col items-start pb-[49px] pt-[48px] px-[336px] relative size-full" data-name="Section">
      <div aria-hidden="true" className="absolute border-[#1f2937] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Container4 />
    </div>
  );
}