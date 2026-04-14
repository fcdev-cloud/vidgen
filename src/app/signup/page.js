import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignUpForm from "@/components/SignUpForm";

export default async function SignupPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect(`/profile/${session.user.name.toLowerCase()}`);
    }

    return (
        <div className="signup">
            <div className="signup__content">
                <h1>Sign Up for VidGen</h1>
                <p>and start generating videos today!</p>
            </div>
            <div className="signup__form">
                <SignUpForm />
            </div>
        </div>
    );
}