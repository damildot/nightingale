# 🗺️ Neighborhood Portal - Easy Setup Guide

This project is a web application that conducts district and neighborhood analyses, powered by artificial intelligence (Gemini API). To run it on your computer, simply follow the steps below in order.

---

## 🚀 Easy Setup in 3 Steps

### Step 1: Install Dependencies (First Time Only)
While inside your project folder, type the following command into your terminal and press Enter:
```bash
npm install
```
*This process downloads the necessary packages (`node_modules` folder) required for the project to run on your computer. You do not need to do this every time you run the project; it is done only once during the initial setup.*

### Step 2: Create the Configuration File (.env)
Rename the `.env.example` file located in the project folder to `.env` (or create a copy and name it `.env`).

Open the file and enter your own information:
```env
GEMINI_API_KEY="ENTER_YOUR_OWN_GEMINI_API_KEY_HERE"
PORT=3000
APP_URL="http://localhost:3000"
```
*   **GEMINI_API_KEY:** The free API key you obtained from Google AI Studio.
*   **PORT:** The port number on which the application will run. If port 3000 is already in use on your computer, you can change this to `3001` or another number.
*   **APP_URL:** The application address. Update this URL according to whatever port number you specified (e.g., `http://localhost:3001`).

### Step 3: Start the Project
Start the project in development mode by typing the following command into your terminal:
```bash
npm run dev
```
Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** (or the port you specified) to start using the project!

---

## 🛠️ Common Errors and Easy Solutions

### ❌ Error 1: "running scripts is disabled on this system" (PowerShell Restriction)
If you receive a red security error on Windows computers when typing `npm install` or `npm run dev`:
*   **Solution:** Paste the following command into your terminal and press Enter. This command temporarily grants execution permission for the current terminal session:
    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
    ```
    Then, try running your commands again.

### ❌ Error 2: "EADDRINUSE: address already in use 0.0.0.0:3000" (Port Already in Use)
You receive this error because another program on your computer (or a previously left open terminal/project) is already using port 3000.
*   **Solution A (Easiest):** Open your `.env` file and change `PORT=3000` to `PORT=3001` (or another vacant number like `3005`, `8080`). Update the `APP_URL` section to `http://localhost:3001` as well. Then, restart the project in the terminal by running `npm run dev`.
*   **Solution B:** Restart your computer to terminate all hidden processes running in the background.

---

## 📁 File Structure & Explanations
*   `server.ts`: The file that manages the artificial intelligence (Gemini API) connection and the server side (backend).
*   `src/App.tsx`: The file that manages the screen designs, map, and chat interface that you see in the browser (frontend).
*   `.env`: A file stored only on your local computer that keeps private/personal configurations such as API keys and ports secure.