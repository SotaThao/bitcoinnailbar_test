function Container() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[calc(50%-118.5px)] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[36px] text-center whitespace-nowrap">
        <p className="leading-[36px] whitespace-pre"></p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[calc(50%-65px)] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[36px] text-center whitespace-nowrap">
        <p className="leading-[36px] whitespace-pre"></p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[calc(50%-11.5px)] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[36px] text-center whitespace-nowrap">
        <p className="leading-[36px] whitespace-pre"></p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[calc(50%+51px)] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[36px] text-center whitespace-nowrap">
        <p className="leading-[36px] whitespace-pre"></p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[calc(50%+116px)] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Container">
      <div className="flex flex-col font-['Font_Awesome_5_Brands:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[36px] text-center whitespace-nowrap">
        <p className="leading-[36px] whitespace-pre"></p>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <Container />
      <Container1 />
      <Container2 />
      <Container3 />
      <Container4 />
    </div>
  );
}