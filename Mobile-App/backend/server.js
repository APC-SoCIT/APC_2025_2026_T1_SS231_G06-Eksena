/**
 * E-KSENA Backend Server
 * Node.js Express server for emergency incident reporting and responder management
 * 
 * Endpoints:
 * - POST /api/report-incident - Citizen reports emergency
 * - GET /api/incident/:incidentId - Get incident details
 * - POST /api/responder-location - Update responder location (OPTIONAL)
 * - GET /api/incident/:incidentId/responder-location - Get responder location (OPTIONAL)
 * - GET /health - Health check
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'E-KSENA Backend API'
  });
});

// ============================================
// ENDPOINT 1: Report Emergency Incident
// ============================================
app.post('/api/report-incident', async (req, res) => {
  try {
    const { video_url, lat, lng, user_phone_number, location_address } = req.body;

    // Validate required fields
    if (!lat || !lng || !user_phone_number) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: lat, lng, user_phone_number'
      });
    }

    console.log(`[REPORT] New incident reported by ${user_phone_number} at ${lat}, ${lng}`);

    // Create incident record with user phone number
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .insert({
        user_phone_number: user_phone_number,
        location_lat: lat,
        location_lng: lng,
        location_address: location_address || null,
        video_url: video_url || 'mock://video', // Mock URL, no actual storage needed
        status: 'pending',
        service_type: 'fire' || 'medical' || 'police' // Placeholder, will be updated after AI analysis
      })
      .select()
      .single();

    if (incidentError) {
      console.error('[ERROR] Failed to create incident:', incidentError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create incident record'
      });
    }

    console.log(`[REPORT] Incident created: ${incident.id}`);

    // Simulate AI analysis (3 second delay)
    setTimeout(async () => {
      try {
        // Mock AI: Randomly select emergency type
        const emergencyTypes = ['fire' || 'medical' || 'police'];
        const detectedService = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];

        console.log(`[AI] Detected emergency type: ${detectedService} for incident ${incident.id}`);

        // Update incident with detected service type
        await supabase
          .from('incidents')
          .update({
            service_type: detectedService,
            detected_at: new Date().toISOString()
          })
          .eq('id', incident.id);

        // Find responders for the detected service type
        const { data: responders, error: responderError } = await supabase
          .from('emergency_responders')
          .select('phone_number, name')
          .eq('service_type', detectedService)
          .eq('is_active', true);

        console.log(`[DEBUG] Looking for ${detectedService} responders, found:`, responders);

        if (responderError) {
          console.error('[ERROR] Failed to query responders:', responderError);
          return;
        }

        if (!responders || responders.length === 0) {
          console.error(`[WARNING] No active responders found for service type: ${detectedService}`);
          return;
        }

        // Select first available responder (you can implement round-robin logic here)
        const assignedResponder = responders[0];

        console.log(`[ASSIGN] Assigning responder ${assignedResponder.phone_number} (${assignedResponder.name}) to incident ${incident.id}`);

        // Update incident with assigned responder
        const { error: updateError } = await supabase
          .from('incidents')
          .update({
            responder_phone_number: assignedResponder.phone_number,
            status: 'assigned',
            assigned_at: new Date().toISOString()
          })
          .eq('id', incident.id);

        if (updateError) {
          console.error('[ERROR] Failed to assign responder:', updateError);
        } else {
          console.log(`[SUCCESS] Responder ${assignedResponder.phone_number} assigned to incident ${incident.id}`);
          // Note: SMS is handled client-side by the React Native app using expo-sms
        }
      } catch (error) {
        console.error('[ERROR] Error in AI analysis/assignment:', error);
      }
    }, 3000);

    // Return immediately (async processing)
    res.json({
      success: true,
      message: 'Emergency report received. AI analysis in progress...',
      incident_id: incident.id
    });

  } catch (error) {
    console.error('[ERROR] Error in /api/report-incident:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============================================
// ENDPOINT 2: Get Incident Details
// ============================================
app.get('/api/incident/:incidentId', async (req, res) => {
  try {
    const { incidentId } = req.params;

    const { data: incident, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (error || !incident) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found'
      });
    }

    // If responder assigned, fetch base location (station) if stored
    let responderBase = null;
    if (incident.responder_phone_number) {
      console.log(`[DEBUG] Fetching responder base for phone: ${incident.responder_phone_number}`);
      const { data: responder, error: responderError } = await supabase
        .from('emergency_responders')
        .select('name, phone_number, location_lat, location_lng, station_address')
        .eq('phone_number', incident.responder_phone_number)
        .single();

      if (!responderError && responder && responder.location_lat && responder.location_lng) {
        responderBase = {
          name: responder.name,
          latitude: parseFloat(responder.location_lat),
          longitude: parseFloat(responder.location_lng),
          address: responder.station_address || null,
        };
        console.log(`[DEBUG] Responder base found:`, responderBase);
      } else {
        console.log(`[DEBUG] Responder base not found or missing coordinates:`, { responder, error: responderError });
      }
    } else {
      console.log(`[DEBUG] No responder phone number assigned to incident ${incident.id}`);
    }

    res.json({
      success: true,
      incident: {
        id: incident.id,
        user_phone_number: incident.user_phone_number,
        responder_phone_number: incident.responder_phone_number,
        service_type: incident.service_type,
        location: {
          latitude: parseFloat(incident.location_lat),
          longitude: parseFloat(incident.location_lng),
          address: incident.location_address
        },
        status: incident.status,
        created_at: incident.created_at,
        assigned_at: incident.assigned_at,
        responder_base: responderBase,
      }
    });

  } catch (error) {
    console.error('[ERROR] Error in /api/incident/:incidentId:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============================================
// ENDPOINT 3: Update Responder Location (OPTIONAL)
// ============================================
// Only needed if you have a responder app sending real-time GPS updates
// Skip this endpoint if you're using simulated routes or static route calculation
app.post('/api/responder-location', async (req, res) => {
  try {
    const { responder_phone_number, incident_id, lat, lng } = req.body;

    if (!responder_phone_number || !incident_id || !lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: responder_phone_number, incident_id, lat, lng'
      });
    }

    // Note: This requires responder_locations table in Supabase
    // If you don't have this table, comment out this endpoint
    const { error } = await supabase
      .from('responder_locations')
      .upsert({
        responder_phone_number: responder_phone_number,
        incident_id: incident_id,
        current_lat: lat,
        current_lng: lng,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'responder_phone_number,incident_id'
      });

    if (error) {
      console.error('[ERROR] Failed to update responder location:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update responder location. Make sure responder_locations table exists.'
      });
    }

    res.json({
      success: true,
      message: 'Responder location updated'
    });

  } catch (error) {
    console.error('[ERROR] Error in /api/responder-location:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============================================
// ENDPOINT 4: Get Responder Location (OPTIONAL)
// ============================================
// Only needed if you're using responder_locations table for real-time tracking
app.get('/api/incident/:incidentId/responder-location', async (req, res) => {
  try {
    const { incidentId } = req.params;

    // Get incident to find responder phone number
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .select('responder_phone_number')
      .eq('id', incidentId)
      .single();

    if (incidentError || !incident || !incident.responder_phone_number) {
      return res.json({
        success: true,
        responder_location: null,
        message: 'No responder assigned yet'
      });
    }

    // Get responder's current location
    // Note: This requires responder_locations table in Supabase
    const { data: location, error: locationError } = await supabase
      .from('responder_locations')
      .select('current_lat, current_lng, updated_at')
      .eq('incident_id', incidentId)
      .eq('responder_phone_number', incident.responder_phone_number)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (locationError || !location) {
      return res.json({
        success: true,
        responder_location: null,
        message: 'Responder location not available'
      });
    }

    res.json({
      success: true,
      responder_location: {
        latitude: parseFloat(location.current_lat),
        longitude: parseFloat(location.current_lng),
        updated_at: location.updated_at
      },
      responder_phone_number: incident.responder_phone_number
    });

  } catch (error) {
    console.error('[ERROR] Error in /api/incident/:incidentId/responder-location:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 E-KSENA Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 Network access: http://0.0.0.0:${PORT}/api (accessible from other devices on the network)`);
});

