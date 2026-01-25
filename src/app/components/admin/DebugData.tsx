import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Loader2,
  AlertTriangle,
  Database,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "@utils/supabase/info";
import AdminLayout from "@/app/components/AdminLayout";

export default function DebugData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    // Silent background fetch - no loading state shown
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/debug/data-check`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error("Failed to load debug data");
      }
    } catch (error) {
      console.error("Error loading debug data:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (
      !confirm(
        `⚠️ Bạn chc chắn muốn xóa ${data?.duplicates?.totalDuplicates} bản ghi duplicate?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`,
      )
    ) {
      return;
    }

    setCleaning(true);
    try {
      console.log(
        "🧹 Starting cleanup via alternative method...",
      );

      // Build a list of staff to keep (first ID of each duplicate group)
      const staffToKeep = data.duplicates.staff.map(
        (dup: any) => ({
          name: dup.name,
          keepId: dup.ids[0], // Keep the first (oldest) ID
          deleteIds: dup.ids.slice(1), // Delete the rest
        }),
      );

      console.log("   Staff cleanup plan:", staffToKeep);

      // Use the cleanup endpoint with alternative payload
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/debug/cleanup-duplicates-v2`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ staffToKeep }),
        },
      );

      const result = await response.json();
      console.log("   Response:", result);

      if (result.success) {
        toast.success(
          `✅ ${result.data?.summary || "Cleanup completed!"}`,
        );
        await loadDebugData();
      } else {
        // Fallback: Show manual instructions
        toast.error(
          "Automatic cleanup failed. Please contact admin.",
        );
        console.error("Cleanup failed:", result);
      }
    } catch (error: any) {
      console.error("🚨 Error cleaning duplicates:", error);
      toast.error(
        `An error occurred: ${error.message || "Unknown error"}`,
      );
    } finally {
      setCleaning(false);
    }
  };

  // Remove initial loading screen - show data immediately for better UX
  // Data fetches silently in background

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Database Debug
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Check data quality and remove duplicates
            </p>
          </div>
          <Button onClick={loadDebugData} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Total Records */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Staff</p>
                  <p className="text-2xl font-bold">
                    {data?.totals?.staff || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">
                    Appointments
                  </p>
                  <p className="text-2xl font-bold">
                    {data?.totals?.appointments || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500">
                    Services
                  </p>
                  <p className="text-2xl font-bold">
                    {data?.totals?.services || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500">
                    Branches
                  </p>
                  <p className="text-2xl font-bold">
                    {data?.totals?.branches || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Duplicates Warning */}
        {data?.duplicates?.totalDuplicates > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertTriangle className="h-5 w-5" />
                Duplicate Staff Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700 mb-4">
                Found {data.duplicates.totalDuplicates}{" "}
                duplicate staff records. This is causing
                incorrect counts in the dashboard.
              </p>

              <div className="space-y-3">
                {data.duplicates.staff.map(
                  (dup: any, i: number) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-lg border border-orange-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {dup.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dup.count} records found
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            toast.info(
                              "Auto-cleanup feature coming soon",
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clean
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-gray-400 font-mono">
                        IDs: {dup.ids.slice(0, 3).join(", ")}
                        {dup.ids.length > 3 &&
                          ` +${dup.ids.length - 3} more`}
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-4">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleCleanupDuplicates}
                  disabled={cleaning}
                >
                  {cleaning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa tất cả{" "}
                      {data.duplicates.totalDuplicates}{" "}
                      duplicates
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Branches Duplicates Warning */}
        {data?.duplicates?.totalBranchDuplicates > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5" />
                Duplicate Branches Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700 mb-4">
                Found {data.duplicates.totalBranchDuplicates}{" "}
                duplicate branch records!
              </p>

              <div className="space-y-3">
                {data.duplicates.branches?.map(
                  (dup: any, i: number) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-lg border border-red-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {dup.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dup.count} records found
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400 font-mono">
                        IDs: {dup.ids.slice(0, 3).join(", ")}
                        {dup.ids.length > 3 &&
                          ` +${dup.ids.length - 3} more`}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample Data */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Staff Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.sampleStaff?.map(
                (staff: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <p className="font-semibold text-sm">
                      {staff.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {staff.role}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      {staff.id}
                    </p>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sample Branches */}
        {data?.sampleBranches &&
          data.sampleBranches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Branches Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.sampleBranches.map(
                    (branch: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <p className="font-semibold text-sm">
                          {branch.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {branch.address}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          {branch.id}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* No Issues */}
        {data?.duplicates?.totalDuplicates === 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">
                    Database is clean
                  </p>
                  <p className="text-sm text-green-700">
                    No duplicate records found
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Restore Data Section */}
        <Card>
          <CardHeader>
            <CardTitle>Restore Sample Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              If data is missing or corrupted, you can restore
              sample data using these buttons.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/staff/seed`,
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${publicAnonKey}`,
                        },
                      },
                    );
                    const data = await response.json();
                    if (data.success) {
                      toast.success("✅ Staff data restored!");
                      loadDebugData();
                    }
                  } catch (error) {
                    toast.error(
                      "❌ Failed to restore staff data",
                    );
                  }
                }}
              >
                Restore Staff (6 records)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clean Data Section */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Clean Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-red-700 mb-4">
              ⚠️ <strong>Warning:</strong> These actions will
              permanently delete data. Use with caution!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Clean All Branches */}
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={async () => {
                  if (
                    !confirm(
                      `⚠️ Delete ALL ${data?.totals?.branches || 0} branches?\n\nThis action CANNOT be undone!`,
                    )
                  ) {
                    return;
                  }
                  try {
                    const branches = await fetch(
                      `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/branches`,
                      {
                        headers: {
                          Authorization: `Bearer ${publicAnonKey}`,
                        },
                      },
                    ).then((r) => r.json());

                    console.log(
                      "🔍 [DEBUG] Branches response:",
                      branches,
                    );
                    console.log(
                      "🔍 [DEBUG] Data length:",
                      branches.data?.length,
                    );
                    console.log(
                      "🔍 [DEBUG] First 3 branches:",
                      branches.data?.slice(0, 3),
                    );

                    if (
                      branches.success &&
                      branches.data.length > 0
                    ) {
                      let deleted = 0;
                      for (const branch of branches.data) {
                        console.log(
                          "🗑️ [DEBUG] Deleting branch:",
                          branch.id,
                        );
                        const res = await fetch(
                          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/branches/${branch.id}`,
                          {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${publicAnonKey}`,
                            },
                          },
                        );
                        const result = await res.json();
                        console.log(
                          "🔍 [DEBUG] Delete result:",
                          result,
                        );
                        if (result.success) deleted++;
                      }
                      toast.success(
                        `✅ Deleted ${deleted} branches`,
                      );
                      loadDebugData();
                    } else {
                      console.warn(
                        "⚠️ [DEBUG] No branches or failed:",
                        {
                          success: branches.success,
                          dataLength: branches.data?.length,
                          error: branches.error,
                        },
                      );
                      toast.info("No branches to delete");
                    }
                  } catch (error) {
                    console.error("❌ [DEBUG] Error:", error);
                    toast.error("❌ Failed to delete branches");
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Branches ({data?.totals?.branches || 0})
              </Button>

              {/* Clean All Services */}
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={async () => {
                  if (
                    !confirm(
                      `⚠️ Delete ALL ${data?.totals?.services || 0} services?\n\nThis action CANNOT be undone!`,
                    )
                  ) {
                    return;
                  }
                  try {
                    const services = await fetch(
                      `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/services`,
                      {
                        headers: {
                          Authorization: `Bearer ${publicAnonKey}`,
                        },
                      },
                    ).then((r) => r.json());

                    if (
                      services.success &&
                      services.data.length > 0
                    ) {
                      let deleted = 0;
                      for (const service of services.data) {
                        const res = await fetch(
                          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/services/${service.id}`,
                          {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${publicAnonKey}`,
                            },
                          },
                        );
                        if ((await res.json()).success)
                          deleted++;
                      }
                      toast.success(
                        `✅ Deleted ${deleted} services`,
                      );
                      loadDebugData();
                    } else {
                      toast.info("No services to delete");
                    }
                  } catch (error) {
                    toast.error("❌ Failed to delete services");
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Services ({data?.totals?.services || 0})
              </Button>

              {/* Clean All Appointments */}
              <Button
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                onClick={async () => {
                  if (
                    !confirm(
                      `⚠️ Delete ALL ${data?.totals?.appointments || 0} appointments?\n\nThis action CANNOT be undone!`,
                    )
                  ) {
                    return;
                  }
                  try {
                    const appointments = await fetch(
                      `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/appointments`,
                      {
                        headers: {
                          Authorization: `Bearer ${publicAnonKey}`,
                        },
                      },
                    ).then((r) => r.json());

                    if (
                      appointments.success &&
                      appointments.data.length > 0
                    ) {
                      // Use mdel for bulk delete if available, otherwise loop
                      const response = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/debug/clean-appointments`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${publicAnonKey}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ids: appointments.data.map(
                              (a: any) => a.id,
                            ),
                          }),
                        },
                      );
                      const result = await response.json();
                      if (result.success) {
                        toast.success(
                          `✅ Deleted all appointments`,
                        );
                        loadDebugData();
                      } else {
                        toast.error(
                          "❌ Failed to delete appointments",
                        );
                      }
                    } else {
                      toast.info("No appointments to delete");
                    }
                  } catch (error) {
                    toast.error(
                      "❌ Failed to delete appointments",
                    );
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Appointments (
                {data?.totals?.appointments || 0})
              </Button>

              {/* Clean All Staff (with confirmation) */}
              <Button
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
                onClick={async () => {
                  if (
                    !confirm(
                      `⚠️ Delete ALL ${data?.totals?.staff || 0} staff?\n\nThis will remove all payroll data!\n\nThis action CANNOT be undone!`,
                    )
                  ) {
                    return;
                  }
                  if (
                    !confirm(
                      `⚠️⚠️ FINAL WARNING!\n\nAre you ABSOLUTELY SURE you want to delete all staff?\n\nClick OK to proceed.`,
                    )
                  ) {
                    return;
                  }
                  try {
                    const staff = await fetch(
                      `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/staff`,
                      {
                        headers: {
                          Authorization: `Bearer ${publicAnonKey}`,
                        },
                      },
                    ).then((r) => r.json());

                    if (
                      staff.success &&
                      staff.data.length > 0
                    ) {
                      const response = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/debug/clean-staff`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${publicAnonKey}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ids: staff.data.map(
                              (s: any) => s.id,
                            ),
                          }),
                        },
                      );
                      const result = await response.json();
                      if (result.success) {
                        toast.success(`✅ Deleted all staff`);
                        loadDebugData();
                      } else {
                        toast.error(
                          "❌ Failed to delete staff",
                        );
                      }
                    } else {
                      toast.info("No staff to delete");
                    }
                  } catch (error) {
                    toast.error("❌ Failed to delete staff");
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Staff ({data?.totals?.staff || 0})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}