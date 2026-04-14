'use client';
import '@/styles/signup.scss';
import { useState, useEffect, useActionState, startTransition } from 'react';
import { signIn } from 'next-auth/react';

export default function loginForm() {
    const [user, setUser] = useState({ email: '',password:''});
    const [validationErrors, setValidationErrors] = useState({
            email: {errors: []},
            password: {score:0, errors:[]},
            other: {errors: []}
        }
    );

        // Handle Server action response
    const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
        const email = formData.get('email');
        const password = formData.get('password');

        // We call signIn directly here instead of a separate server action
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            // Return an object that matches your state structure
            return {
                success: false,
                errors: {
                    other: { errors: ['Invalid email or password.'] }
                }
            };
        }

        // If successful, manually redirect
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user?.name) {
            // Redirect to Profile
            window.location.href = `/profile/${session.user.name}`;
        }

        return { success: true };
    }, null);

    // Add or remove errors on state change
    useEffect(() => {
        if (!state || !state.errors) return;

        setValidationErrors({
            email: state.errors.email || { errors: [] },
            password: state.errors.password || { score:0, errors: [] },
            other: state.errors.other || { errors: [] }
        });
    }, [state]);


    return (
        <form action={formAction}>
            {validationErrors.other.errors.length > 0 && (
                <ul className="errors">
                    {validationErrors.other.errors.map((error, i) => (
                        <li key={i} >{error}</li>
                    ))}
                </ul>
            )}
            <div className="form-section">
                <label htmlFor="email">Email</label>
                {validationErrors.email.errors.length > 0 && (
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
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
            </div>

            <div className="form-section">
                <label htmlFor="password">Password</label>
                {/* Only show errors if password field was blurred */}
                {validationErrors.password.errors.length > 0 && (
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
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                />
            </div>


            <div className="form-section">
                <button type="submit" 
                className="button" 
                disabled={false}
                >
                    Log In
                </button>
            </div>
        </form>
    );
}