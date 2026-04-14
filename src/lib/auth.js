import CredentialsProvider from "next-auth/providers/credentials";
import pool from '@/lib/db';
import bcrypt from "bcryptjs";


export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // 1. Find user in MySQL
                const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [credentials.email]);
                const user = users[0];

                if (!user) return null;

                // 2. Check Bcrypt password
                const passwordsMatch = await bcrypt.compare(credentials.password, user.password_hash);

                if (!passwordsMatch) return null;

                // 3. Return user (this data goes into the JWT)
                return {
                    ID: user.ID,
                    name: user.username,
                    email: user.email
                };
            }
        })
    ],
    pages: {
        signIn: '/login', // The Login Page
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.ID;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // Now we pull the id we saved in the JWT callback
                session.user.ID = token.id; 
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
