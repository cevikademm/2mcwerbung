/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Using gemini-3-pro-preview is excellent for extracting details from complex layouts.
const GEMINI_MODEL = 'gemini-3-pro-preview';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are 2MCWerbung AI, an expert AI Financial Analyst specialized in Optical Character Recognition (OCR) and Invoice Data Extraction.

Your goal is to extract key fields from an invoice/receipt and generate a JSON response containing both structured metadata and a visual HTML representation.

CORE DIRECTIVES:
1. **Analyze & Extract**: Read the document thoroughly. Extract the following fields for the JSON metadata:
   - **invoice_no**: The invoice number (e.g., GIB2024...).
   - **date**: The invoice date (Format: DD.MM.YYYY).
   - **supplier**: Name of the supplier/vendor.
   - **description**: A short summary of the main purchase.
   - **amount**: The grand total amount (numeric value only, e.g., "1250.00").
   - **currency**: The currency symbol (e.g., ₺, $, €).
   - **tax_id**: The Tax ID (VKN) or ID Number (TCKN).
   - **iban**: The IBAN number if present.
   - **tax_amount**: The total Tax/KDV amount.
   - **transaction_type**: Determine if this is "GELİR" (Income/Sales Invoice) or "GİDER" (Expense/Purchase Invoice). 
     - If the user seems to be the issuer (Sales), it is GELİR. 
     - If the user seems to be the customer (Purchase), it is GİDER.
     - If uncertain, default to "GİDER" (Expense).

2. **Generate HTML**: Create a single-page HTML/CSS interface for the "html_view" field.
   - **Theme**: Dark Mode (background #09090b, text-zinc-100).
   - **Layout**: A clean "Digital Receipt".
   - **Content**: Include all extracted details (Tax, IBAN, Line Items, etc.).

3. **Response Format**: 
   You MUST return a valid JSON object. Do not wrap in markdown.
   Structure:
   {
     "metadata": {
       "invoice_no": "...",
       "date": "...",
       "supplier": "...",
       "description": "...",
       "amount": "100.00",
       "currency": "₺",
       "tax_id": "...",
       "iban": "...",
       "tax_amount": "...",
       "transaction_type": "GELİR" or "GİDER"
     },
     "html_view": "<!DOCTYPE html>..."
   }
`;

export async function bringToLife(prompt: string, fileBase64?: string, mimeType?: string): Promise<{ metadata: any, html: string }> {
  const parts: any[] = [];
  
  const finalPrompt = fileBase64 
    ? "Analyze this invoice. Return the strict JSON format defined in system instructions." 
    : prompt;

  parts.push({ text: finalPrompt });

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
        responseMimeType: "application/json"
      },
    });

    const text = response.text || "{}";
    
    // Parse JSON response
    try {
        const json = JSON.parse(text);
        return {
            metadata: json.metadata || {},
            html: json.html_view || "<!-- No HTML generated -->"
        };
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return {
            metadata: {},
            html: text // Fallback
        };
    }

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}