import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
    cyan: {
        name: 'Cyan',
        primaryColor: '#00ccff',
        primarySecondColor: '#3a7bd5',
        primaryRgb: '0, 204, 255'
    },
    purple: {
        name: 'Neon Purple',
        primaryColor: '#b026ff',
        primarySecondColor: '#5c258d',
        primaryRgb: '176, 38, 255'
    },
    emerald: {
        name: 'Emerald Green',
        primaryColor: '#00ff87',
        primarySecondColor: '#60efff',
        primaryRgb: '0, 255, 135'
    },
    crimson: {
        name: 'Crimson Red',
        primaryColor: '#ff416c',
        primarySecondColor: '#ff4b2b',
        primaryRgb: '255, 65, 108'
    },
    gold: {
        name: 'Gold',
        primaryColor: '#ffd700',
        primarySecondColor: '#f8b500',
        primaryRgb: '255, 215, 0'
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('cyan');

    useEffect(() => {
        const stored = localStorage.getItem('appTheme') || 'cyan';
        applyTheme(stored);
    }, []);

    const applyTheme = (themeKey) => {
        const t = THEMES[themeKey] || THEMES.cyan;
        document.documentElement.style.setProperty('--primary-color', t.primaryColor);
        document.documentElement.style.setProperty('--primary-second-color', t.primarySecondColor);
        document.documentElement.style.setProperty('--primary-rgb', t.primaryRgb);
        document.documentElement.style.setProperty(
            '--primary-gradient',
            `linear-gradient(135deg, ${t.primaryColor} 0%, ${t.primarySecondColor} 100%)`
        );
        setTheme(themeKey);
        localStorage.setItem('appTheme', themeKey);
    };

    return (
        <ThemeContext.Provider value={{ theme, applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
