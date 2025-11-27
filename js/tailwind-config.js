/* OGVision - Tailwind Konfigürasyonu */

tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                ek: {
                    dark: '#0f172a',  // Slate 900
                    card: '#1e293b',  // Slate 800
                    primary: '#00A651', // Emlak Konut Green
                    secondary: '#38bdf8', // Sky Blue
                    surface: '#334155' // Slate 700
                }
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        }
    }
}
