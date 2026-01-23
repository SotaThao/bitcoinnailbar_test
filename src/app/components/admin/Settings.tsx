import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { LoadingSpinner } from './atoms/LoadingSpinner';
import { projectId, publicAnonKey } from '@utils/supabase/info';
import { apiClient } from '../../lib/api-client';
import AdminLayout from '../AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Facebook, Instagram, Save, Loader2, Bug, List, ImageIcon, ExternalLink, MessageCircle } from 'lucide-react';
import { getCurrentUser } from '/utils/auth';
import { OwnerOnlyAccess } from '@/app/components/OwnerOnlyAccess';
import { ChatbotSettings } from './organisms/ChatbotSettings';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export default function AdminSettings() {
  // Check if current user is owner first
  const currentUser = getCurrentUser();
  const isOwner = currentUser?.role === 'owner';

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    instagram: '',
    tiktok: ''
  });
  const [homepageMenuMode, setHomepageMenuMode] = useState<'services-list' | 'menu-images'>('services-list');
  const [savingMenuMode, setSavingMenuMode] = useState(false);
  const [chatbotAvatar, setChatbotAvatar] = useState<string>('');
  const [chatbotAvatarPath, setChatbotAvatarPath] = useState<string>('');
  const [savingChatbot, setSavingChatbot] = useState(false);

  useEffect(() => {
    if (isOwner) {
      fetchSettings();
    }
  }, [isOwner]);

  const fetchSettings = async () => {
    try {
      // Fetch social media settings
      const result = await apiClient.settings.getSocialMedia();
      
      if (result.success && result.data) {
        setSocialMedia(result.data);
      }

      // Fetch homepage menu mode
      const modeResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/homepage-menu`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const modeData = await modeResponse.json();
      if (modeData.success) {
        setHomepageMenuMode(modeData.data.mode);
      }

      // Fetch chatbot avatar
      const avatarResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/chatbot-avatar`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const avatarData = await avatarResponse.json();
      if (avatarData.success) {
        setChatbotAvatar(avatarData.data.avatar);
        // avatarPath might not exist in old data, so it's optional
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await apiClient.settings.updateSocialMedia(socialMedia);

      if (result.success) {
        toast.success('✅ Social media links updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMenuMode = async () => {
    setSavingMenuMode(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/settings/homepage-menu`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mode: homepageMenuMode }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('✅ Homepage menu display updated!');
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Failed to save menu mode:', error);
      toast.error(`❌ Failed to save: ${error.message}`);
    } finally {
      setSavingMenuMode(false);
    }
  };

  const handleSaveChatbot = async () => {
    setSavingChatbot(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/settings/chatbot-avatar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ avatarPath: chatbotAvatarPath }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('✅ Chatbot avatar updated!', {
          description: 'The new avatar will appear in the chatbot widget.',
        });
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Failed to save chatbot avatar:', error);
      toast.error(`❌ Failed to save: ${error.message}`);
    } finally {
      setSavingChatbot(false);
    }
  };

  // If not owner, show access denied in AdminLayout
  if (!isOwner) {
    return (
      <AdminLayout>
        <OwnerOnlyAccess />
      </AdminLayout>
    );
  }

  // Remove loading screen - show settings immediately (even if fetching)
  // Silent background updates for better UX

  return (
    <AdminLayout>
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Intro */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your business settings and social media links.</p>
        </div>

        {/* Social Media Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Social Media Links
            </CardTitle>
            <CardDescription className="text-gray-500">
              Update your social media profiles. Leave blank to hide the icon from footer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-gray-700 flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Label>
              <Input
                id="facebook"
                type="url"
                placeholder="https://www.facebook.com/yourpage"
                value={socialMedia.facebook}
                onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                className="bg-white border-gray-200"
              />
              {socialMedia.facebook && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                   Icon will be visible in footer
                </p>
              )}
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-gray-700 flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram
              </Label>
              <Input
                id="instagram"
                type="url"
                placeholder="https://www.instagram.com/yourpage"
                value={socialMedia.instagram}
                onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                className="bg-white border-gray-200"
              />
              {!socialMedia.instagram && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                   Icon will be hidden (no link provided)
                </p>
              )}
            </div>

            {/* TikTok */}
            <div className="space-y-2">
              <Label htmlFor="tiktok" className="text-gray-700 flex items-center gap-2">
                <TikTokIcon className="h-4 w-4 text-black" />
                TikTok
              </Label>
              <Input
                id="tiktok"
                type="url"
                placeholder="https://www.tiktok.com/@yourpage"
                value={socialMedia.tiktok}
                onChange={(e) => setSocialMedia({ ...socialMedia, tiktok: e.target.value })}
                className="bg-white border-gray-200"
              />
              {!socialMedia.tiktok && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                   Icon will be hidden (no link provided)
                </p>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white font-medium shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Homepage Menu Mode Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Homepage Menu Display
            </CardTitle>
            <CardDescription className="text-gray-500">
              Choose how the menu is displayed on the homepage kiosk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Services List Option */}
              <button
                onClick={() => setHomepageMenuMode('services-list')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  homepageMenuMode === 'services-list'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <List className={`w-8 h-8 ${
                    homepageMenuMode === 'services-list' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    homepageMenuMode === 'services-list' ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    Services List
                  </span>
                  <span className="text-xs text-gray-500 text-center">
                    Show services with prices
                  </span>
                </div>
              </button>

              {/* Menu Images Option */}
              <button
                onClick={() => setHomepageMenuMode('menu-images')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  homepageMenuMode === 'menu-images'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className={`w-8 h-8 ${
                    homepageMenuMode === 'menu-images' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    homepageMenuMode === 'menu-images' ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    Menu Flipbook
                  </span>
                  <span className="text-xs text-gray-500 text-center">
                    Show menu images
                  </span>
                </div>
              </button>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Current mode:</strong> {homepageMenuMode === 'services-list' ? 'Services List' : 'Menu Flipbook'}
              </p>
            </div>

            {/* Preview Links */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/menu', '_blank')}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Menu Flipbook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/services', '_blank')}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Services List
              </Button>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleSaveMenuMode}
                disabled={savingMenuMode}
                className="bg-primary hover:bg-primary/90 text-white font-medium shadow-sm"
              >
                {savingMenuMode ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Developer Tools Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Developer Tools
            </CardTitle>
            <CardDescription className="text-gray-500">
              Advanced tools for debugging and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/admin/debug-data')}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
            >
              <Bug className="h-4 w-4 mr-2" />
              Database Debug Panel
            </Button>
          </CardContent>
        </Card>

        {/* Chatbot Settings Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Chatbot Settings
            </CardTitle>
            <CardDescription className="text-gray-500">
              Configure the chatbot for customer interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChatbotSettings 
              avatarUrl={chatbotAvatar}
              avatarPath={chatbotAvatarPath}
              onAvatarUpdate={(url, path) => {
                setChatbotAvatar(url);
                setChatbotAvatarPath(path);
              }}
            />
            
            {/* Save Button */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button
                onClick={handleSaveChatbot}
                disabled={savingChatbot}
                className="bg-primary hover:bg-primary/90 text-white font-medium shadow-sm"
              >
                {savingChatbot ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
    );
}