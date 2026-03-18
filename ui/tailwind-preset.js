/**
 * DockLabs Tailwind CSS Preset
 * Shared design tokens for ct.one and future Tailwind-based projects.
 * Usage: import dockLabsPreset from '@docklabs/ui/tailwind-preset';
 */
export default {
  theme: {
    extend: {
      colors: {
        'ct-blue': '#1F64E5',
        'ct-dark-blue': '#00214D',
        'ct-bold-blue': '#003D9C',
        'ct-light-blue': '#C6D4FB',
        'ct-pale-blue': '#EBF0FF',
        'ct-orange': '#F27124',
        'ct-yellow': '#FAAA19',
        'ct-brown': '#BA5803',
        'ct-red': '#E91C1F',
        'ct-green': '#198754',
      },
      fontFamily: {
        heading: ['Poppins', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        btn: '0.5rem',
        card: '0.625rem',
      },
    },
  },
};
