import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  "https://hogtenhlovhgeslsgsmf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZ3Rlbmhsb3ZoZ2VzbHNnc21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxODY3NjYsImV4cCI6MjA5MDc2Mjc2Nn0.z8QlKPP7QQ782IBlc6hG7JVHoTTvrZKY2Ix0us8sNU4"
);