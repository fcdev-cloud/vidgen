"use client";
import LogoutButton from './logout';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Navigation({session}) {
    //navState
    const [toggle, setToggle] = useState(false); 
    const isOpenClass = toggle ? 'open' : '';
    const navRef = useRef(null);

    useEffect(() => {
        // Function to check if the click was outside
        const handleClickOutside = (event) => {
            if (toggle && navRef.current && !navRef.current.contains(event.target)) {
                setToggle(false);
            }
        };

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [toggle]);

    return(
        <>
        <nav  className={`header__nav ${isOpenClass}`}>
            <div ref={navRef} className="header__nav__container">
                <div className="header__nav__mobile-menu-bar">
                    <button 
                    onClick={() => {
                        setToggle(!toggle);
                    }}
                    type="button" className="mobile-menu-close">
                        <span>&times;</span>
                    </button>
                </div>
                <ul>
                    <li><Link 
                    onClick={() => {
                        setToggle(false);
                    }}
                    href="/" className="header__link">Video Feed</Link></li>
                    {session?.user?.name && (
                        <>
                            <li><Link 
                            onClick={() => {
                                setToggle(false);
                            }}
                            href={`/profile/${session.user.name.toLowerCase()}`} className="header__link">My Profile</Link></li>
                        </>
                    )}
                    {!session?.user?.ID ? (
                        <>
                            <li><Link 
                            onClick={() => {
                                setToggle(false);
                            }}
                            href="/login" className="button">Login</Link></li>
                            <li><Link 
                            onClick={() => {
                                setToggle(false);
                            }}
                            href="/signup" className="button">Sign Up</Link></li>
                        </>
                    ):(
                        <li><LogoutButton /></li>
                    )}
                    
                    
                </ul>
            </div>
        </nav>
        <button type="button" 
        onClick={() => {
            setToggle(!toggle);
        }}
        className="header__mobile-toggle">
            <span className="header__mobile-toggle__pip"></span>
            <span className="header__mobile-toggle__pip"></span>
            <span className="header__mobile-toggle__pip"></span>
        </button>
        </>
    );
}