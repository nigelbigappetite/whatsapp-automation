import { supabase } from "../config/supabaseClient";
import { log } from "../utils/logger";

const THRESHOLD_MINUTES = 25;

export async function tryCloseConversation(brand_id: string, actor_phone: string, session_name: string) {
  // load messages in order
  const { data: msgs } = await supabase
    .from("whatsapp_staging")
    .select("*")
    .eq("brand_id", brand_id)
    .eq("actor_phone", actor_phone)
    .eq("session_name", session_name)
    .order("created_at", { ascending: true });

  if (!msgs || msgs.length === 0) return;

  // inactivity check
  const lastInbound = [...msgs].reverse().find(m => m.direction === "inbound");
  const lastTime = lastInbound ? new Date(lastInbound.created_at).getTime() : 0;
  const inactiveMs = Date.now() - lastTime;
  const inactiveMin = inactiveMs / 60000;

  // terminal state if state shows conversation_closed
  const finalState = msgs[msgs.length - 1]?.flow_state || {};
  const terminal = finalState?.conversation_closed === true;

  if (inactiveMin >= THRESHOLD_MINUTES || terminal) {
    const state = msgs[msgs.length - 1]?.flow_state || {};
    await supabase.from("whatsapp_conversations").insert({
      brand_id,
      session_name,
      actor_phone,
      alternate_phone: state.alternate_phone || null,
      phone_confirmed: Boolean(state.alternate_phone || state.actor_phone),
      customer_email: state.customer_email || null,
      service: "waste_removal",
      waste_type: state.waste_type || null,
      pickup_address: state.pickup_address || null,
      urgency_level: state.urgency_level || null,
      quote_min: 80,
      quote_max: 120,
      booking_slot: state.booking_slot || null,
      photos: state.media_urls || [],
      messages: msgs.map((m: any) => ({ direction: m.direction, text: m.message, ts: m.created_at })),
      summary: `Waste removal for ${state.waste_type || "N/A"} at ${state.pickup_address || "N/A"} – slot ${state.booking_slot || "TBD"}`,
      sentiment: null
    });

    // archive: for MVP we delete; later you can mark archived=true
    await supabase
      .from("whatsapp_staging")
      .delete()
      .eq("brand_id", brand_id)
      .eq("actor_phone", actor_phone)
      .eq("session_name", session_name);

    log("Closed conversation:", { actor_phone, brand_id });
  }
}
