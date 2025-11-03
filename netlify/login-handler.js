// Import the Supabase client library
const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client using environment variables
// These variables must be set in your Netlify dashboard!
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event, context) => {
    // 1. Enforce POST method
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) 
        };
    }

    try {
        // 2. Parse the username and password from the request body
        const { username: emailOrUsername, password } = JSON.parse(event.body);

        // Note: Supabase primarily uses 'email' for signInWithPassword.
        // If your usernames are not email addresses, you may need a separate 
        // lookup function, but we'll try it as the 'email' field first for simplicity.
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailOrUsername,
            password: password,
        });

        if (error) {
            // 3. Handle login errors (e.g., Invalid login credentials)
            console.error('Supabase Auth Error:', error.message);
            return {
                statusCode: 401,
                body: JSON.stringify({ success: false, message: "Check username or password." })
            };
        }

        // 4. Successful login
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true,
                // You can optionally pass back user data here if needed
            })
        };

    } catch (error) {
        // Handle unexpected parsing errors or server issues
        console.error('Function execution error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Server error. Check Netlify logs.' })
        };
    }
};
