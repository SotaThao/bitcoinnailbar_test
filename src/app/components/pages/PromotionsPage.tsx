import PublicLayout from "../PublicLayout";
import { PromotionsSection } from "../organisms/PromotionsSection";

export default function PromotionsPage() {
  return (
    <PublicLayout>
      <div className="bg-[#0B0F19]">
        <PromotionsSection />
      </div>
    </PublicLayout>
  );
}