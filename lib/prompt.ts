import { eq } from "drizzle-orm";
import { db } from "./db";
import { Client, clients, User } from "./db/schema";

export const TEXT_SYSTEM_PROMPT = `You are an AI accountant tasked with extracting specific information from invoices or transaction records. Your goal is to analyze the provided text and extract key details accurately.`;
export const IMAGE_SYSTEM_PROMPT = `You are an AI accountant tasked with extracting specific information from invoices or transaction records. Your goal is to analyze the provided image and extract key details accurately.`;
export const PDF_SYSTEM_PROMPT = `You are an AI accountant tasked with extracting specific information from invoices or transaction records. Your goal is to analyze the provided pdf and extract key details accurately.`;

const BASE_PROMPT = `If provided, here are some known client VAT numbers:
  <known_client_vat>
  {{clientVats}}
  </known_client_vat>
  
  Instructions:
  1. Carefully read through the provided text.
  2. Classify the record type as either 'invoice' (for invoices or receipts) or 'transaction' (for anything else).
  3. Extract the following information:
     - Service provider name
     - Service provider VAT number
     - Invoice number (if applicable)
     - Invoice date (in DD-MM-YYYY format)
     - Total amount
     - Total amount currency
     - Paid VAT percentage
     - Purpose of the transaction or invoice
     - Client VAT number
  
  Important notes:
  - VAT may be referred to as "Α.Φ.Μ." in Greek.
  - Invoice number might be seen as Invoice ID or Invoice Number or Invoice # in the context of the document among other things.
  - There should always be two VAT numbers: one for the client and one for the service provider.
  - VAT numbers typically follow the format: 2-digit country code + number (e.g., AA11233213).
  - The service provider is the company issuing the invoice or the beneficiary of a transaction.
  - The client is the recipient of the invoice and is in our database.
  
  Before providing your final output, wrap your extraction process inside <extraction_process> tags. For each piece of information you need to extract:
  1. List the information you're looking for.
  2. Quote the relevant text from the input that supports this information.
  3. Note any challenges or ambiguities you encounter in extracting this information.
  4. State your conclusion about what the correct value should be.
  
  It's OK for this section to be quite long.
  
  After your analysis, provide the extracted information in the following format:
  
  service_provider_name: [value],
  service_provider_vat: [value],
  invoice_number: [value],
  invoice_date: [value],
  total_amount: [value],
  currency: [value],
  paid_vat_pct: [value],
  record_type: [invoice | transaction],
  purpose: [value],
  client_vat_number: [value]
  
  
  Ensure all fields are filled to the best of your ability based on the information provided. If a piece of information is not available or not applicable, use "N/A" as the value.
`;

const TEXT_PROMPT = `Here is the text you need to analyze:

  <input_text>
  {{text}}
  </input_text>
  ${BASE_PROMPT}
`
function compilePrompt(prompt: string, variables: Record<string, string>) {
  return prompt.replace(/{{(\w+)}}/g, (_, key) => variables[key]);
}


export async function createPropmpt(user: User, client: Client | null = null, text: string | null = null) {
  let clientVats = "";
  if (client?.vat) {
    clientVats = client.vat;
  } else if (user.organizationId) {
    const allClientsVats = await db.select({vat: clients.vat}).from(clients).where(eq(clients.organizationId, user.organizationId));
    if (allClientsVats.length > 0) {
      clientVats = allClientsVats.map(c => c.vat).join(", ");
    }
  }
  let rawPrompt = BASE_PROMPT;
  let vars: Record<string, string> = {clientVats};
  if (text) {
    rawPrompt = TEXT_PROMPT;
    vars = {...vars, text};
  }
  const prompt = compilePrompt(rawPrompt, vars);
  return prompt;
}