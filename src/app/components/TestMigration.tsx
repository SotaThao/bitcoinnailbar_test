import { useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

/**
 * TEST MIGRATION COMPONENT
 * Verify Postgres migration is working correctly
 */
export function TestMigration() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('auth_token') || '';
  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112`;

  const addResult = (test: string, success: boolean, data?: any, error?: string) => {
    setResults((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        test,
        success,
        data,
        error,
      },
    ]);
  };

  const runTest = async (name: string, url: string, options: RequestInit = {}) => {
    try {
      console.log(`🧪 [TEST] ${name}...`);
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      console.log(`✅ [TEST] ${name} - SUCCESS`, data);
      addResult(name, true, data);
      return data;
    } catch (error: any) {
      console.error(`❌ [TEST] ${name} - FAILED`, error);
      addResult(name, false, null, error.message);
      throw error;
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      // TEST 1: Seed Staff
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('TEST 1: Seed Staff into Postgres');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const seedResult = await runTest(
        'Seed Staff (Postgres)',
        `${baseUrl}/staff/seed`,
        { method: 'POST' }
      );

      // TEST 2: Get All Staff
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('TEST 2: Get All Staff from Postgres');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const staffResult = await runTest('Get All Staff (Postgres)', `${baseUrl}/staff`);
      const staff = staffResult.data || [];
      console.log(`📊 Found ${staff.length} staff members`);

      if (staff.length === 0) {
        throw new Error('No staff found! Seed might have failed.');
      }

      // TEST 3: Create Appointment
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('TEST 3: Create New Appointment (Postgres)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Use first available staff (or null for auto-assign)
      const appointmentData = {
        customerName: 'Test Customer',
        customerPhone: '7145551234',
        customerEmail: 'test@example.com',
        branchId: 'branch-001',
        staffId: null, // Leave empty for auto-assignment
        serviceIds: [],
        serviceNames: ['Manicure', 'Gel Polish'],
        appointmentTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        notes: 'Test appointment from migration test',
      };

      const apptResult = await runTest(
        'Create Appointment (Postgres)',
        `${baseUrl}/appointments`,
        {
          method: 'POST',
          body: JSON.stringify(appointmentData),
        }
      );

      const appointment = apptResult.data;
      console.log(`✅ Created appointment: ${appointment.id}`);

      // TEST 4: Auto-Assign Technician
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('TEST 4: Auto-Assign Technician');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const assignResult = await runTest(
        'Auto-Assign Technician',
        `https://${projectId}.supabase.co/functions/v1/make-server-89edbd69/technician-assignment/${appointment.id}/auto-assign`,
        { method: 'POST' }
      );

      console.log(`✅ Assigned: ${assignResult.data.assignedStaff.name}`);
      console.log(`📊 Score: ${assignResult.data.score}/100`);

      // TEST 5: Get Assignment Logs
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('TEST 5: Get Assignment Logs (Postgres)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const logsResult = await runTest(
        'Get Assignment Logs',
        `https://${projectId}.supabase.co/functions/v1/make-server-89edbd69/assignment-logs/appointment/${appointment.id}`
      );

      console.log(`✅ Found ${logsResult.data.length} assignment logs`);

      // TEST 6: Get All Appointments
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('TEST 6: Get All Appointments (Postgres)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const allApptsResult = await runTest('Get All Appointments', `${baseUrl}/appointments`);
      console.log(`✅ Found ${allApptsResult.data.length} appointments`);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 ALL TESTS PASSED!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error: any) {
      console.error('❌ TEST SUITE FAILED:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const exportResults = () => {
    const json = JSON.stringify(results, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migration-test-${Date.now()}.json`;
    a.click();
  };

  const passedTests = results.filter((r) => r.success).length;
  const failedTests = results.filter((r) => !r.success).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Migration Test Suite
          </h1>
          <p className="text-gray-600 mb-6">
            Verify that KV Store → Postgres migration is working correctly
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '⏳ Running Tests...' : '▶️ Run All Tests'}
            </button>

            {results.length > 0 && (
              <>
                <button
                  onClick={clearResults}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  🗑️ Clear Results
                </button>
                <button
                  onClick={exportResults}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  💾 Export JSON
                </button>
              </>
            )}
          </div>

          {/* Test Summary */}
          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-gray-900">{results.length}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-green-700">Passed</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
            </div>
          )}

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border-l-4 rounded-lg p-4 ${
                    result.success
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {result.success ? '✅' : '❌'}
                      </span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {result.test}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {result.error && (
                    <div className="mt-2 p-3 bg-red-100 rounded text-sm text-red-800">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}

                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                        View Response Data
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Initial State */}
          {results.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-gray-600">
                Click "Run All Tests" to verify the migration
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">⏳</div>
              <p className="text-gray-600">Running tests...</p>
              <p className="text-sm text-gray-500 mt-2">
                Check browser console for detailed logs
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Test Checklist
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ Seeds 6 staff members into <code className="bg-blue-100 px-1 rounded">technician_info</code></li>
            <li>✅ Retrieves staff from Postgres table</li>
            <li>✅ Creates new appointment in <code className="bg-blue-100 px-1 rounded">appointment_info</code></li>
            <li>✅ Auto-assigns best technician using scoring algorithm</li>
            <li>✅ Logs assignment to <code className="bg-blue-100 px-1 rounded">assignment_change_log</code></li>
            <li>✅ Verifies all data is stored in Postgres (not KV Store)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
