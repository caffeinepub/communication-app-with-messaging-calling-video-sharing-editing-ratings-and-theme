import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useInternetIdentity } from './useInternetIdentity';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  accentOrange?: string;
  accentCoral?: string;
  accentPurple?: string;
  accentTeal?: string;
  accentRose?: string;
  accentIndigo?: string;
}

interface ThemePreset {
  name: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  warm: {
    name: 'Warm Sunset',
    colors: {
      primary: '0.65 0.18 35',
      secondary: '0.75 0.15 55',
      accent: '0.70 0.20 25',
      accentOrange: '0.68 0.20 35',
      accentCoral: '0.72 0.18 15',
    },
  },
  cool: {
    name: 'Ocean Breeze',
    colors: {
      primary: '0.60 0.15 220',
      secondary: '0.70 0.12 200',
      accent: '0.65 0.18 240',
      accentOrange: '0.62 0.16 210',
      accentCoral: '0.68 0.14 230',
    },
  },
  forest: {
    name: 'Forest Green',
    colors: {
      primary: '0.55 0.16 150',
      secondary: '0.65 0.14 130',
      accent: '0.60 0.18 170',
      accentOrange: '0.58 0.15 140',
      accentCoral: '0.62 0.17 160',
    },
  },
  coral: {
    name: 'Coral Reef',
    colors: {
      primary: '0.68 0.20 15',
      secondary: '0.72 0.16 35',
      accent: '0.70 0.22 5',
      accentOrange: '0.68 0.20 15',
      accentCoral: '0.70 0.22 5',
    },
  },
  lavender: {
    name: 'Lavender Dream',
    colors: {
      primary: '0.65 0.18 290',
      secondary: '0.72 0.14 310',
      accent: '0.68 0.20 270',
      accentOrange: '0.70 0.16 300',
      accentCoral: '0.66 0.19 280',
      accentPurple: '0.62 0.22 285',
    },
  },
  midnight: {
    name: 'Midnight Blue',
    colors: {
      primary: '0.50 0.20 250',
      secondary: '0.60 0.16 230',
      accent: '0.55 0.22 270',
      accentOrange: '0.58 0.18 240',
      accentCoral: '0.52 0.21 260',
      accentIndigo: '0.48 0.24 255',
    },
  },
  sunset: {
    name: 'Desert Sunset',
    colors: {
      primary: '0.70 0.22 30',
      secondary: '0.75 0.18 50',
      accent: '0.72 0.24 10',
      accentOrange: '0.68 0.26 25',
      accentCoral: '0.74 0.20 15',
      accentRose: '0.66 0.23 5',
    },
  },
  mint: {
    name: 'Fresh Mint',
    colors: {
      primary: '0.68 0.16 165',
      secondary: '0.75 0.12 180',
      accent: '0.70 0.18 150',
      accentOrange: '0.72 0.14 170',
      accentCoral: '0.66 0.17 155',
      accentTeal: '0.64 0.19 160',
    },
  },
  cherry: {
    name: 'Cherry Blossom',
    colors: {
      primary: '0.72 0.20 350',
      secondary: '0.78 0.16 10',
      accent: '0.74 0.22 340',
      accentOrange: '0.70 0.18 355',
      accentCoral: '0.76 0.21 345',
      accentRose: '0.68 0.24 335',
    },
  },
  amber: {
    name: 'Amber Glow',
    colors: {
      primary: '0.62 0.24 45',
      secondary: '0.70 0.20 60',
      accent: '0.65 0.26 35',
      accentOrange: '0.60 0.28 40',
      accentCoral: '0.68 0.22 50',
    },
  },
};

export function useThemePreference() {
  const { theme: mode, setTheme: setMode } = useTheme();
  const { identity } = useInternetIdentity();
  const [colorTheme, setColorTheme] = useState<keyof typeof THEME_PRESETS>('coral');

  useEffect(() => {
    // Load saved theme preference
    if (identity) {
      const saved = localStorage.getItem(`theme-${identity.getPrincipal().toString()}`);
      if (saved && saved in THEME_PRESETS) {
        setColorTheme(saved as keyof typeof THEME_PRESETS);
      }
    }
  }, [identity]);

  useEffect(() => {
    // Apply theme colors to CSS variables
    const preset = THEME_PRESETS[colorTheme];
    const root = document.documentElement;

    root.style.setProperty('--primary', preset.colors.primary);
    root.style.setProperty('--secondary', preset.colors.secondary);
    root.style.setProperty('--accent', preset.colors.accent);
    
    // Apply additional accent colors if defined
    if (preset.colors.accentOrange) {
      root.style.setProperty('--accent-orange', preset.colors.accentOrange);
    }
    if (preset.colors.accentCoral) {
      root.style.setProperty('--accent-coral', preset.colors.accentCoral);
    }
    if (preset.colors.accentPurple) {
      root.style.setProperty('--accent-purple', preset.colors.accentPurple);
    }
    if (preset.colors.accentTeal) {
      root.style.setProperty('--accent-teal', preset.colors.accentTeal);
    }
    if (preset.colors.accentRose) {
      root.style.setProperty('--accent-rose', preset.colors.accentRose);
    }
    if (preset.colors.accentIndigo) {
      root.style.setProperty('--accent-indigo', preset.colors.accentIndigo);
    }
  }, [colorTheme]);

  const setThemePreference = (theme: keyof typeof THEME_PRESETS) => {
    setColorTheme(theme);
    if (identity) {
      localStorage.setItem(`theme-${identity.getPrincipal().toString()}`, theme);
    }
  };

  return {
    mode,
    setMode,
    colorTheme,
    setColorTheme: setThemePreference,
    presets: THEME_PRESETS,
  };
}
