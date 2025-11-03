// netlify/login-handler.js

// IMPORTANT: Credentials must be loaded from a SECURE environment variable!
// This variable (SECURE_USER_CREDS) is set in the Netlify UI, NOT in the code.
const SECURE_USERS = JSON.parse(process.env.SECURE_USER_CREDS || '{}'); 

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        // This check happens securely on the Netlify server
        if (SECURE_USERS[username] && SECURE_USERS[username] === password) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true })
            };
        } else {
            return {
                statusCode: 401, // Unauthorized
                body: JSON.stringify({ success: false, message: "Check username or password." })
            };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Server error.' })
        };
    }
};
