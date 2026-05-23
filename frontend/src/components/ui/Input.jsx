import React from 'react';
import './Input.css';

const Input = ({
    label,
    error,
    icon: Icon,
    className = '',
    type = 'text',
    options = [],
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
                {type === 'select' ? (
                    <select
                        className={`input-field ${error ? 'input-error' : ''} ${Icon ? 'input-with-icon' : ''}`}
                        {...props}
                    >
                        <option value="" disabled hidden>
                            {props.placeholder || 'Выберите...'}
                        </option>
                        {options.map((opt, idx) => (
                            <option key={idx} value={opt.value || opt}>
                                {opt.label || opt}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        className={`input-field ${error ? 'input-error' : ''} ${Icon ? 'input-with-icon' : ''}`}
                        {...props}
                    />
                )}
            </div>

            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
};

export default Input;
