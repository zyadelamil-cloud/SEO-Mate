
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gyxirgpovvxbjjkethvl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eGlyZ3BvdnZ4Ympqa2V0aHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTk4OTcsImV4cCI6MjA4Mjc3NTg5N30.nrOl_d0vpXidq8ETcb6lJ90UMlLPbwh72MnSbHI417E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
