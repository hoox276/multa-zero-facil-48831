import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    
    console.log("[generate-defense-explanation] Generating explanation for auto:", numeroAuto);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error("[generate-defense-explanation] OPENAI_API_KEY not configured");
      throw new Error("OPENAI_API_KEY not configured");
    }

    const prompt = `Com base nos dados do Auto de Infração de Trânsito abaixo, gere uma explicação clara e objetiva dos fatos ocorridos para ser usada em uma Defesa Prévia. A explicação deve ser técnica, formal e focada em possíveis vícios formais do auto.

Dados do Auto:
- Número do Auto: ${numeroAuto}
- Data da Infração: ${dataInfracao}
- Local: ${localInfracao}
- Descrição da Infração: ${descricaoInfracao}
- Órgão Autuador: ${orgaoAutuador}

Gere um parágrafo explicando os fatos de forma técnica, mencionando possíveis inconsistências ou vícios formais que justifiquem a defesa. Não use primeira pessoa. Seja direto e objetivo, com no máximo 150 palavras.`;

    console.log("[generate-defense-explanation] Calling OpenAI API");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-2025-08-07",
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
        max_completion_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[generate-defense-explanation] OpenAI API error: ${response.status}`, errorText);
      
      let errorDetail = `OpenAI API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorDetail = errorJson.error.message;
        }
      } catch (e) {
        errorDetail = errorText.substring(0, 200);
      }
      
      throw new Error(errorDetail);
    }

    const aiResponse = await response.json();
    console.log("[generate-defense-explanation] Response received successfully");
    
    const explanation = aiResponse.choices[0].message.content;

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[generate-defense-explanation] Error:", error);
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
