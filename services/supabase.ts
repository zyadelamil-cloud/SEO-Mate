
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://grbzniraxuqywiotwaql.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyYnpuaXJheHVxeXdpb3R3YXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMjMxNjYsImV4cCI6MjA4MTg5OTE2Nn0.y8FTgxlKNMkgftWA8z45un_gomfsaCPZxgShT5V9nOw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
