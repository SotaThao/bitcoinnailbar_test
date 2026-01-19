import PublicLayout from '../PublicLayout';
import { EGiftCardSection } from '../sections/EGiftCardSection';

export default function EGiftPage() {
  return (
    <PublicLayout>
      <div className="pt-20 bg-[#0B0F19]">
        <EGiftCardSection />
      </div>
    </PublicLayout>
  );
}
