'use client';
import '@/styles/signup.scss';
import { useState, useEffect, useActionState, startTransition } from 'react';
import { signIn } from 'next-auth/react'
import { createUserAction } from '@/lib/actions/signup/actions';
import { testUsername, testEmail, testPassword, testPasswordConfirmation } from '@/lib/validation/user';

export default function SignUpForm() {
    const [user, setUser] = useState({ username: '', email: '',password:'', passwordConfirm:'' });
    const [validationErrors, setValidationErrors] = useState({
            username: {errors: []},
            email: {errors: []},
            password: {score:0, errors:[]},
            passwordConfirm: {errors: []},
            other: {errors: []}
        }
    );
    // Track which fields have been blurred
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        passwordConfirm: false
    });

    // Handle Server action response
    const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
        const result = await createUserAction(formData);
        
        if (result.success) {
            // login upon signup success
            await signIn('credentials', {
                email: formData.get('email'),
                password: formData.get('password'),
                callbackUrl: `/profile/${result.user.username}`, // Where they go after login
            });
        }
        return result;
    }, null);

    // Use effect for client validation
    useEffect(() => {
    setValidationErrors({
        username: touched.username ? testUsername(user.username) : { errors: [] },
        email: touched.email ? testEmail(user.email) : { errors: [] },
        password: touched.password ? testPassword(user.password) : { score:0, errors: [] },
        passwordConfirm: touched.passwordConfirm 
            ? testPasswordConfirmation(user.password, user.passwordConfirm) 
            : { errors: [] },
        other: { errors: [] }
    });
    }, [user, touched]);

    // Overwrite Client Validation when server action returns
    useEffect(() => {
        if (!state || !state.errors) return;

        setValidationErrors({
            username: state.errors.username || { errors: [] },
            email: state.errors.email || { errors: [] },
            password: state.errors.password || { score:0, errors: [] },
            passwordConfirm: state.errors.passwordConfirm || { errors: [] },
            other: state.errors.other || { errors: [] }
        });
    }, [state]);

    function allValid() {
        return (
            user.username && testUsername(user.username).errors.length === 0 &&
            user.email && testEmail(user.email).errors.length === 0 &&
            user.password && testPassword(user.password).errors.length === 0 &&
            testPasswordConfirmation(user.password, user.passwordConfirm).errors.length === 0
        );
    }

    // Generic blur handler
    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    return (
        <form action={formAction}>
                    <div className="form-section">
                        <label htmlFor="username">Username</label>
                        {touched.username && validationErrors.username.errors.length > 0 && (
                            <ul className="errors">
                                {validationErrors.username.errors.map((error, i) => (
                                    <li key={i} >{error}</li>
                                ))}
                            </ul>
                        )}
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={user.username}
                            onBlur={() => handleBlur('username')}
                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                        />
                    </div>

                    <div className="form-section">
                        <label htmlFor="email">Email</label>
                        {/* Only show errors if the field was blurred */}
                        {touched.email && validationErrors.email.errors.length > 0 && (
                            <ul className="errors">
                                {validationErrors.email.errors.map((error, i) => (
                                    <li key={i} >{error}</li>
                                ))}
                            </ul>
                        )}
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={user.email}
                            onBlur={() => handleBlur('email')}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                        />
                    </div>

                    <div className="form-section">
                        <label htmlFor="password">Password</label>
                        {/* Only show errors if password field was blurred */}
                        {touched.password && validationErrors.password.errors.length > 0 && (
                            <ul className="errors">
                                {validationErrors.password.errors.map((error, i) => (
                                    <li key={i}>{error}</li>
                                ))}
                            </ul>
                        )}
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={user.password}
                            onBlur={() => handleBlur('password')}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                        />
                        <div className="password-strength-section">
                            <div className={`password-strength password-strength__${validationErrors.password.score}`}>
                                <span className="password-strength__pip"></span>
                                <span className="password-strength__pip"></span>
                                <span className="password-strength__pip"></span>
                                <span className="password-strength__pip"></span>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        {touched.passwordConfirm && validationErrors.passwordConfirm.errors.length > 0 && (
                            <ul className="errors">
                                {validationErrors.passwordConfirm.errors.map((error, i) => (
                                    <li key={i} >{error}</li>
                                ))}
                            </ul>
                        )}
                        <input
                            type="password"
                            id="confirm-password"
                            name="confirm-password"
                            value={user.passwordConfirm}
                            onBlur={() => handleBlur('passwordConfirm')}
                            onChange={(e) => setUser({ ...user, passwordConfirm: e.target.value })}
                        />
                    </div>

                    <div className="form-section">
                        <button 
                        type="submit" 
                        className="button" 
                        disabled={!allValid()}
                        >
                            Sign Up
                        </button>
                    </div>
        </form>
    );
}