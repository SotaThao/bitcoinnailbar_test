import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { MembershipUpgradeDialog } from "./MembershipUpgradeDialog";
import { getTierPriority } from "@/app/config/membership-tiers";

interface RedeemCodeInputProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function RedeemCodeInput({
  onSuccess,
  onError,
}: RedeemCodeInputProps) {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showUpgradeConfirm, setShowUpgradeConfirm] =
    useState(false);
  const [currentMembership, setCurrentMembership] =
    useState<any>(null);
  const [upgradeInfo, setUpgradeInfo] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [pendingRedeemData, setPendingRedeemData] = useState<{
    code: string;
    phone: string;
  } | null>(null);

  // Format phone number to US format: (xxx) xxx-xxxx
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, "");
    const limitedPhone = phoneNumber.slice(0, 10);

    if (limitedPhone.length <= 3) {
      return limitedPhone;
    } else if (limitedPhone.length <= 6) {
      return `(${limitedPhone.slice(0, 3)}) ${limitedPhone.slice(3)}`;
    } else {
      return `(${limitedPhone.slice(0, 3)}) ${limitedPhone.slice(3, 6)}-${limitedPhone.slice(6)}`;
    }
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Check if user has existing membership and validate tier hierarchy
  const checkExistingMembership = async (
    phoneDigits: string,
  ): Promise<{
    canProceed: boolean;
    needsConfirmation: boolean;
    message?: string;
  }> => {
    try {
      console.log(
        "🔍 [CHECK] Checking existing membership for:",
        phoneDigits,
      );

      // Check existing membership
      const membershipResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/membership/active/${encodeURIComponent(phoneDigits)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      // If response is not OK or not JSON, skip check and let backend validate
      if (!membershipResponse.ok) {
        console.log(
          "⚠️ [CHECK] Membership check failed, proceeding without check",
        );
        return { canProceed: true, needsConfirmation: false };
      }

      let membershipData;
      try {
        membershipData = await membershipResponse.json();
      } catch (parseError) {
        console.error(
          "❌ [CHECK] Failed to parse membership response:",
          parseError,
        );
        return { canProceed: true, needsConfirmation: false };
      }

      console.log(
        "📥 [CHECK] Membership response:",
        membershipData,
      );

      if (
        !membershipData.success ||
        !membershipData.data ||
        !membershipData.data.activeMembership
      ) {
        // No existing membership - can proceed without confirmation
        return { canProceed: true, needsConfirmation: false };
      }

      // User has active membership - for now, just proceed and let backend handle tier validation
      // TODO: In the future, we can add pre-validation here if we know the code's tier
      console.log(
        "ℹ️ [CHECK] User has active membership, backend will handle tier validation",
      );
      return { canProceed: true, needsConfirmation: false };
    } catch (error: any) {
      console.error(
        "❌ [CHECK] Error checking membership:",
        error,
      );
      // If check fails, let backend validate
      return { canProceed: true, needsConfirmation: false };
    }
  };

  const handleRedeem = async () => {
    // Validate inputs
    if (!code.trim()) {
      setError("Vui lòng nhập mã redeem");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setError("Vui lòng nhập đúng số điện thoại (10 số)");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Check existing membership and tier hierarchy
      const checkResult =
        await checkExistingMembership(phoneDigits);
      if (!checkResult.canProceed) {
        throw new Error(
          checkResult.message ||
            "Không thể kích hoạt membership",
        );
      }

      if (checkResult.needsConfirmation) {
        setPendingRedeemData({
          code: code.toUpperCase().trim(),
          phone: phoneDigits,
        });
        setShowUpgradeConfirm(true);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/membership/redeem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            redeemCode: code.toUpperCase().trim(),
            phone: phoneDigits,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Không thể kích hoạt membership",
        );
      }

      setSuccess(true);
      setResult(data);
      setCode("");
      setPhone("");

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err: any) {
      const errorMessage =
        err.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleRedeem();
    }
  };

  const performRedeem = async () => {
    if (!pendingRedeemData) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/membership/redeem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            redeemCode: pendingRedeemData.code,
            phone: pendingRedeemData.phone,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Không thể kích hoạt membership",
        );
      }

      setSuccess(true);
      setResult(data);
      setCode("");
      setPhone("");
      setPendingRedeemData(null);
      setShowUpgradeConfirm(false);

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err: any) {
      const errorMessage =
        err.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeCancel = () => {
    setShowUpgradeConfirm(false);
    setPendingRedeemData(null);
    setCurrentMembership(null);
    setUpgradeInfo(null);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Success Message */}
      {success && result && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-green-400 font-semibold mb-1">
                {result.message || "Kích hoạt thành công!"}
              </h4>
              {result.data?.membership && (
                <>
                  <p className="text-xs text-gray-400 mt-2">
                    <strong>Tier:</strong> {result.data.membership.tier?.toUpperCase() || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong>Hết hạn:</strong>{" "}
                    {new Date(
                      result.data.membership.endDate || result.data.membership.expiresAt,
                    ).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {result.action && (
                    <div className="mt-2 inline-block px-2 py-1 bg-green-500/20 rounded text-xs text-green-300 font-medium">
                      {result.action === 'extension' && '➕ Extended'}
                      {result.action === 'upgrade' && '⬆️ Upgraded'}
                      {result.action === 'new' && '✨ New Membership'}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-red-400 font-semibold mb-1">
                Lỗi
              </h4>
              <p className="text-sm text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Fields */}
      <div className="space-y-4">
        {/* Redeem Code Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mã Redeem Code
          </label>
          <Input
            type="text"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase())
            }
            onKeyPress={handleKeyPress}
            placeholder="XXXXXXXXXXXXXX"
            className="w-full h-12 bg-[#1f2937] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#FF9800] focus:ring-[#FF9800]/20 rounded-xl font-mono tracking-wider"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1.5">
            📧 Kiểm tra email để lấy mã redeem code
          </p>
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Số điện thoại
          </label>
          <Input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            onKeyPress={handleKeyPress}
            placeholder="(555) 123-4567"
            className="w-full h-12 bg-[#1f2937] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#FF9800] focus:ring-[#FF9800]/20 rounded-xl"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Định dạng Mỹ: (xxx) xxx-xxxx
          </p>
        </div>

        <Button
          onClick={handleRedeem}
          disabled={
            loading ||
            !code.trim() ||
            phone.replace(/\D/g, "").length !== 10
          }
          className="w-full h-12 bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#FF9800] text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang kích hoạt...
            </span>
          ) : (
            "Kích hoạt Membership"
          )}
        </Button>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Mã redeem có hiệu lực trong 30 ngày kể từ khi thanh toán
      </p>

      {/* Membership Upgrade Dialog */}
      {showUpgradeConfirm && (
        <MembershipUpgradeDialog
          currentMembership={currentMembership}
          upgradeInfo={upgradeInfo}
          onConfirm={performRedeem}
          onCancel={handleUpgradeCancel}
        />
      )}
    </div>
  );
}