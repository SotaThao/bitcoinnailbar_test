import PublicLayout from '../PublicLayout';
import { MembershipSection } from '../organisms/MembershipSection';

export default function MembershipPage() {
  return (
    <PublicLayout>
      <div className="bg-[#111827]">
        <MembershipSection />
      </div>
    </PublicLayout>
  );
}