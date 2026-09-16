import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://gojcmlwnggvmlicfumzi.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImNjNGFjZjZiLWZmOGYtNDg2ZC1hZjg1LWVjOTQzYzAwNWFkNyJ9.eyJwcm9qZWN0SWQiOiJnb2pjbWx3bmdndm1saWNmdW16aSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg5NTkxMzc3LCJleHAiOjIxMDQ5NTEzNzcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.4pNUAZ-UW5wuYfK-sat6gAVRDqeRj0bjSHG5deK1aeU';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };