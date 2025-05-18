function validateAuthBody(body) {
    if (!body?.username || typeof body.username !== 'string' || body.username.trim().length === 0) {
        return { ok: false, message: 'Username is required' };
    }

    if (!body?.password || typeof body.password !== 'string' || body.password.trim().length === 0) {
        return { ok: false, message: 'Password is required' };
    }

    return { ok: true };
}

module.exports = { validateAuthBody };
