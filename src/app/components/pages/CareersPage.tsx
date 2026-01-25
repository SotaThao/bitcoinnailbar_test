import PublicLayout from "../PublicLayout";
import { CareerSection } from "../organisms/CareerSection";

export default function CareersPage() {
  return (
    <PublicLayout>
      <div className="bg-white">
        <CareerSection />
      </div>
    </PublicLayout>
  );
}