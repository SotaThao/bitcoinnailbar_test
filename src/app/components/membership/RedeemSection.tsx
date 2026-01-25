import { motion } from "motion/react";
import {
  Gift,
  CreditCard,
  Mail,
  CheckCircle,
  Search,
} from "lucide-react";
import { RedeemCodeInput } from "./RedeemCodeInput";
import { MembershipStatusChecker } from "./MembershipStatusChecker";
import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

export function RedeemSection() {
  const [activeTab, setActiveTab] = useState<
    "redeem" | "check"
  >("redeem");
  const { t } = useLanguage();

  return (
    <section
      id="redeem-section"
      className="py-16 bg-[#0f1219] relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF9800] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f7931a] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto" id="redeem">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-6 h-6 text-[#FF9800]" />
              <span className="text-[#FF9800] tracking-[1.6px] uppercase text-sm font-serif">
                {t("redeem.badge")}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              {t("redeem.title")}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t("redeem.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#1f2937] rounded-2xl p-6 border border-gray-800"
            >
              <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FF9800]" />
                {t("redeem.instructions.title")}
              </h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF9800]/20 border border-[#FF9800] flex items-center justify-center text-[#FF9800] font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">
                      {t("redeem.instructions.step1.title")}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {t("redeem.instructions.step1.desc")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF9800]/20 border border-[#FF9800] flex items-center justify-center text-[#FF9800] font-bold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">
                      {t("redeem.instructions.step2.title")}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {t("redeem.instructions.step2.desc")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF9800]/20 border border-[#FF9800] flex items-center justify-center text-[#FF9800] font-bold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t("redeem.instructions.step3.title")}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {t("redeem.instructions.step3.desc")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF9800]/20 border border-[#FF9800] flex items-center justify-center text-[#FF9800] font-bold text-sm">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {t("redeem.instructions.step4.title")}
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      {t("redeem.instructions.step4.desc")}
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1 ml-4 list-disc">
                      <li>
                        Enter your redeem code and phone number
                        in the form
                      </li>
                      <li>
                        One account can redeem multiple codes
                      </li>
                      <li>
                        Same tier extends your membership
                        duration
                      </li>
                      <li>
                        Higher tier upgrades and replaces
                        current membership
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-xl">
                <p className="text-xs text-blue-300 mb-2">
                  💡{" "}
                  <strong>
                    {t("redeem.instructions.note")}
                  </strong>{" "}
                  {t("redeem.instructions.note_desc")}
                </p>
                <p className="text-xs text-yellow-300">
                  ⚠️ <strong>Important:</strong> You cannot
                  downgrade to a lower tier. Only same-tier or
                  upgrades are allowed.
                </p>
              </div>
            </motion.div>

            {/* Redeem/Check Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#1f2937] rounded-2xl p-6 border border-gray-800"
            >
              {/* Tab Switcher */}
              <div className="flex gap-2 mb-6 bg-[#111827] p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("redeem")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "redeem"
                      ? "bg-[#FF9800] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Gift className="w-4 h-4 inline mr-2" />
                  {t("redeem.tabs.redeem")}
                </button>
                <button
                  onClick={() => setActiveTab("check")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "check"
                      ? "bg-[#FF9800] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  {t("redeem.tabs.check")}
                </button>
              </div>

              {/* Content */}
              {activeTab === "redeem" ? (
                <>
                  <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#FF9800]" />
                    {t("redeem.form.title_redeem")}
                  </h3>
                  <RedeemCodeInput />
                </>
              ) : (
                <>
                  <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#FF9800]" />
                    {t("redeem.form.title_check")}
                  </h3>
                  <MembershipStatusChecker />
                </>
              )}
            </motion.div>
          </div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1f2937] rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-lg font-serif font-bold text-white mb-4">
              {t("redeem.faq.title")}
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="text-white font-semibold mb-1">
                  ❓ {t("redeem.faq.q1")}
                </h4>
                <p className="text-gray-400">
                  {t("redeem.faq.a1")}
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">
                  ❓ {t("redeem.faq.q2")}
                </h4>
                <p className="text-gray-400">
                  {t("redeem.faq.a2")}
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">
                  ❓ {t("redeem.faq.q3")}
                </h4>
                <p className="text-gray-400">
                  {t("redeem.faq.a3")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}