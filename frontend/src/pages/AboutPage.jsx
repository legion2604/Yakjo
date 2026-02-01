import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
    return (
        <div className="about-page container">
            <section className="about-hero">
                <h1>О Yakjo</h1>
                <p>Мы объединяем людей, чтобы сделать путешествия по Таджикистану доступнее, удобнее и экологичнее.</p>
            </section>

            <section className="about-content">
                <div className="about-block">
                    <h2>Наша миссия</h2>
                    <p>
                        Yakjo создан, чтобы каждый житель Таджикистана мог легко найти попутчиков для дальних поездок.
                        Мы верим, что совместные поездки - это не только экономия, но и новые знакомства, а также забота об экологии.
                    </p>
                </div>

                <div className="about-stats">
                    <div className="stat-card">
                        <span className="stat-number">1000+</span>
                        <span className="stat-label">Поездок в месяц</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">5000+</span>
                        <span className="stat-label">Пользователей</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">10+</span>
                        <span className="stat-label">Городов</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
