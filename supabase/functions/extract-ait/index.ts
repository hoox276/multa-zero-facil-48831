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
    const { fileData, fileName, fileType } = await req.json();

    // Extract base64 data
    const base64Data = fileData.split(',')[1];
    
    // Prepare message for GPT-5
    const messages = [
      {
        role: "system",
        content: `Você é um assistente especializado em extrair dados de Autos de Infração de Trânsito brasileiros.
        
Extraia os seguintes campos do documento:
- numeroAuto: número do auto de infração
- dataInfracao: data da infração (formato YYYY-MM-DD)
- dataCiencia: data da ciência/notificação (formato YYYY-MM-DD)
- orgaoAutuador: órgão autuador (ex: Detran-SP, PRF, CET)
- localInfracao: local completo da infração
- descricaoInfracao: descrição completa da infração
- valorMulta: valor da multa (apenas números, ex: 293.47)

Retorne APENAS um objeto JSON válido com esses campos. Se algum campo não for encontrado, use string vazia.`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extraia os dados deste Auto de Infração de Trânsito:"
          },
          {
            type: "image_url",
            image_url: {
              url: fileData
            }
          }
        ]
      }
    ];

    // Call Lovable AI Gateway with GPT-5
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
        model: "openai/gpt-5",
        messages: messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const extractedText = aiResponse.choices[0].message.content;

    // Parse JSON from response
    let extractedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = extractedText.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                       extractedText.match(/(\{[\s\S]*?\})/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[1]);
      } else {
        extractedData = JSON.parse(extractedText);
      }
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", extractedText);
      throw new Error("Failed to parse extracted data");
    }

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in extract-ait:", error);
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
