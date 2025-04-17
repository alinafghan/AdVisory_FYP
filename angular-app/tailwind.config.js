/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,css}'],
  content: ["./src/**/*.{html,ts,css}"],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        text: 'var(--text)', 
      },
      fontFamily: {
        lexand: ['General Sans', 'sans-serif'], // Define your global font here
      },
      fontSize: {
        heading1: '3rem',    // Custom font size for Heading 1
        heading2: '2.25rem', // Custom font size for Heading 2
        heading3: '1.75rem', // Custom font size for Heading 3
        smallText: '0.875rem', // Small text size
        caption: '0.75rem',  // Caption text size
      },
      fontWeight: {
        heading1Weight: '700',  // Font weight for Heading 1
        heading2Weight: '600',  // Font weight for Heading 2
        heading3Weight: '500',  // Font weight for Heading 3
        regularText: '400',     // Regular text weight
      },
      lineHeight: {
        headingLineHeight: '1.2',  // Line height for headings
        normalText: '1.5',         // Line height for paragraphs
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
}