import Link from 'next/link';
import '@/styles/header.scss';
import Logo from '@/components/Logo';
import Navigation from './Navigation';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function Header(){
    const session = await getServerSession(authOptions);
    return (
        <header className="header">
            <div className="header__container">
                <div className="header__logo__container">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>
                <Suspense>
                    <Navigation session={session}/>
                </Suspense>
            </div>
        </header>
    );
}

export default Header;