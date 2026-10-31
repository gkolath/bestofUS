// UsTwo visual identity: a late-evening palette of plum-black neutrals, garnet and champagne.
// Remaps Tailwind's color names so the existing utility classes pick up the new look.
// Not loaded by the page: tailwind.config.js reads it when building css/tailwind.css.
(function () {
  const theme = {
    colors: {
      // Neutrals with a plum bias (replaces Tailwind's slate)
      slate: { 50: '#faf7f7', 100: '#f3eeee', 200: '#e4dbdd', 300: '#cbbfc4', 400: '#a8979f', 500: '#7d6a77', 600: '#574556', 700: '#3a2c39', 800: '#251b25', 900: '#17111a', 950: '#0d090c' },
      // Garnet: the main accent
      rose: { 50: '#fbeef1', 100: '#f6d9df', 200: '#efbcc6', 300: '#e49aab', 400: '#d36f87', 500: '#b94a66', 600: '#9c3552', 700: '#7d2842', 800: '#5e1e32', 900: '#3d1421', 950: '#240b14' },
      fuchsia: { 50: '#fbeef1', 100: '#f6d9df', 200: '#efbcc6', 300: '#e49aab', 400: '#d36f87', 500: '#b94a66', 600: '#9c3552', 700: '#7d2842', 800: '#5e1e32', 900: '#3d1421', 950: '#240b14' },
      // Champagne gold: the second partner and quiet highlights (replaces teal)
      teal: { 50: '#fbf6ec', 100: '#f4e8d0', 200: '#ead5ad', 300: '#dcbf8a', 400: '#c9a66b', 500: '#b08c52', 600: '#8f7040', 700: '#6e5531', 800: '#4d3b22', 900: '#2e2314', 950: '#1a140b' },
      // Dusky mauve for the coach (replaces violet)
      violet: { 50: '#f6f1f8', 100: '#ebe0f0', 200: '#d6c2e0', 300: '#bea0cd', 400: '#a07cb4', 500: '#83609a', 600: '#6a4c80', 700: '#533b65', 800: '#3b2a48', 900: '#261b2f', 950: '#170f1d' },
      // Copper for rituals and challenges (replaces orange)
      orange: { 50: '#fbf1ea', 100: '#f5dfd0', 200: '#eac1a5', 300: '#dca07b', 400: '#c98257', 500: '#ad6841', 600: '#8c5233', 700: '#6b3f28', 800: '#4a2c1c', 900: '#2e1b11', 950: '#1b1009' }
    },
    fontFamily: {
      sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      serif: ['"Cormorant Garamond"', 'Georgia', 'serif']
    }
  };
  window.USTWO_THEME = theme;
  // Read by tailwind.config.js at build time.
})();
