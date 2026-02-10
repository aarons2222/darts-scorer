// Simple test to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzvvfsuumtmewrogiqed.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dnZmc3V1bXRtZXdyb2dpcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA0NjU2MzEsImV4cCI6MjAzNjA0MTYzMX0.KuJWJWCFHIEEP95EUxB3fCO5PmjPLsihVFUvp4qQnwU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Try to create a test player
    const { data, error } = await supabase
      .from('darts_players')
      .insert({ name: 'Test Player' })
      .select()
      .single();

    if (error) {
      console.error('Error creating test player:', error.message);
      return false;
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log('Created test player:', data);

    // Clean up - delete the test player
    await supabase
      .from('darts_players')
      .delete()
      .eq('id', data.id);

    console.log('✅ Test player cleaned up');
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 Supabase is ready to use!');
  } else {
    console.log('⚠️  Supabase connection issues detected');
  }
});