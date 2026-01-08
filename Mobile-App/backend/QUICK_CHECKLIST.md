# ✅ Quick Setup Checklist

Follow this checklist step by step. Check off each item as you complete it.

## Part 1: Database Setup (Supabase)

- [ ] Created Supabase account at https://supabase.com
- [ ] Created new project in Supabase
- [ ] Copied Project URL from Settings → API
- [ ] Copied Service Role Key from Settings → API
- [ ] Opened SQL Editor in Supabase
- [ ] Copied all text from `backend/database.sql` (run it again now to add station addresses)
- [ ] Pasted into SQL Editor and clicked Run
- [ ] Verified tables exist in Table Editor (emergency_responders, incidents)

## Part 2: Backend Setup

- [ ] Opened terminal/command prompt
- [ ] Navigated to `backend` folder
- [ ] Ran `npm install` (waited for it to finish)
- [ ] Copied `env.example` to `.env`
- [ ] Opened `.env` file
- [ ] Pasted Supabase URL into `SUPABASE_URL=`
- [ ] Pasted Service Role Key into `SUPABASE_SERVICE_KEY=`
- [ ] Saved `.env` file
- [ ] Ran `npm start` in backend folder
- [ ] Saw "🚀 E-KSENA Backend Server running on port 3000"
- [ ] Opened browser to `http://localhost:3000/health`
- [ ] Saw `{"status":"ok",...}` message

## Part 3: Mobile App Setup

- [ ] Opened new terminal window (kept backend running)
- [ ] Navigated to `E-ksena_Mobile_1st` folder
- [ ] Ran `npm install` (if not done already)
- [ ] Checked `app.json` has `API_BASE_URL: "http://10.0.2.2:3000/api"`
- [ ] Ran `npm start` in mobile app folder
- [ ] Saw Expo development server start

## Part 4: Testing

- [ ] Opened app on device/emulator
- [ ] Registered/Logged in
- [ ] Allowed camera and location permissions
- [ ] Went to Video/E-ksena tab
- [ ] Recorded a test video
- [ ] Saw "analyzing" animation
- [ ] Checked backend terminal - saw incident logs
- [ ] Checked Supabase - saw new incident in database
- [ ] Saw responder assigned in Supabase
- [ ] Tested SMS button - opened SMS app

## 🎉 All Done!

If all items are checked, your app is fully set up and working!

---

**Having trouble?** See `GET_STARTED.md` for detailed instructions.

