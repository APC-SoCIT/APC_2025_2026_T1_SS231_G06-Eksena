const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkResponders() {
  const { data, error } = await supabase
    .from('emergency_responders')
    .select('phone_number, name, location_lat, location_lng, service_type, is_active');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Emergency Responders:');
    data.forEach(r => console.log(`${r.phone_number}: ${r.name} - ${r.service_type} - active:${r.is_active} - lat:${r.location_lat}, lng:${r.location_lng}`));
  }
  process.exit(0);
}

checkResponders();