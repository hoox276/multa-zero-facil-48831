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
    const { motivoDefesa, descricaoInfracao } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const prompt = `Com base na explicação dos fatos e descrição da infração abaixo, gere a fundamentação legal completa para uma Defesa Prévia de Trânsito no Brasil.

Explicação dos fatos:
${motivoDefesa}

Descrição da infração:
${descricaoInfracao}

Gere uma fundamentação legal técnica e completa que inclua:
1. Artigos relevantes do Código de Trânsito Brasileiro (CTB - Lei 9.503/97)
2. Referências à Resolução Contran 918/2022 sobre processamento de infrações
3. Princípios do direito administrativo aplicáveis (legalidade, ampla defesa, devido processo legal)
4. Jurisprudência relevante se aplicável

A fundamentação deve ter entre 200-300 palavras, ser técnica, formal e bem estruturada. Use parágrafos e formatação clara.`;

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
            content: "Você é um advogado especializado em direito de trânsito no Brasil. Gere fundamentações jurídicas técnicas, completas e bem referenciadas."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const legalBasis = aiResponse.choices[0].message.content;

    return new Response(JSON.stringify({ legalBasis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-legal-basis:", error);
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
