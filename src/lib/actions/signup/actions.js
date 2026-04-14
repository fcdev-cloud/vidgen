"use server"
import pool from '@/lib/db';
import bcrypt from "bcryptjs";

import { testUsername, testEmail,testPassword,testPasswordConfirmation } from '@/lib/validation/user';

export async function createUserAction(formData) {
    let errors = {
        'username': {errors:[]},
        'email': {errors:[]},
        'password': {errors:[]},
        'passwordConfirm': {errors:[]},
        'other': {errors:[]}
    };
    // vaidate Data
    const username = formData.get('username');
    const email = formData.get('email')
    const password = formData.get('password');
    const passwordConfirm = formData.get('confirm-password');
    const usernameTest = testUsername(username);
    const emailTest = testEmail(email);
    const passwordTest = testPassword(password);
    const passwordConfirmTest = testPasswordConfirmation(password, passwordConfirm);
    let newUserId = null;
    let allValid = true;

    if(!username.trim()) {
        errors.username.errors.push('Please enter a username.');
        allValid = false;
    } else if(usernameTest.errors.length > 0) {
        errors.username = usernameTest;
        allValid = false;
    }
    
    // Check if username exists
    let [rows] =  await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );

    if(rows.length > 0) {
        errors.username.errors.push('Username already exist.');
        allValid = false;
    }

    if(!email) {
        errors.email.errors.push('Please enter an email.');
        allValid = false;
    } else if(emailTest.errors.length > 0) {
        errors.email = emailTest;
        allValid = false;
    }

    //Check if email exists
    [rows] =  await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    if(rows.length > 0) {
        errors.email.errors.push('Email already exist.');
        allValid = false;
    }

    if(!password) {
        errors.password.errors.push('Please enter a valid password.');
        allValid = false;
    } else if(passwordTest.errors.length > 0) {
        errors.password = passwordTest;
        allValid = false;
    }

    if(!passwordConfirm) {
        errors.passwordConfirm.errors.push('Password and password confirmation must match.');
        allValid = false;
    } else if(passwordConfirmTest.errors.length > 0) {
        errors.passwordConfirm = passwordConfirmTest;
        allValid = false;
    }

    if (allValid) {
        try {
            // Salt and hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert into the DB
            const [result] = await pool.execute(
                'INSERT INTO users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, 2]
            );

            newUserId = result.insertId;

            return { success: true, user: {ID: newUserId, username: username.toLowerCase()} };
        } catch (dbError) {
            console.error("Database Error:", dbError);
            errors.other.errors.push('Failed to add user.');
            return { success: false, errors: errors };
        }
    } else {
        return { success: false, errors: errors };
    }
}