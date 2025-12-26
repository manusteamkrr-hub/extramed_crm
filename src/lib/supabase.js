import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// Check if credentials are properly configured
const isConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://dummy.supabase.co' && 
  !supabaseAnonKey?.includes('dummy');

if (!isConfigured) {
  console.warn('⚠️ Supabase credentials not configured. Using demo mode.');
  console.info('📋 To connect to your database:');
  console.info('   1. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
  console.info('   2. Run DATABASE_SCHEMA.sql in Supabase SQL Editor');
  console.info('   3. Restart development server: npm run dev');
  console.info('   4. See SUPABASE_SETUP_GUIDE.md for detailed instructions');
} else {
  console.log('✅ Supabase credentials detected');
  console.log('📊 Connecting to database...');
  console.log('💡 If you see errors, run DATABASE_SCHEMA.sql in Supabase SQL Editor');
  console.log('📖 See SUPABASE_SETUP_GUIDE.md for setup instructions');
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);

// Test connection and provide helpful feedback
if (isConfigured) {
  supabase?.from('patients')?.select('count', { count: 'exact', head: true })?.then(({ error, count }) => {
      if (error) {
        if (error?.code === 'PGRST204' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
          console.error('❌ Database tables not found!');
          console.info('🔧 Solution: Run DATABASE_SCHEMA.sql in Supabase SQL Editor');
          console.info('📖 See SUPABASE_SETUP_GUIDE.md for detailed setup instructions');
        } else {
          console.error('❌ Database connection error:', error?.message);
          console.info('💡 Check your Supabase project status and credentials');
        }
      } else {
        console.log('✅ Connected to Supabase successfully');
        console.log(`📊 Database contains ${count || 0} patients`);
        if (count === 0) {
          console.info('💡 Tip: Run DATABASE_SCHEMA.sql to add sample patient data');
        }
      }
    });
}

export default supabase;