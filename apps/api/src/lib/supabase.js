const { createClient } = require("@supabase/supabase-js");

function getSupabaseServerKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && getSupabaseServerKey());
}

const supabaseAdmin = isSupabaseConfigured()
  ? createClient(process.env.SUPABASE_URL, getSupabaseServerKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

module.exports = {
  getSupabaseServerKey,
  isSupabaseConfigured,
  supabaseAdmin
};
