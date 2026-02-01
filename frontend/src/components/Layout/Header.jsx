import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PlusCircle, User, LogOut, Moon, Sun, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import Button from '../ui/Button';
import './Header.css';

const Header = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme, language, setLanguage, t } = useSettings();

    const languages = [
        { code: 'ru', label: 'RU' },
        { code: 'en', label: 'EN' },
        { code: 'tj', label: 'TJ' }
    ];

    return (
        <header className="header">
            <div className="container header-container">
                <Link to="/" className="header-logo">
                    Yakjo
                </Link>

                <nav className="header-nav">
                    <Link to="/search" className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}>
                        <Search size={20} />
                        <span>{t('nav.search')}</span>
                    </Link>

                    {user && (
                        <Link to="/publish" className={`nav-link ${location.pathname === '/publish' ? 'active' : ''}`}>
                            <PlusCircle size={20} />
                            <span>{t('nav.publish')}</span>
                        </Link>
                    )}

                    <Link to="/about" className="nav-link">{t('nav.about')}</Link>
                    <Link to="/contact" className="nav-link">{t('nav.contact')}</Link>
                </nav>

                <div className="header-actions">
                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="icon-btn" title="Toggle Theme">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Custom Language Selector */}
                    <div className="custom-lang-selector">
                        <button
                            className="lang-trigger"
                            onClick={() => {
                                const menu = document.getElementById('lang-menu');
                                if (menu) menu.classList.toggle('open');
                            }}
                            onBlur={() => {
                                // Delay hide to allow click
                                setTimeout(() => {
                                    const menu = document.getElementById('lang-menu');
                                    if (menu) menu.classList.remove('open');
                                }, 200);
                            }}
                        >
                            <Globe size={18} className="lang-icon" />
                            <span className="current-lang">{language.toUpperCase()}</span>
                        </button>

                        <div id="lang-menu" className="lang-menu">
                            {languages.map(lang => (
                                <div
                                    key={lang.code}
                                    className={`lang-option ${language === lang.code ? 'selected' : ''}`}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        const menu = document.getElementById('lang-menu');
                                        if (menu) menu.classList.remove('open');
                                    }}
                                >
                                    {lang.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="actions-divider"></div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile" className="profile-link">
                                <div className="avatar-placeholder">
                                    {user.avatarUrl ? <img src={user.avatarUrl} alt="Me" /> : <User size={20} />}
                                </div>
                                <span className="user-name">{user.firstName}</span>
                            </Link>
                            <button
                                onClick={logout}
                                className="logout-icon-btn"
                                title={t('nav.logout')}
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/auth">
                                <Button variant="ghost" size="sm">{t('nav.login')}</Button>
                            </Link>
                            <Link to="/auth">
                                <Button variant="primary" size="sm">{t('nav.register')}</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
