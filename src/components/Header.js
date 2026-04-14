import Link from 'next/link';
import '@/styles/header.scss';
import Logo from '@/components/Logo';
import LogoutButton from './logout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function Header(){
    const session = await getServerSession(authOptions);
    console.log(session);
    return (
        <header className="header">
            <div className="header__container">
                <div className="header__logo__container">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>


                <nav className="header__nav">
                    <ul>
                        <li><Link href="/" className="header__link">Video Feed</Link></li>
                        {session?.user?.name && (
                            <>
                                <li><Link href={`/profile/${session.user.name.toLowerCase()}`} className="header__link">My Profile</Link></li>
                            </>
                        )}
                        {!session?.user?.ID ? (
                            <>
                                <li><Link href="/login" className="button">Login</Link></li>
                                <li><Link href="/signup" className="button">Sign Up</Link></li>
                            </>
                        ):(
                            <li><LogoutButton /></li>
                        )}
                        
                        
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;