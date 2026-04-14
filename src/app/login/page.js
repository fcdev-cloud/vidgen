import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import LoginMessage from "@/components/LoginMessage";
import { Suspense } from "react";


export default async function LoginPage() {
    const session = await getServerSession(authOptions);
    
    // If session exists, kick them to their profile immediately
    if (session?.user?.name) {
        redirect(`/profile/${session.user.name.toLowerCase()}`);
    }


    return (
    <div className="signup">
            <div className="signup__content">
                <Suspense fallback={<p>Loading...</p>}>
                    <LoginMessage />
                </Suspense>
            </div>
            <div className="signup__form">
                <LoginForm />
            </div>
    </div>    
    );
}