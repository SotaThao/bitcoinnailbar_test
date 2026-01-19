import clsx from "clsx";
type ContainerTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ContainerText({ text, additionalClassNames = "" }: ContainerTextProps) {
  return (
    <div className={clsx("absolute content-stretch flex flex-col items-center top-1/2 translate-x-[-50%] translate-y-[-50%]", additionalClassNames)}>
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[36px] text-center text-nowrap">
        <p className="leading-[36px]">{text}</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[calc(50%-11.5px)] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[36px] text-center text-nowrap">
        <p className="leading-[36px]"></p>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <ContainerText text="" additionalClassNames="left-[calc(50%-118.5px)]" />
      <ContainerText text="" additionalClassNames="left-[calc(50%-65px)]" />
      <Container />
      <ContainerText text="" additionalClassNames="left-[calc(50%+51px)]" />
      <ContainerText text="" additionalClassNames="left-[calc(50%+116px)]" />
    </div>
  );
}