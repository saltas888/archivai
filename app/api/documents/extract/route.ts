import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import Anthropic from "@anthropic-ai/sdk";
import { Client, clients, User, users } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createImagePropmpt, createTextPropmpt } from "@/lib/prompt";
import { getText } from "@/lib/pdftotext";
import { extractTextFromFile } from "@/lib/ai";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function symbolToCurrency(symbol: string) {
  switch (symbol) {
    case "€":
      return "EUR";
    case "$":
      return "USD";
    default:
      return symbol;
  }
}



export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await db.query.users.findFirst({
      where: eq(users.auth0Id, session.user.sub),
    });
    
    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const { fileUrl }: {fileUrl: string} = await req.json();
    const responseText = await extractTextFromFile(user, fileUrl);
    if (!responseText) {
      console.error("Failed to extract document data: No response text");
      return NextResponse.json({ error: "Failed to extract document data: No response text" }, { status: 500 });
    }
    // Parse the response into structured data
    const extractedData: Record<string, string> = {
      paidVatPercentage: "0",
    };
    const lines = responseText?.split("\n") || [];
    console.log(responseText)
    for (const line of lines) {
      if (line.includes(":")) {
        const [key, value] = line.split(":");
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z]/g, "");
        const cleanValue = value.trim().replace(/,/g, "");
        
        if (cleanValue && cleanValue !== "-") {
          switch (cleanKey) {
            case "serviceprovidernumber":
            case "serviceprovidervatnumber":
            case "serviceprovidervat":
            case "vatnumber":
              extractedData.vatNumber = cleanValue.trim().replace(/\s/g, "");
              break;
            case "serviceprovidername":
              extractedData.serviceProviderName = cleanValue;
              break;
            case "invoicenumber":
            case "recordnumber":
              extractedData.recordNumber = cleanValue;
              break;
            case "invoicedate":
            case "date":
              extractedData.date = cleanValue;
              break;
            case "totalamount":
            case "amount":
              // E.g. 100.00
              extractedData.totalAmount = cleanValue.replace(/[^0-9.]/g, "");
              break;
            case "currency":
              extractedData.currency = cleanValue;
            case "paidvatpercentage":
            case "vatpercentage":
              extractedData.paidVatPercentage = cleanValue.replace(/[^0-9.]/g, "");
              break;
            case "purpose":
              extractedData.purpose = cleanValue;
              break;
            case "recordtype":
              extractedData.recordType = cleanValue.toLowerCase();
              break;
            case "clientvatnumber":
              const client = await db.query.clients.findFirst({
                // Replace spaces with empty string
                where: eq(clients.vat, cleanValue.trim().replace(/\s/g, "")),
              });
              if (client) {
                extractedData.clientId = client.id;
              }
              break;
          }
        }
      }
    }
    console.log(extractedData);
    return NextResponse.json(extractedData);
  } catch (error) {
    console.error("Error extracting document data:", error);
    return NextResponse.json(
      { error: "Failed to extract document data" },
      { status: 500 }
    );
  }
}