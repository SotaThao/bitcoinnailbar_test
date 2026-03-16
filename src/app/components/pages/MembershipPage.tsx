import PublicLayout from "../PublicLayout";
import { MembershipSection } from "../organisms/MembershipSection";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";

export default function MembershipPage() {
  const location = useLocation();

  useEffect(() => {
    // Check if redirected from payment
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      // Show success message
      toast.success("Thanh toán thành công! 🎉", {
        description:
          "Vui lòng kiểm tra email để nhận mã redeem code và kích hoạt membership.",
        duration: 7000,
      });

      // Auto-scroll to redeem section after a short delay
      setTimeout(() => {
        const redeemSection = document.getElementById("redeem");
        if (redeemSection) {
          redeemSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 500);
    }

    // Check if hash is #redeem (from button click)
    if (location.hash === "#redeem") {
      setTimeout(() => {
        const redeemSection = document.getElementById("redeem");
        if (redeemSection) {
          redeemSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  }, [location]);

  return (
    <PublicLayout>
      <div className="bg-[#111827]">
        <MembershipSection showRedeemSection={true} />
      </div>
    </PublicLayout>
  );
}