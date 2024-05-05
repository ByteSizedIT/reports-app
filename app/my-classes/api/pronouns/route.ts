import { createClient } from "@/utils/supabase/clients/serverClient";

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_pronoun_enums");

  if (error) {
    console.log(`Error fetching pronoun enums: `, error);
    return new Response(
      JSON.stringify({ error: "Error fetching pronoun enums" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
