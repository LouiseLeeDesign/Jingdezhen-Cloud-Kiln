import { GoogleGenAI, Type } from "@google/genai";
import { PorcelainStyle, FiringSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePorcelainDescription = async (
  style: PorcelainStyle,
  temperature: number,
  firingSource: FiringSource
): Promise<{ name: string; description: string; poem: string }> => {
  const modelId = "gemini-2.5-flash";

  let tempContext = "";
  if (temperature < 1150) tempContext = "Low-fired earthenware texture.";
  else if (temperature > 1350) tempContext = "High-fired, potentially vitrified or mutated (Yaobian).";
  else tempContext = "Standard high-gloss porcelain firing.";

  let fuelContext = "";
  switch (firingSource) {
    case FiringSource.WOOD:
      fuelContext = "Fired in a traditional Wood Kiln (Chai Yao). Mention natural falling ash glaze, uneven reduction, or rustic scorch marks.";
      break;
    case FiringSource.GAS:
      fuelContext = "Fired in a Gas Kiln. Mention rich, warm reduction atmosphere colors and smooth gradients.";
      break;
    case FiringSource.ELECTRIC:
      fuelContext = "Fired in a modern Electric Kiln. Mention precise, bright, clean colors and oxidation atmosphere.";
      break;
  }

  const prompt = `
    You are a curator of modern and traditional Jingdezhen ceramics.
    
    A user has created a piece:
    - Style: ${style}
    - Firing: ${temperature}°C using ${firingSource}.
    - Context: ${tempContext} ${fuelContext}

    Please generate a JSON response with:
    1. A creative Name (English + Chinese). Can be modern/abstract.
    2. A Curator's Note (approx 40 words). Focus on the interplay between the style and the ${firingSource} firing method.
    3. A short, modern 2-line poem/couplet in English.

    Output as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            poem: { type: Type.STRING }
          },
          required: ["name", "description", "poem"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating description:", error);
    return {
      name: "Untitled Clay (无名之器)",
      description: "The kiln has finished its work, but the story remains untold.",
      poem: "Silence in the fire,\nForm waiting for a name."
    };
  }
};

export const generatePorcelainImage = async (
  base64Sketch: string,
  style: PorcelainStyle,
  temperature: number,
  firingSource: FiringSource
): Promise<string> => {
  const modelId = "gemini-2.5-flash-image"; 

  // Logic for Fuel Source visual effects
  let fuelEffect = "";
  switch (firingSource) {
    case FiringSource.WOOD:
      fuelEffect = "Subtle wood ash glaze speckles, organic wabi-sabi imperfections, warm fire-licked gradients, matte-gloss contrast.";
      break;
    case FiringSource.GAS:
      fuelEffect = "Deep, rich reduction firing colors, smooth satiny finish, elegant color transitions.";
      break;
    case FiringSource.ELECTRIC:
      fuelEffect = "Pristine, vibrant, highly controlled colors, modern high-gloss finish, pop-art clarity.";
      break;
  }

  const prompt = `
    Create a stunning, museum-quality illustration of a ceramic masterpiece based on the attached sketch line art.
    
    **ART DIRECTION:**
    - **Style:** High-fidelity Product Illustration / Fine Art Auction Catalog.
    - **Aesthetic:** Elegant, Sophisticated, Contemporary yet honoring Jingdezhen tradition.
    - **Lighting:** Soft, professional studio lighting that highlights the curvature and glaze texture (specular highlights).
    - **Background:** PURE WHITE or very subtle off-white paper texture. No heavy shadows, no tables, just the object.
    
    **OBJECT SPECIFICS:**
    - **Shape:** Strictly follow the outline in the input image.
    - **Style Strategy:** ${style}.
    - **Firing Character:** ${fuelEffect}
    - **Temperature:** ${temperature}°C.
    
    **DESIGN DETAILS:**
    - If 'Blue & White': Use rich cobalt blue. Feel free to mix traditional motifs with modern geometric lines or subtle English typography.
    - If 'Rice-pattern': Show the translucency of the 'rice grain' cutouts glowing slightly.
    - If 'Famille Rose': Delicate, painterly enamel application, pastel tones.
    - If 'Color Glaze': Focus on the depth and liquidity of the glaze itself.
    
    **IMPORTANT:** 
    - The result should look like a highly detailed design rendering or a photo of a flawless piece.
    - Make it look EXPENSIVE and UNIQUE.
  `;

  try {
    const cleanBase64 = base64Sketch.replace(/^data:image\/(png|jpeg);base64,/, "");

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });
    
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    return "https://placehold.co/800x800/f0f0f0/999999.png?text=Generation+Failed"; 
  }
};