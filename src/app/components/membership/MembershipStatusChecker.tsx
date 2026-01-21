import { useState } from 'react';
import { Crown, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function MembershipStatusChecker() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [membership, setMembership] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!userId.trim()) {
      setError('Vui lòng nhập số điện thoại hoặc email');
      return;
    }

    setLoading(true);
    setError('');
    setMembership(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/membership/active/${encodeURIComponent(userId.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch membership');
      }

      setMembership(result.data);
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy membership');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'diamond':
        return 'from-cyan-400 to-blue-500';
      case 'platinum':
        return 'from-gray-300 to-gray-500';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Input */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
          placeholder="Nhập số điện thoại hoặc email"
          className="flex-1 h-11 bg-[#1f2937] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#FF9800] focus:ring-[#FF9800]/20 rounded-xl"
          disabled={loading}
        />
        <Button
          onClick={handleCheck}
          disabled={loading || !userId.trim()}
          className="h-11 px-6 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-xl"
        >
          {loading ? 'Checking...' : 'Kiểm tra'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Membership Status */}
      {membership && (
        <div className="p-6 bg-gradient-to-br from-[#1f2937] to-[#111827] rounded-2xl border border-gray-700 space-y-4">
          {membership.activeMembership ? (
            <>
              {/* Active Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getTierColor(membership.activeMembership.tier)} text-white font-bold text-sm`}>
                <Crown className="w-4 h-4" />
                {membership.activeMembership.tier.toUpperCase()} MEMBER
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-[#FF9800]" />
                  <span>Có hiệu lực đến:</span>
                  <span className="font-semibold text-white">
                    {new Date(membership.activeMembership.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {membership.totalActive > 1 && (
                  <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <p className="text-xs text-blue-300">
                      ℹ️ Bạn có {membership.totalActive} gói membership. 
                      Gói thấp hơn sẽ tự động kích hoạt khi gói hiện tại hết hạn.
                    </p>
                  </div>
                )}
              </div>

              {/* All Memberships */}
              {membership.allMemberships && membership.allMemberships.length > 1 && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 mb-2">TẤT CẢ CÁC GÓI:</p>
                  <div className="space-y-2">
                    {membership.allMemberships
                      .filter((m: any) => m.status !== 'expired')
                      .map((m: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className={`font-medium ${m.status === 'active' ? 'text-[#FF9800]' : 'text-gray-400'}`}>
                            {m.tier.toUpperCase()} {m.status === 'active' ? '(Active)' : '(Pending)'}
                          </span>
                          <span className="text-gray-500">
                            {new Date(m.endDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">Không tìm thấy membership nào</p>
              <p className="text-xs text-gray-500 mt-2">
                Mua gói và nhập mã redeem để kích hoạt
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
