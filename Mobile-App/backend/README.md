# 🚀 Getting Started - Simple Step-by-Step Guide

This guide will walk you through setting up and running your E-KSENA app from scratch. Follow each step in order.

---

## 📋 What You Need Before Starting

1. **Node.js installed** on your computer
   - Download from: https://nodejs.org/
   - Choose the LTS version (Long Term Support)
   - Install it like any normal program

2. **A Supabase account** (it's free)
   - Go to: https://supabase.com
   - Click "Start your project"
   - Sign up with email or GitHub

3. **Your code editor** (VS Code recommended)
   - Download from: https://code.visualstudio.com/

---

## Step 1: Set Up Your Database (Supabase) ⏱️ 12 minutes

### 1.1 Create a Supabase Project

1. Go to https://app.supabase.com and log in
2. Click the green **"New Project"** button
3. Fill in the form:
   - **Name**: Type `e-ksena` (or any name you like)
   - **Database Password**: Create a strong password (write it down!)
   - **Region**: Pick the one closest to you
4. Click **"Create new project"**
5. Wait 1-2 minutes for it to finish setting up

### 1.2 Get Your Supabase Keys

1. Once your project is ready, look at the left sidebar
2. Click on **"Settings"** (gear icon at the bottom)
3. Click on **"API"** in the settings menu
4. You'll see two important things:
   - **Project URL** - looks like: `https://xxxxx.supabase.co`
   - **Service Role Key** - a long string starting with `eyJ...`
5. **Copy both of these** - you'll need them soon!
   - Tip: Keep the Service Role Key secret (don't share it)

### 1.3 Create Your Database Tables

1. In Supabase, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button
3. Open the file `backend/database.sql` from your project
4. **Copy ALL the text** from that file (Ctrl+A, then Ctrl+C)
5. **Paste it** into the SQL Editor in Supabase
6. Click the **"Run"** button (or press Ctrl+Enter)
7. You should see a green "Success" message

> If you already ran this before, run it again to add the new `station_address` column and sample addresses for responder bases.

### 1.4 Check That Tables Were Created

1. In Supabase, click **"Table Editor"** in the left sidebar
2. You should see two tables:
   - `emergency_responders` (should have 6 rows of test data, now with station addresses)
   - `incidents` (empty for now, will fill up when you use the app)
3. If you see these, you're good! ✅

---

## Step 2: Set Up Your Backend Server ⏱️ 5 minutes

### 2.1 Open Terminal/Command Prompt

- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

### 2.2 Go to the Backend Folder

Type this command and press Enter:
```bash
cd "C:\Users\LENOVO\Desktop\E-ksena Mobile Versions\ver 12-19\APC_2025_2026_T1_SS231_G06-Eksena-Mobile-app\Mobile-App\backend"
```

**Or** if you're already in the Mobile-App folder:
```bash
cd backend
```

### 2.3 Install Backend Dependencies

Type this and press Enter:
```bash
npm install
```

Wait for it to finish (it will download packages). You'll see a lot of text scrolling. When it's done, you'll see your command prompt again.

### 2.4 Create Your Environment File

1. In the `backend` folder, you should see a file called `env.example`
2. **Copy it** and rename the copy to `.env`
   - Windows: Right-click `env.example` → Copy → Paste → Rename to `.env`
   - Mac/Linux: In terminal, type: `cp env.example .env`

### 2.5 Add Your Supabase Keys

1. Open the `.env` file in a text editor (Notepad, VS Code, etc.)
2. You'll see something like:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   PORT=3000
   ```
3. **Replace** the placeholder text with your actual keys from Step 1.2:
   - Put your **Project URL** where it says `your-project-id.supabase.co`
   - Put your **Service Role Key** where it says `your-service-role-key-here`
4. **Save the file**

### 2.6 Start Your Backend Server

In the terminal (still in the backend folder), type:
```bash
npm start
```

You should see:
```
🚀 E-KSENA Backend Server running on port 3000
📍 Health check: http://localhost:3000/health
📡 API Base URL: http://localhost:3000/api
```

**Keep this terminal window open!** The server needs to keep running.

### 2.7 Test Your Backend

1. Open your web browser
2. Go to: `http://localhost:3000/health`
3. You should see: `{"status":"ok","timestamp":"...","service":"E-KSENA Backend API"}`
4. If you see this, your backend is working! ✅

---

## Step 3: Set Up Your Mobile App ⏱️ 3 minutes

### 3.1 Check Your App Configuration

1. Open the file `E-ksena_Mobile_1st/app.json`
2. Look for this section (around line 71-73):
   ```json
   "extra": {
     "API_BASE_URL": "http://10.0.2.2:3000/api"
   }
   ```
3. This is already set up correctly! ✅
   - For Android Emulator: `http://10.0.2.2:3000/api` (already correct)
   - For iOS Simulator: Change to `http://localhost:3000/api`
   - For Physical Device: Change to `http://YOUR_COMPUTER_IP:3000/api`

### 3.2 Find Your Computer's IP (Only if Testing on Physical Device)

**Windows:**
1. Open Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" - it looks like `192.168.1.100`
4. Use this IP in your `app.json`

**Mac/Linux:**
1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Look for your WiFi/Ethernet connection
4. Find the IP address (looks like `192.168.1.100`)

### 3.3 Install Mobile App Dependencies (If Not Done Already)

1. Open a **new** terminal window (keep the backend one running!)
2. Go to the mobile app folder:
   ```bash
   cd "C:\Users\LENOVO\Desktop\E-ksena Mobile Versions\ver 12-19\APC_2025_2026_T1_SS231_G06-Eksena-Mobile-app\Mobile-App\E-ksena_Mobile_1st"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Wait for it to finish

---

## Step 4: Run Your Mobile App ⏱️ 2 minutes

### 4.1 Start the Mobile App

In the terminal (in the E-ksena_Mobile_1st folder), type:
```bash
npm start
```

This will:
- Start the Expo development server
- Show you a QR code
- Open a web page with options

### 4.2 Run on Your Device

**Option A: Android Emulator**
1. Make sure you have Android Studio installed
2. Start an Android emulator
3. In the Expo terminal, press `a` to open on Android

**Option B: iOS Simulator (Mac only)**
1. Make sure you have Xcode installed
2. In the Expo terminal, press `i` to open on iOS

**Option C: Physical Device**
1. Install "Expo Go" app on your phone (from App Store/Play Store)
2. Scan the QR code shown in the terminal
3. The app will load on your phone

---

## Step 5: Test Everything Works ⏱️ 5 minutes

### 5.1 Test the App Flow

1. **Open the app** on your device/emulator
2. **Register/Login** (if needed)
3. **Allow permissions** when asked (camera, location)
4. **Go to the Video/E-ksena tab**
5. **Record a video** (or just press the record button)
6. **Wait for it to process** (you'll see "analyzing" animation)
7. **Check the backend terminal** - you should see logs like:
   ```
   [REPORT] New incident reported by +1234567890 at 37.7749, -122.4194
   [REPORT] Incident created: uuid-here
   [AI] Detected emergency type: fire for incident uuid-here
   [ASSIGN] Assigning responder +12345678901 to incident uuid-here
   ```

### 5.2 Check Supabase

1. Go back to Supabase dashboard
2. Click **"Table Editor"** → **"incidents"**
3. You should see a new row with your test incident! ✅
4. Check the `responder_phone_number` column - it should have a phone number

### 5.3 Test SMS Feature

1. In the app, go to **Home screen**
2. You should see the responder location on the map
3. Click the **SMS button**
4. Your phone's SMS app should open with the responder's number pre-filled

### 5.4 Verify SMS Button with Responder Phone Number

- [ ] Tested SMS button - opened SMS app (it should have the randomized phone number from the table emergency_responders)

### 5.5 Verify Responder Location on Map

- [ ] The location of the responder should be present after the video analysis and has a view of both the user and the responder on the maps of the mobile app

## ✅ You're Done! What's Working Now

- ✅ Backend server is running and connected to Supabase
- ✅ Mobile app can send emergency reports
- ✅ Backend analyzes reports and assigns responders
- ✅ Mobile app shows responder information
- ✅ SMS feature works (opens native SMS app)

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to server"
**Solution:**
- Make sure backend is running (`npm start` in backend folder)
- Check that port 3000 is not being used by another app
- Try restarting the backend server

### Problem: "Supabase connection error"
**Solution:**
- Check your `.env` file has the correct keys
- Make sure you're using the **Service Role Key**, not the anon key
- Verify your Supabase project is active

### Problem: "Mobile app can't reach backend"
**Solution:**
- **Android Emulator**: Use `http://10.0.2.2:3000/api` (already set)
- **iOS Simulator**: Use `http://localhost:3000/api`
- **Physical Device**: 
  - Use your computer's IP address
  - Make sure phone and computer are on same WiFi
  - Check firewall isn't blocking port 3000

### Problem: "No responders found"
**Solution:**
- Go to Supabase → Table Editor → `emergency_responders`
- Make sure there are rows in the table
- If empty, run the `database.sql` file again

---

## 📚 Next Steps (Optional)

1. **Add Real Phone Numbers**: Update the `emergency_responders` table with real responder phone numbers
2. **Customize Emergency Types**: Modify the AI detection logic in `backend/server.js`
3. **Add More Features**: Check `backend/README.md` for advanced options
4. **Deploy Backend**: When ready, deploy to Heroku, Railway, or similar service
5. **Build Production App**: Use `expo build` to create production app files

---

## 📞 Need Help?

- Check `backend/README.md` for detailed backend docs
- Check `E-ksena_Mobile_1st/INTEGRATION.md` for integration details
- Check `E-ksena_Mobile_1st/Doc/BACKEND_SETUP_GUIDE.md` for architecture

---

**You're all set! Happy coding! 🎉**

