import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { numeroAuto, dataInfracao, localInfracao, descricaoInfracao, orgaoAutuador } = await req.json();

    const prompt = `Com base nos dados do Auto de Infração de Trânsito abaixo, gere uma explicação clara e objetiva dos fatos ocorridos para ser usada em uma Defesa Prévia. A explicação deve ser técnica, formal e focada em possíveis vícios formais do auto.

Dados do Auto:
- Número do Auto: ${numeroAuto}
- Data da Infração: ${dataInfracao}
- Local: ${localInfracao}
- Descrição da Infração: ${descricaoInfracao}
- Órgão Autuador: ${orgaoAutuador}

Gere um parágrafo explicando os fatos de forma técnica, mencionando possíveis inconsistências ou vícios formais que justifiquem a defesa. Não use primeira pessoa. Seja direto e objetivo, com no máximo 150 palavras.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um assistente jurídico especializado em defesas de trânsito. Gere textos técnicos e formais."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const explanation = aiResponse.choices[0].message.content;

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-defense-explanation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
