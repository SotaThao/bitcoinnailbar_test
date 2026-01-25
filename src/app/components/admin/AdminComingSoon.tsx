import AdminLayout from "../AdminLayout";
import { BarChart3, Clock, Rocket } from "lucide-react";
import { Button } from "../ui/button";

export default function AdminComingSoon() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-[#F97316]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Analytics Dashboard
          </h2>
          <p className="text-gray-500">
            We are working hard to bring you detailed insights
            and analytics for your business. This feature will
            be available soon.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Button className="gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white">
            <Rocket className="w-4 h-4" />
            Notify Me When Ready
          </Button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-100 shadow-sm max-w-lg w-full">
          <h3 className="font-semibold text-gray-900 mb-4 text-left">
            Coming Features
          </h3>
          <ul className="space-y-3 text-left">
            {[
              "Revenue trends and forecasting",
              "Staff performance metrics",
              "Customer retention analysis",
              "Service popularity heatmaps",
              "Peak hours identification",
            ].map((feature, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-sm text-gray-600"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}