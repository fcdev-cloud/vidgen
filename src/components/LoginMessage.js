"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";


export default function LoginMessage() {
    const searchParams = useSearchParams();
    const isProhibited = searchParams.has('prompt_prohibited');

    return (
        <>
            {isProhibited ? (
                <>
                    <h1>You must be logged in to generate videos.</h1>
                    <p>Log in to VidGen and start generating videos today.</p>
                    <sub>No account? Sign up <Link href="/signup" className="underline">here!</Link></sub>
                </>
            ) : (
                <>
                    <h1>Login to Vidgen</h1>
                    <p>and start generating videos today!</p>
                </>
            )}
        </>
    );
}