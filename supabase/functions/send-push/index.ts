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
  const { gameId, type, details } = await req.json()

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Get all subscriptions for teams in this game
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*, teams!inner(game_id)")
    .eq("teams.game_id", gameId)

  if (!subscriptions || subscriptions.length === 0) {
    return new Response(JSON.stringify({ success: true, message: "No subscriptions found" }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  let title = "City Bingo"
  let body = "Update from the game!"
  let url = "/"

  switch (type) {
    case "game_start":
      title = "🚀 Game Started!"
      body = "The admin has started the game. Head to your board and start your run!"
      break
    case "game_end":
      title = "🏁 Game Over"
      body = "The game has been stopped by the admin. Check the leaderboard for final results soon!"
      break
    case "score_published":
      title = "🏆 Scores Published!"
      body = "Final results are in! Check the leaderboard to see how your team performed."
      break
    case "bonus_release":
      title = "✨ New Bonus Challenge!"
      body = details?.title || "A new bonus challenge has just been released!"
      break
  }

  const notificationPayload = JSON.stringify({ title, body, url })

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub.subscription, notificationPayload)
    )
  )

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { "Content-Type": "application/json" },
  })
})