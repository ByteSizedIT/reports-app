import { createClient } from "@/utils/supabase/clients/serverClient";

import { Student } from "@/types/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const class_id = searchParams.get("class_id");

  const supabase = createClient();

  const { data, error } = await supabase
    .from("class_student")
    .select("student(*)")
    .eq("class_id", Number(class_id))
    .returns<Array<{ student: Student }>>();

  if (error) {
    console.log(`Error fetching pronoun enums: `, error);
    return new Response(
      JSON.stringify({ "Error fetching pronoun enums": error }),
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
