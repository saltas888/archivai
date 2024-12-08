import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import Anthropic from "@anthropic-ai/sdk";
import { Client, clients, User, users } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";


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

async function createPropmpt(user: User, client: Client | null = null) {
  let clientVatPart = "";
  if (client?.vat) {
    clientVatPart = ` While looking for service provider VAT you might encounter this VAT number: ${client.vat}\
 You should know that this VAT number is the "Client VAT number" and look for the actual service provider VAT number.\
 If you find the service provider VAT number, include it in the response.
    `;
  } else if (user.organizationId) {
    const allClientsVats = await db.select({vat: clients.vat}).from(clients).where(eq(clients.organizationId, user.organizationId));
    if (allClientsVats.length > 0) {
      clientVatPart = ` While looking for service provider VAT you might encounter these VAT numbers: ${allClientsVats.map(c => c.vat).join(", ")}\
 You should know that these VAT numbers are the "Client VAT number" and you should assign one of these to this value.\
 You should still look for the service provider VAT number.\ 
      `;
    } else {
      clientVatPart = `A tip to distinct Client VAT number(CV) from Service Provider VAT number(SPV)\
 is that the SPV is written closer to the Service Provider name`
    }
  }
  const prompt = `Can you extract the following details from this file or image?\
 This file or image is a transaction or an invoice or a receipt.\
 Please classify the type to be either 'invoice' for invoices or receipts or 'transaction' for anything else.\
 The date must be in format DD-MM-YYYY.\
 You might find VAT as Α.Φ.Μ. in greek.${clientVatPart}\
 The response should be in the following format:
- Service Provider VAT number:
- Service Provider name: 
- Invoice Number:
- Invoice Date:
- Total Amount:
- Paid VAT percentage:
- recordType:
- Purpose:
- Client VAT number:
`;
  return prompt;
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

    const { fileUrl } = await req.json();

    // Download the image file and convert to base64
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const mediaType = response.headers.get('content-type') || 'application/pdf';

    const message = await anthropic.messages.create({
      // Select model https://docs.anthropic.com/en/docs/about-claude/models
      // model: "claude-3-5-sonnet-20241022",
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: await createPropmpt(user),
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : null;
    console.log(responseText);
    if (!responseText) {
      console.error("Failed to extract document data: No response text");
      return NextResponse.json({ error: "Failed to extract document data: No response text" }, { status: 500 });
    }
    // Parse the response into structured data
    const extractedData: Record<string, string> = {};
    const lines = responseText?.split("\n") || [];
    
    for (const line of lines) {
      if (line.includes(":")) {
        const [key, value] = line.split(":");
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z]/g, "");
        const cleanValue = value.trim();
        
        if (cleanValue && cleanValue !== "-") {
          switch (cleanKey) {
            case "serviceprovidernumber":
            case "serviceprovidervatnumber":
            case "serviceprovidervat":
            case "vatnumber":
              extractedData.vatNumber = cleanValue;
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
              // E.g. $100.00
              extractedData.totalAmount = cleanValue.replace(/[^0-9.]/g, "");
              extractedData.currency = symbolToCurrency(cleanValue[0]); 
              break;
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

    return NextResponse.json(extractedData);
  } catch (error) {
    console.error("Error extracting document data:", error);
    return NextResponse.json(
      { error: "Failed to extract document data" },
      { status: 500 }
    );
  }
}