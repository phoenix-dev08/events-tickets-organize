import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://lluzassbuduzwdrsrqhy.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjMwY2ViN2RlLTU1MjItNGQ4Ni04MzJmLWFiYzE0NjA0YTE1ZSJ9.eyJwcm9qZWN0SWQiOiJsbHV6YXNzYnVkdXp3ZHJzcnFoeSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg5NTg3NzI3LCJleHAiOjIxMDQ5NDc3MjcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.1sPZB13MYc89tjNk2AZtpTI_Fu8fHH4dPrmu_4hu-1E';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };