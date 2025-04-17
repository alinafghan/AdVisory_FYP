module.exports = {
  content: ['./src/**/*.{html,ts,css}'],
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
      },
    },
  },
  plugins: [],
}
