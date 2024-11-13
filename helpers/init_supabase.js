const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Check the connection to Supabase
async function checkConnection() {
    try {
        const { data, error } = await supabase
            .from('users') // Ensure the table exists in your Supabase schema
            .select('*')  // Attempt to select the 'id' column
            .limit(1);  // Limit to just one record

        if (error) {
            throw new Error(error.message); // More descriptive error handling
        }

        console.log('Successfully connected to Supabase:)');
    } catch (err) {
        console.error('Error connecting to Supabase:', err.message);
    }
}

// Call the checkConnection function
checkConnection();

// Handle process exit
process.on('SIGINT', async () => {
    console.log('Disconnecting from Supabase...');
    process.exit(0);
});


module.exports = supabase;
