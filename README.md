# City Bingo Webapp

City Bingo is a real-world scavenger hunt application designed for groups and teams to explore their environment in a fun, interactive way. Teams compete to complete a 5x5 grid of challenges (like "Find a Blue Door" or "Statue Selfie") within a set time limit. Progress is tracked in real-time across all teams, creating an engaging and competitive urban adventure.

## 🚀 Project Setup

### 1. Supabase Backend Setup
City Bingo uses Supabase for database and real-time synchronization.

1.  **Create a Project:** Sign up at [Supabase](https://supabase.com/) and create a new project.
2.  **Database Schema:**
    *   Open the **SQL Editor** in your Supabase dashboard.
    *   Run the contents of `schema.sql` to create the tables (`games`, `challenges`, `teams`, `team_progress`) and enable Real-time replication.
    *   If you ever need to safely reset the table content WITHOUT DELETING THE TABLES THEMSELVES, you can run `resetTables.sql`.
3.  **API Credentials:**
    *   Go to **Project Settings > API**.
    *   Copy your `Project URL` and `anon public` key.
4.  **Notifications Setup:**
    *   Push notifications are sent via a Supabase edge function.
    *   FIrst, generate Vapid keys via `npx web-push generate-vapid-keys`. Record your generated keys.
    *   Login and link your project: `npx supabase login` and `npx supabase link --project-ref your-project-ref`.
    *   Deploy the Edge Function for sending notifications: `npx supabase functions deploy send-push`.
    *   Set secrets for the function:
        ```
        npx supabase secrets set VAPID_PUBLIC_KEY=your_vapid_public_key
        npx supabase secrets set VAPID_PRIVATE_KEY=your_vapid_private_key
        ```
5.  **Notification Scheduling:**
    *   The edge function is invoked manually to send out notifications in most cases.
    *   However, some the bonus challenge release notification needs to be scheduled out via Webhook.
    *   To schedule the edge function, go to **Database Webhooks** in Supabase and create a new Webhook.
    *   **Table:** `bonus_challenges`
    *   **Events:** Check **INSERT** only.
    *   **Type of Webhook:** Choose your `send-push` edge function.
    *   **HTTP Method:** Select **POST**.
    *   **HTTP Headers:** If not present, add `Authorization: Bearer YOUR_ANON_OR_SERVICE_ROLE_KEY`.
6.  **Environment Variables:**
    *   Create a `.env` file in the project root:
        ```
        VITE_SUPABASE_URL=your_supabase_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        VITE_GAME_CREATION_SECRET=your_secret_password
        VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
        ```

### 2. Local Development
1.  **Install Dependencies:**
    ```
    npm install
    ```
2. **Build / Test:**
    ```
    npm run build
    npm test
    ```
3.  **Run Development Server:**
    ```
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

### 3. Build & Deploy (Vercel)
This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Push to GitHub:** Ensure your code is in a GitHub repository.
2.  **Import to Vercel:** Create a new project in Vercel and import your repository.
3.  **Configure Environment Variables:** In the Vercel project settings, copy over your .env file.
4.  **Deploy:** Vercel will automatically build and deploy your app.

---

## 🎮 User Guide

As a participant, you will use the webapp to track your team's progress during the event.

1.  **Register a Team:**
    *   On the landing page, find the option to register a new team.
    *   Enter the 6-character **Game ID** provided by the organizer.
    *   Enter your desired team name and hit **Get Team ID** to get your team ID.
    *   REMEMBER THIS ID! (Write it down somewhere)
2.  **Login to a Game:**
    *   On the landing page, enter the 6-character **Game ID** provided by the organizer.
    *   Enter the 6-character **Team ID** you have received when registering your team.
    *   Click **Login**
3.  **The Bingo Board:**
    *   The 5x5 grid shows your challenges. Click a square to view details.
    *   If the game requires it, you may need to provide an **Instagram Post URL** to prove completion.
    *   Click **Mark as Complete** to flip the square.
    *   (If needed , you can also click **Mark as Incomplete** to undo a square.)
4.  **Checking the Rules:**
    *   If you need to refresh on the scoring system or the general rules of the game, hit the "Rules" button in the top header.
5.  **Real-time Leaderboard:**
    *   Use the sidebar to see the current rankings of all teams.
    *   Initially, the leaderboard will only show number of squares completed by each team. Once the game ends and the Admin publishes final scores, it will update to show the actual scores.
6.  **Notifications:**
    * Clicking the bell icon next to the game title should enable notifications for the game.
    * These are important to make sure you don't miss any bonus challenges!!
7.  **Starting your Run:**
    *   Once the admin has started the overall run, you can hit the **Start Run** button whenever you are ready to start.
    *   Keep an eye on the countdown! Once the time is up, you will no longer be able to mark challenges as complete.
    *   Alternatively, if the admin chooses to globally stop the game, your timer will automatically run out.
8.  **Bonus Challenges:**
    * The admin can send out bonus challenges at any point in the run while all team's runs are currently still active.
    * Look out for notifications when the admin sends out these challenges.

---

## 🛠 Admin Guide

As an organizer, you use create games and use the Admin Dashboard to manage the progress of a game.

1.  **Creating a Game:**
    *   **Game Settings:** Set the name, time limit (in minutes), and optional rules.
    *   **Scoring:** Configure points awarded for each square, for completing a Bingo (row, column, or diagonal), and for being the only team to complete a challenge.
    *   **Require Instagram:** Enable this to mandate that teams provide proof via Instagram for every challenge.
    *   **Bingo Board:** Click squares to define titles and descriptions. You can toggle a "FREE SPACE" in the center.
    *   To prevent random people from creating a game, you will be prompted for a "secret" when trying to create the game. Message the website creator for the secret.
    *   When you finish creating a game, REMEMBER the 6-character **Game ID** AND your inputted 4-digit **Admin Passcode**.
2.  **Accessing the Admin Dashboard:**
    *   Click **Game Admin** on the landing page.
    *   Enter your 6-character **Game Code** and your 4-digit **Admin Passcode**.
3.  **Managing the Live Event:**
    *   **Edit Game Config:** Before the game starts, you can edit the game settings. After the game starts, this locks and becomes view-only
    *   **Manage Teams:** Before the game starts, you can remove teams by clicking on a team and hitting **Remove Team** under the bingo card.
    *   **Start Game:** Once the game is ready to begin, click **Start Game**. This locks the board configuration.
    *   **Monitor Progress:** See real-time updates as teams complete squares.
    *   **Send Bonus Challenges:** Hit **Send Bonus** to send a bonus challenge midgame. NOTE - this can only be done while ALL team's runs are currently still active!
    *   **Stop Game:** When the event ends, click **Stop Game**. This prevents further completions by teams.
    *   **Manual Adjustments:** After stopping, the admin can manually mark squares as complete/incomplete or edit Instagram URLs for any team.
    *   **Publish Scores:** Click **Publish Scores** to finalize the results. You will no longer be able to edit the game after this is completed.
