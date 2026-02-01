import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Camera, User as UserIcon, Mail, Calendar, Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/ui/Button';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useSettings();

    // Fallback data if user is missing some fields
    const userData = {
        firstName: user?.firstName || '...',
        lastName: user?.lastName || '...',
        phone: user?.phone || '...',
        email: user?.email || '—',
        birthDate: user?.birthDate || '—',
        carBrand: user?.carBrand || '—',
        bio: user?.bio || '',
        avatarUrl: user?.avatarUrl || null,
        rating: user?.rating || 5.0,
        isVerified: user?.isVerified ?? true
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <div className="profile-page container">
            <div className="profile-layout">
                <aside className="profile-sidebar">
                    <div className="profile-card user-card">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar">
                                {userData.avatarUrl ? (
                                    <img src={userData.avatarUrl} alt={userData.firstName} />
                                ) : (
                                    <span>{userData.firstName[0]}</span>
                                )}
                            </div>
                            <button className="edit-avatar-btn">
                                <Camera size={16} />
                            </button>
                        </div>

                        <h2 className="profile-name">{userData.firstName} {userData.lastName}</h2>

                        {userData.isVerified && (
                            <div className="verified-badge">
                                <Shield size={16} />
                                <span>{t('profile.verified')}</span>
                            </div>
                        )}

                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-value">{userData.rating}</span>
                                <span className="stat-label">{t('profile.stats.rating')}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">0</span>
                                <span className="stat-label">{t('profile.stats.rides')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-menu">
                        <Button variant="ghost" className="menu-btn logout-btn" onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>{t('profile.logout')}</span>
                        </Button>
                    </div>
                </aside>

                <main className="profile-content">
                    <div className="section-card">
                        <h3 className="section-title">{t('profile.personalInfo')}</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label><UserIcon size={14} /> {t('register.firstName')}</label>
                                <div className="info-value">{userData.firstName}</div>
                            </div>
                            <div className="info-item">
                                <label><UserIcon size={14} /> {t('register.lastName')}</label>
                                <div className="info-value">{userData.lastName}</div>
                            </div>
                            <div className="info-item">
                                <label><Calendar size={14} /> {t('register.birthDate')}</label>
                                <div className="info-value">{userData.birthDate}</div>
                            </div>
                            <div className="info-item">
                                <label><Mail size={14} /> {t('register.email')}</label>
                                <div className="info-value">{userData.email}</div>
                            </div>
                            <div className="info-item">
                                <label><Car size={14} /> {t('register.carBrand')}</label>
                                <div className="info-value">{userData.carBrand}</div>
                            </div>
                        </div>

                        {userData.bio && (
                            <div className="bio-section mt-6">
                                <label>{t('register.bio')}</label>
                                <p className="bio-text">{userData.bio}</p>
                            </div>
                        )}

                        <Button variant="outline" size="sm" className="mt-6">{t('profile.edit')}</Button>
                    </div>

                    <div className="section-card">
                        <h3 className="section-title">{t('profile.trips')}</h3>
                        <div className="empty-trips">
                            <p>{t('profile.noTrips')}</p>
                            <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/publish')}>
                                {t('publish.button')}
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
