import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push@3.6.6"

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      })
    });
  }

  try {
    const bodyText = await req.text();
    if (!bodyText) {
      console.error("Early return: Empty request body received.");
      return new Response(JSON.stringify({ error: "Empty request body" }), { status: 400 });
    }

    console.log("Raw payload received:", bodyText);
    const parsedBody = JSON.parse(bodyText);

    // Detect if this is a Supabase Webhook (which nests the row in 'record')
    // OR a manual call from our frontend
    let gameId, type, details;
    
    if (parsedBody.type === 'INSERT' && parsedBody.table === 'bonus_challenges') {
      console.log("Detected webhook event for bonus_challenges insertion");
      const record = parsedBody.record;
      gameId = record.game_id;
      type = 'bonus_release';
      details = { title: record.title };
    } else {
      gameId = parsedBody.gameId;
      type = parsedBody.type;
      details = parsedBody.details;
    }

    if (!gameId || !type) {
      console.error("Early return: Missing gameId or type. Parsed body:", parsedBody);
      return new Response(JSON.stringify({ error: "Missing required fields: gameId, type" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Get all subscriptions for teams in this game
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*, teams!inner(game_id)")
      .eq("teams.game_id", gameId);

    if (subError) {
      console.error("Supabase query error:", subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No subscriptions found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let title = "City Bingo";
    let body = "Update from the game!";
    let url = "/";

    switch (type) {
      case "game_start":
        title = "🚀 Game Started!";
        body = "The admin has started the game. Head to your board and start your run!";
        break;
      case "game_end":
        title = "🏁 Game Over";
        body = "The game has been stopped by the admin. Check the leaderboard for final results soon!";
        break;
      case "score_published":
        title = "🏆 Scores Published!";
        body = "Final results are in! Check the leaderboard to see how your team performed.";
        break;
      case "bonus_release":
        title = "✨ New Bonus Challenge!";
        body = details?.title || "A new bonus challenge has just been released!";
        break;
    }

    const notificationPayload = JSON.stringify({ title, body, url });
    console.log(`Sending notification to ${subscriptions.length} subscribers.`);
    console.log(`Payload: ${notificationPayload}`);

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(sub.subscription, notificationPayload)
          .then((res) => ({ status: 'fulfilled', value: res }))
          .catch((err) => ({ status: 'rejected', reason: err }))
      )
    );

    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        console.log(`Notification ${index} sent successfully.`);
      } else {
        console.error(`Notification ${index} failed:`, res.reason);
      }
    });

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error processing push notification:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})