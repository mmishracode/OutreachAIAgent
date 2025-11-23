
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GroundingSource, SearchResult } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY not found in environment variables");
    throw new Error("API Key is missing. Please set REACT_APP_API_KEY or process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Uses Gemini with Google Search Grounding to find people/agencies.
 * Note: We cannot use JSON mode with Google Search tool.
 */
export const findLeadsWithAgent = async (
  role: string,
  niche: string,
  location: string
): Promise<SearchResult> => {
  const ai = getClient();
  
  const prompt = `
    I need to find top-rated ${role}s in the ${niche} niche located in or serving ${location}.
    
    Please search the web and provide a list of 5-7 real, active people, agencies, or businesses that fit this criteria.
    
    For each entry, you MUST provide:
    1. Name of the person or agency.
    2. A brief summary of what they do or their specific focus.
    3. THE ACTUAL WEBSITE URL or social media profile link.
       - IMPORTANT: Ensure the URL is the homepage or main profile (e.g., https://www.example.com), not a specific blog post or article about them.
    4. PUBLIC CONTACT EMAIL if available in the search snippets (or a "Contact Us" page link).
    
    Format the output clearly as a list.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No results found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract clean sources for the UI
    const sources: GroundingSource[] = chunks
      .map(chunk => chunk.web)
      .filter((web): web is { uri: string; title: string } => !!web && !!web.uri);

    return { rawText: text, sources };
  } catch (error) {
    console.error("Error finding leads:", error);
    throw error;
  }
};

/**
 * Generates a personalized cold email using Gemini.
 * Returns an object with subject and body.
 */
export const generateColdEmail = async (
  leadName: string,
  leadContext: string,
  userOffer: string,
  senderName: string
): Promise<{ subject: string; body: string }> => {
  const ai = getClient();

  const prompt = `
    Write a personalized, professional, and persuasive cold email.
    
    **Sender:** ${senderName}
    **My Offer/Value Proposition:** ${userOffer}
    
    **Recipient:** ${leadName}
    **Recipient Context (from search):** ${leadContext}
    
    **Goal:** Initiate a partnership or sales call.
    
    **Guidelines:**
    - Keep it under 150 words.
    - Be direct but polite.
    - Mention something specific about them (from the context) to show I did research.
    - Clear Call to Action (CTA).
    - Output format: JSON object with keys "subject" and "body".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating email:", error);
    return { 
        subject: "Partnership Opportunity", 
        body: "Error generating email draft. Please try again." 
    };
  }
};

/**
 * Uses AI to parse the raw search text into structured objects if possible.
 * This acts as a "Refiner" step since the search tool doesn't support JSON output mode.
 * Now accepts optional sources to help map correct URLs.
 */
export const parseLeadsFromText = async (rawText: string, sources: GroundingSource[] = []): Promise<any[]> => {
    const ai = getClient();
    
    const prompt = `
      I have the following text containing a list of businesses/people found via search, and a list of source URLs.
      Please extract the entities into a JSON array of objects.
      
      Text:
      """
      ${rawText}
      """

      Available Source URLs (use these to verify or fill in the website field if the name matches the source title):
      ${JSON.stringify(sources)}
      
      Output Schema:
      Array of:
      {
        "name": string,
        "role": string (infer from context),
        "description": string (1 sentence summary),
        "website": string (The specific URL for this entity. Ensure it starts with http:// or https:// if possible. Do not assign the same URL to everyone. If no specific URL is found, null),
        "email": string (If a specific email address is mentioned in the text, extract it here. Otherwise null)
      }
      
      Return ONLY valid JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });
        
        const jsonStr = response.text;
        if (!jsonStr) return [];
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse leads", e);
        return [];
    }
}
