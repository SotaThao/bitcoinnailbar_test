import imgPremiumSpa from "figma:asset/335b66cb51969fc7c9a2c97186c9aa7dee54ed2f.png";

function PremiumSpa() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Premium Spa">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-contain pointer-events-none size-full" src={imgPremiumSpa} />
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative size-full" data-name="Container">
      <PremiumSpa />
    </div>
  );
}