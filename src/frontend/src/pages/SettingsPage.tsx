import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useThemePreference, THEME_PRESETS } from '@/hooks/useThemePreference';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUpdateProfile } from '@/hooks/useProfileMutations';
import { Palette, Moon, Sun, User } from 'lucide-react';

export default function SettingsPage() {
  const { mode, setMode, colorTheme, setColorTheme, presets } = useThemePreference();
  const { data: currentUser } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
      setDisplayName(currentUser.displayName);
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedUsername || !trimmedDisplayName) {
      return;
    }

    const hasUsernameChanged = currentUser && trimmedUsername !== currentUser.username;
    const hasDisplayNameChanged = currentUser && trimmedDisplayName !== currentUser.displayName;

    if (!hasUsernameChanged && !hasDisplayNameChanged) {
      return;
    }

    await updateProfile.mutateAsync({
      username: hasUsernameChanged ? trimmedUsername : undefined,
      displayName: hasDisplayNameChanged ? trimmedDisplayName : undefined,
    });
  };

  const isProfileChanged = currentUser && (
    username.trim() !== currentUser.username ||
    displayName.trim() !== currentUser.displayName
  );

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto max-w-4xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Update your display name and username</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={updateProfile.isPending || !currentUser}
                />
                <p className="text-xs text-muted-foreground">
                  1-32 characters. This is how others will see your name.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={updateProfile.isPending || !currentUser}
                />
                <p className="text-xs text-muted-foreground">
                  3-32 characters. Letters, numbers, and underscores only.
                </p>
              </div>

              <Button
                type="submit"
                disabled={updateProfile.isPending || !currentUser || !isProfileChanged}
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how ConnectHub looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
              </div>
              <Switch
                checked={mode === 'dark'}
                onCheckedChange={(checked) => setMode(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Theme
            </CardTitle>
            <CardDescription>Choose your preferred color palette</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setColorTheme(key as keyof typeof THEME_PRESETS)}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    colorTheme === key
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-1">
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ background: `oklch(${preset.colors.primary})` }}
                      />
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ background: `oklch(${preset.colors.secondary})` }}
                      />
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ background: `oklch(${preset.colors.accent})` }}
                      />
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">{preset.name}</p>
                  {colorTheme === key && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-primary-foreground"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>ConnectHub v1.0.0</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A modern communications platform for messaging, calling, and video sharing.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
