import { createClient } from '@supabase/supabase-js';

// ✅ Support multiple environment variable naming conventions
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 
                    import.meta.env?.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env?.VITE_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
                        import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Track which env var is being used for better error messages
const anonKeySource = import.meta.env?.VITE_SUPABASE_ANON_KEY 
  ? 'VITE_SUPABASE_ANON_KEY'
  : import.meta.env?.VITE_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    ? 'VITE_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY' :'VITE_SUPABASE_ANON_KEY (not set)';

// 🔍 Check for actual placeholder patterns in runtime values
const isPlaceholder = (value) => {
  if (!value || typeof value !== 'string') return true;
  
  const trimmedValue = value?.trim();
  
  // Empty or very short values are placeholders
  if (trimmedValue?.length < 10) return true;
  
  // Common placeholder patterns
  const placeholderPatterns = [
    'your-',
    'dummy',
    'placeholder',
    'REPLACE',
    'example.com',
    'xxx',
    'test',
    'sample'
  ];
  
  const lowerValue = trimmedValue?.toLowerCase();
  return placeholderPatterns?.some(pattern => lowerValue?.includes(pattern));
};

// 🔍 Validate URL format
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const trimmedUrl = url?.trim();
  
  // Check if it's a valid Supabase URL pattern or general HTTPS URL
  if (trimmedUrl?.includes('.supabase.co') || trimmedUrl?.startsWith('https://')) {
    try {
      const parsedUrl = new URL(trimmedUrl);
      return parsedUrl?.protocol === 'https:' || parsedUrl?.protocol === 'http:';
    } catch {
      return false;
    }
  }
  
  return false;
};

// ✅ Simplified validation - trust platform-injected credentials
// Platform may mask credentials in .env but inject them at runtime
const isValidAnonKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  const trimmedKey = key?.trim();
  
  // Basic validation: not empty, reasonable length, not a placeholder
  // Platform-injected keys may not follow standard JWT length patterns
  return trimmedKey?.length >= 20 && !isPlaceholder(trimmedKey);
};

// Determine if credentials are properly configured
const isConfigured = supabaseUrl && 
                     supabaseAnonKey && 
                     !isPlaceholder(supabaseUrl) &&
                     !isPlaceholder(supabaseAnonKey) &&
                     isValidUrl(supabaseUrl) &&
                     isValidAnonKey(supabaseAnonKey);

if (!isConfigured) {
  console.warn('⚠️ Supabase credentials not configured properly.');
  
  if (!supabaseUrl || isPlaceholder(supabaseUrl)) {
    console.error('❌ VITE_SUPABASE_URL not set or contains placeholder');
    console.error('   Add your Supabase project URL to .env file');
  } else if (!isValidUrl(supabaseUrl)) {
    console.error('❌ VITE_SUPABASE_URL is not a valid HTTPS URL');
    console.error(`   Current value appears invalid`);
  }
  
  if (!supabaseAnonKey || isPlaceholder(supabaseAnonKey)) {
    console.error(`❌ ${anonKeySource} not set or contains placeholder`);
    console.error('   Add your Supabase anon key to .env file');
  } else if (!isValidAnonKey(supabaseAnonKey)) {
    console.error(`❌ ${anonKeySource} appears to be invalid`);
    console.error('   Anon key should be a valid authentication token');
    console.error(`   Using: ${anonKeySource}`);
  }
  
  console.info('\n📋 Setup Instructions:');
  console.info('   1. Open .env file in project root');
  console.info('   2. Get credentials from: https://app.supabase.com/project/_/settings/api');
  console.info('   3. Set VITE_SUPABASE_URL=https://yourproject.supabase.co');
  console.info('   4. Set VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.info('      OR use VITE_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
  console.info('   5. Restart dev server: npm run dev');
  console.info('   6. See SUPABASE_SETUP_GUIDE.md for detailed instructions\n');
} else {
  console.log('✅ Supabase credentials detected');
  console.log(`📊 Using: ${anonKeySource}`);
  console.log(`🔗 Connecting to: ${supabaseUrl?.substring(0, 50)}...`);
}

// Create Supabase client if configured
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      }
    })
  : null;

// Export mock client for unconfigured state
export default supabase || {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  }),
  auth: {
    signIn: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  }
};

// Test connection when configured
if (supabase) {
  (async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 5 seconds')), 5000)
      );
      
      const connectionPromise = supabase?.from('patients')?.select('count', { count: 'exact', head: true });
      
      const result = await Promise.race([connectionPromise, timeoutPromise]);
      
      if (result?.error) {
        const error = result?.error;
        if (error?.code === 'PGRST204' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
          console.error('❌ Database tables not found');
          console.info('🔧 Run DATABASE_SCHEMA.sql in Supabase SQL Editor');
          console.info('📖 See SUPABASE_SETUP_GUIDE.md for setup instructions');
        } else {
          console.error('❌ Database connection error:', error?.message);
          console.info('💡 Check Supabase project status and credentials');
        }
      } else {
        const count = result?.count || 0;
        console.log('✅ Connected to Supabase successfully');
        console.log(`📊 Database contains ${count} patients`);
        if (count === 0) {
          console.info('💡 Run DATABASE_SCHEMA.sql to add sample data');
        }
      }
    } catch (error) {
      console.error('❌ Database connection error:', error?.message);
      console.info('💡 Verify Supabase project is running and credentials are correct');
    }
  })();
} else {
  console.log('ℹ️ Supabase client in mock mode - configure credentials to enable database');
}