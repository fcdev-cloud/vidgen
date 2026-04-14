// Helpers
export function testUsername(username) {
    let feedback = { errors: [] };
    if(!username) {
        return feedback;
    }
    const usernameRegex = /^[a-zA-Z0-9]{5,}$/;
    if(!usernameRegex.test(username)) {
        feedback.errors.push('Username must contain at least 5 alphanumeric characters.');
    }

    return feedback;
}

export function testPassword(password = '', passwordConfirmation) {
    let feedback = { score: 0, errors: [] };
    if (!password) return feedback;

    const checks = [
        { regex: /[A-Z]/, msg: 'Password must contain a capital letter.' },
        { regex: /[^a-zA-Z0-9]/, msg: 'Password must contain a special character.' },
        { regex: /[0-9]/, msg: 'Password must contain a number.' },
        { regex: /^.{8,}$/, msg: 'Password must contain at least 8 characters.' },
    ];

    checks.forEach(check => {
        if (!check.regex.test(password)) feedback.errors.push(check.msg);
    });

    feedback.score = 4 - feedback.errors.length;
    return feedback;
}

export function testPasswordConfirmation(password, passwordConfirmation) {
     let feedback = { score: 0, errors: [] };
    if (!password || !passwordConfirmation) return feedback;
    if (password !== passwordConfirmation) {
        feedback.errors.push('Password and password confirmation must match.');
    }

    return feedback;
}

export function testEmail(email) {
    const feedback = { errors: [] };
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/gi;
    if (email && !emailRegex.test(email)) {
        feedback.errors.push('Email is not valid.');
    }
    return feedback;
}
