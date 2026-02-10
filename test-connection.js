// Test basic Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzvvfsuumtmewrogiqed.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dnZmc3V1bXRtZXdyb2dpcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA0NjU2MzEsImV4cCI6MjAzNjA0MTYzMX0.KuJWJWCFHIEEP95EUxB3fCO5PmjPLsihVFUvp4qQnwU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBasicConnection() {
  try {
    // Try to list tables to see if we can connect
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      console.error('Connection error:', error.message);
      return false;
    }

    console.log('✅ Basic connection successful');
    return true;
  } catch (err) {
    console.error('❌ Basic connection test failed:', err.message);
    return false;
  }
}

testBasicConnection();