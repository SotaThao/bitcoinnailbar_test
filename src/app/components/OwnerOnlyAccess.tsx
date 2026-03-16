import { useNavigate } from "react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";

export function OwnerOnlyAccess() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="p-4 rounded-full bg-red-100 mb-6">
        <ShieldAlert className="h-12 w-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Access Restricted
      </h2>
      <p className="text-gray-500 mb-6 max-w-md">
        This page is only accessible to the owner. Please contact the owner if you need access.
      </p>
      <Button
        onClick={() => navigate("/admin")}
        className="bg-[#FF9800] hover:bg-[#F57C00] text-white"
      >
        Back to Dashboard
      </Button>
    </div>
  );
}
