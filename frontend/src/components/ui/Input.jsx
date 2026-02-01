import React from 'react';
import './Input.css';

const Input = ({
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}) => {
    return (
        <div className={`input-wrapper ${className}`}>
            {label && <label className="input-label">{label}</label>}

            <div className="input-container">
                {Icon && (
                    <div className="input-icon">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    className={`input-field ${error ? 'input-error' : ''} ${Icon ? 'input-with-icon' : ''}`}
                    {...props}
                />
            </div>

            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
};

export default Input;
