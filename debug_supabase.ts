
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery() {
    console.log('Running query...');
    const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .limit(1);

    if (error) {
        console.error('Query Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('Query Success:', data);
    }
}

testQuery();
