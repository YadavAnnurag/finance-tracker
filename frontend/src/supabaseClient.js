import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://xrijbavkadxlzoilgevr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaWpiYXZrYWR4bHpvaWxnZXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTk4NzQsImV4cCI6MjA3NTQzNTg3NH0.JYRL2_qhPN6SxCRAvgOtzNFdu0zsnflyMPFyqeNGZ38';

export const supabase = createClient(supabaseUrl,supabaseAnonKey);