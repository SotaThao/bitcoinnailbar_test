import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function TestSetup() {
  const [hasOwner, setHasOwner] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/setup/check`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      console.log('Setup check response:', data);
      
      if (data.success) {
        setHasOwner(data.data.has_owner);
      }
    } catch (error) {
      console.error('Failed to check setup:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetup();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Setup Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-white rounded border">
          <p className="text-sm text-gray-600">Owner Status:</p>
          <p className="text-lg font-bold">
            {loading ? 'Checking...' : hasOwner ? '✅ Owner exists' : '❌ No owner'}
          </p>
        </div>

        <Button onClick={checkSetup} disabled={loading}>
          Refresh Status
        </Button>

        {!hasOwner && hasOwner !== null && (
          <Button
            onClick={() => window.location.href = '/admin/setup-owner'}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Go to Setup
          </Button>
        )}
      </div>
    </div>
  );
}
