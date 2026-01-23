import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface MembershipUpgradeDialogProps {
  currentMembership: any;
  upgradeInfo: { from: string; to: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MembershipUpgradeDialog({
  currentMembership,
  upgradeInfo,
  onConfirm,
  onCancel,
}: MembershipUpgradeDialogProps) {
  if (!upgradeInfo || !currentMembership) return null;

  // Format tier names for display
  const formatTierName = (tier: string) => {
    return tier
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const currentTierDisplay = formatTierName(upgradeInfo.from);
  const newTierDisplay = formatTierName(upgradeInfo.to);

  return (
    <AlertDialog open={true} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-md bg-gray-900 border-gray-800">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <AlertDialogTitle className="text-xl text-white">
              Upgrade Membership
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-300 text-base space-y-3 pt-2">
            <p>
              You are about to upgrade from <span className="font-bold text-white">{currentTierDisplay}</span> to{' '}
              <span className="font-bold text-white">{newTierDisplay}</span> membership.
            </p>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <p className="text-sm text-orange-200">
                <strong>⚠️ Important:</strong> Upgrading will replace your current {currentTierDisplay} membership.
                Your new {newTierDisplay} benefits will start immediately.
              </p>
            </div>
            <p className="text-sm text-gray-400">
              Do you want to continue with this upgrade?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel onClick={onCancel} className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
          >
            Continue Upgrade
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}