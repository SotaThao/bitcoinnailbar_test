import { CreditCard, Megaphone } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { MembershipTiersEditor } from "./organisms/MembershipTiersEditor";
import { PromotionEditor } from "./organisms/PromotionEditor";
import {
  PillTabs,
  PillTabsContent,
  PillTabsList,
  PillTabsTrigger,
} from "../ui/pill-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function AdminMembershipPage() {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PillTabs defaultValue="memberships" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <PillTabsList className="mt-[0px] mr-[0px] mb-[0px] ml-[0px]">
              <PillTabsTrigger
                value="memberships"
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Memberships
              </PillTabsTrigger>
              <PillTabsTrigger
                value="promotions"
                className="gap-2"
              >
                <Megaphone className="h-4 w-4" />
                Promotions & Events
              </PillTabsTrigger>
            </PillTabsList>
          </div>

          <PillTabsContent value="memberships" className="mt-0">
            <MembershipTiersEditor />
          </PillTabsContent>

          <PillTabsContent value="promotions" className="mt-0">
            <PromotionEditor />
          </PillTabsContent>
        </PillTabs>
      </div>
    </AdminLayout>
  );
}