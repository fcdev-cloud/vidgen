'use client';
import { signOut } from 'next-auth/react';

function LogoutButton() {
    return (
        <button className="button" onClick={() => signOut({ callbackUrl: '/' })}>
            Log Out
        </button>
    );
}

export default LogoutButton;