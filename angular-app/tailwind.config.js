/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@spartan-ng/brain/hlm-tailwind-preset")],
  content: ["./src/**/*.{html,ts,css}", "./libs/ui/**/*.{html,ts}"],
  darkMode: 'class', // Enable dark mode via the 'dark' class
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        text: 'var(--text)',
        background: 'var(--background)',
      },
      backgroundImage: {
        'linear-primary-secondary': 'var(--linearPrimarySecondary)',
        'linear-primary-accent': 'var(--linearPrimaryAccent)',
        'linear-secondary-accent': 'var(--linearSecondaryAccent)',
        'radial-primary-secondary': 'var(--radialPrimarySecondary)',
        'radial-primary-accent': 'var(--radialPrimaryAccent)',
        'radial-secondary-accent': 'var(--radialSecondaryAccent)',
      },
      fontFamily: {
        lexand: ['General Sans', 'sans-serif'], // Use 'lexand' as the key
      },
      fontSize: {
        heading1: '3rem',
        heading2: '2.25rem',
        heading3: '1.75rem',
        smallText: '0.875rem',
        caption: '0.75rem',
      },
      fontWeight: {
        heading1Weight: '700',
        heading2Weight: '600',
        heading3Weight: '500',
        regularText: '400',
      },
      lineHeight: {
        headingLineHeight: '1.2',
        normalText: '1.5',
module.exports = {
  presets: [require("@spartan-ng/brain/hlm-tailwind-preset")],
  content: ["./src/**/*.{html,ts,css}", "./libs/ui/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        text: "var(--text)",
      },
      fontFamily: {
        lexand: ["General Sans", "sans-serif"], // Define your global font here
      },
      fontSize: {
        heading1: "3rem", // Custom font size for Heading 1
        heading2: "2.25rem", // Custom font size for Heading 2
        heading3: "1.75rem", // Custom font size for Heading 3
        smallText: "0.875rem", // Small text size
        caption: "0.75rem", // Caption text size
      },
      fontWeight: {
        heading1Weight: "700", // Font weight for Heading 1
        heading2Weight: "600", // Font weight for Heading 2
        heading3Weight: "500", // Font weight for Heading 3
        regularText: "400", // Regular text weight
      },
      lineHeight: {
        headingLineHeight: "1.2", // Line height for headings
        normalText: "1.5", // Line height for paragraphs
      },
    },
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        text: "var(--text)",
      },
      fontFamily: {
        lexand: ["General Sans", "sans-serif"], // Define your global font here
      },
      fontSize: {
        heading1: "3rem", // Custom font size for Heading 1
        heading2: "2.25rem", // Custom font size for Heading 2
        heading3: "1.75rem", // Custom font size for Heading 3
        smallText: "0.875rem", // Small text size
        caption: "0.75rem", // Caption text size
      },
      fontWeight: {
        heading1Weight: "700", // Font weight for Heading 1
        heading2Weight: "600", // Font weight for Heading 2
        heading3Weight: "500", // Font weight for Heading 3
        regularText: "400", // Regular text weight
      },
      lineHeight: {
        headingLineHeight: "1.2", // Line height for headings
        normalText: "1.5", // Line height for paragraphs
      },
    },
  },
  plugins: [],
<<<<<<< HEAD
};
=======
};
>>>>>>> 9cdd41d88121cafcd18fe38aa8fe58c340c1acd5
