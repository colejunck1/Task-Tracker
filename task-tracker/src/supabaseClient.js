import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pnqukczuytldzljpwtbs.supabase.com";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucXVrY3p1eXRsZHpsanB3dGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NjExNTcsImV4cCI6MjA1NTAzNzE1N30.Kpeuf9Dy-RoAY3I9eTI12sNOTMj-v-SPkT9T9ZwMf2M"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
