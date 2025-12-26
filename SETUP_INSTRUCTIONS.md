# ExtraMed CRM - Database Setup Instructions

## Error: "Could not find the table 'public.patients' in the schema cache"

This error means your Supabase database hasn't been initialized with the required tables yet. Follow these steps to fix it:

## Step-by-Step Setup Guide

### 1. Create Supabase Project (if not done already)
1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Enter project details:
   - **Project Name**: extramed-crm (or your preferred name)
   - **Database Password**: Create a strong password (save it securely!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait ~2 minutes for setup

### 2. Get Your Supabase Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 3. Configure Environment Variables
Create or update your `.env` file in the project root with your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Replace the placeholder values with your actual Supabase credentials from Step 2.

### 4. Create Database Tables
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open the `DATABASE_SCHEMA.sql` file from your project root
4. Copy **ALL** the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** to execute the schema

This will create:
- ✅ All required tables (patients, diagnoses, medications, estimates, etc.)
- ✅ Proper relationships and foreign keys
- ✅ Indexes for optimal performance
- ✅ Initial room data (10 rooms)
- ✅ Sample patient (Ivanov Ivan Ivanovich)

### 5. Verify Database Setup
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `patients`
   - `diagnoses`
   - `medications`
   - `allergies`
   - `lab_results`
   - `procedures`
   - `estimates`
   - `estimate_items`
   - `payments`
   - `rooms`
   - `inpatients`

### 6. Restart Your Development Server
```bash
# Stop your current server (Ctrl+C)
# Start it again
npm run dev
```

### 7. Test the Application
1. Navigate to the **Patient Directory** page
2. You should now see:
   - The sample patient (Ivanov Ivan Ivanovich)
   - Statistics: Total: 156, Active: 89, Outpatient: 42
   - No more "Could not find the table" errors

## Troubleshooting

### Still seeing the error?
1. **Check environment variables:**
   - Verify `.env` file exists in project root
   - Ensure variables start with `VITE_` prefix
   - Restart your dev server after changing `.env`

2. **Verify SQL execution:**
   - Check Supabase SQL Editor for any error messages
   - Ensure the entire `DATABASE_SCHEMA.sql` was executed
   - Go to Table Editor and confirm tables exist

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for Supabase connection errors
   - Check if credentials are loaded correctly

### Common Issues:

**"Missing Supabase environment variables"**
- Ensure `.env` file has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Values must not contain dummy/placeholder text
- Restart dev server after adding credentials

**"Using demo data - Supabase not configured"**
- This is normal if you haven't set up Supabase yet
- Follow steps 1-4 above to connect your database
- Demo data will be replaced with real database data once configured

**SQL errors in Supabase**
- Make sure you're copying the COMPLETE `DATABASE_SCHEMA.sql` file
- Execute the entire script at once, not line by line
- If errors persist, try deleting all tables and re-running the script

## Features After Setup

Once configured, you'll have:
- ✅ **Persistent Storage** - All data saved to PostgreSQL via Supabase
- ✅ **Real-time Updates** - Changes sync across all screens instantly
- ✅ **Medical History** - Diagnoses, medications, allergies stored permanently
- ✅ **Financial Records** - Estimates and payments tracked in database
- ✅ **Inpatient Management** - Room assignments and admissions persisted
- ✅ **Live Statistics** - Real-time patient statistics from database

## Need Help?

If you're still experiencing issues after following these steps:
1. Check that all SQL commands executed successfully in Supabase
2. Verify your environment variables are correctly set
3. Look for specific error messages in browser console
4. Ensure your Supabase project is active (not paused)

Your application is designed to work with demo data until Supabase is properly configured, so you can continue development even while setting up the database.