# Eksena Web Application

A full-stack mobile-to-web application developed by Group 06 (Eksena) for APC SoCIT. The system is designed to improve emergency response by leveraging artificial intelligence, real-time location tracking, and secure web technologies.

---

## What is E-ksena?

E-ksena is a mobile-to-web application that leverages artificial intelligence to analyze video messages and automatically identify emergency situations such as fires, violence, medical incidents, and accidents. The system then routes these reports to the nearest and most appropriate first responders.

The application integrates GPS technology and an alarm system to provide real-time location tracking and timely notifications, enabling faster and more efficient emergency response.

---

## Project Overview

The system consists of a frontend and backend architecture that supports:
- Real-time emergency reporting
- AI-based classification of incidents
- Secure API communication
- Location-based response coordination

---

## Team Members

- Team Leader: Paul Brian Sumilhig  
- Ezekiel Galauran  
- Arquines Peter Jr  
- Jesmark Presbitero  

---

## Features

- Authentication system (login and signup flow)
- Google Maps API integration
- API security using API keys
- Rate limiting (IP-based and API key-based)
- Health and readiness monitoring endpoints
- Improved frontend routing and navigation
- Centralized scripts for running the full stack application

---

## Project Structure


root/
│── backend/
│── frontend/
│── .env.example
│── package.json


---

## Setup Guide

### 1. Clone the Repository

git clone <repository-link>
cd <repository-folder>


### 2. Install Dependencies
From the root directory:

npm run install:all


### 3. Configure Environment Variables

#### Backend:

cd backend
cp .env.example .env


#### Frontend:
Set the following variable:

EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here


---

## Running the Application

From the root directory:

npm run start:web


Other available commands:

npm run start:backend
npm run start:frontend


---

## API Testing and Verification

Ensure the system is working correctly by testing the following endpoints:


GET /version
GET /healthz
GET /readyz
POST /api/reports


For protected routes, include:

X-API-Key: your_key

or

Authorization: Bearer <key>


---

## Security Notes

- Environment files (.env) are not tracked in the repository
- Do not commit sensitive data such as API keys
- API routes are protected using API key authentication
- Rate limiting is implemented for additional security

---

## Troubleshooting

### node_modules accidentally committed

git rm -r --cached node_modules


### Incorrect installation directory
- Delete node_modules
- Reinstall dependencies:

npm run install:all


### Missing API key
- Ensure .env is properly configured
- Verify:

EXPO_PUBLIC_GOOGLE_MAPS_API_KEY


---

## Migration and Cleanup Guide

If you encounter issues such as:
- Large unexpected changes in Git
- Nested or duplicated folders
- Broken project setup

Perform the following:
- Reinstall dependencies
- Recreate the .env file
- Remove incorrect directories

---

## Deployment Notes

- Configure all required environment variables
- Set API_KEYS (comma-separated) for production
- Run health check endpoints before deployment

---

## Branching Strategy

- main: stable, production-ready code
- Web-app: web application development
- Mobile-app: mobile application development
- Feature branches: used for specific features and testing

---

## Recent Updates

### Commit: 39136c7
- Added root workspace scripts for easier setup
- Added backend start command support
- Added .env.example and .gitignore
- Cleaned repository tracking issues
- Expanded documentation for setup and troubleshooting

### Commit: e4d5f2c
- Enhanced authentication flow
- Added environment variable support
- Implemented Google Maps API handling and error messaging
- Added API security (rate limiting and API keys)
- Added deployment checklist

---

## Notes

After pulling the latest changes:
- Reinstall dependencies if needed
- Reconfigure environment variables
- Follow troubleshooting steps if issues occur
