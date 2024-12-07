import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileUrl } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Can you extract the following details from this invoice?

- Service Provider VAT number:
- Service Provider name: 
- Invoice Number:
- Invoice Date:
- Total Amount:
- Paid VAT percentage:

you might find VAT as Α.Φ.Μ. in greek.`,
            },
            {
              type: "image_url",
              image_url: {
                url: fileUrl,
                detail: "low"
              }
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;

    // Parse the response into structured data
    const extractedData: Record<string, string> = {};
    const lines = response?.split("\n") || [];
    
    for (const line of lines) {
      if (line.includes(":")) {
        const [key, value] = line.split(":");
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z]/g, "");
        const cleanValue = value.trim();
        
        if (cleanValue && cleanValue !== "-") {
          switch (cleanKey) {
            case "serviceprovidernumber":
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
              extractedData.totalAmount = cleanValue.replace(/[^0-9.]/g, "");
              break;
            case "paidvatpercentage":
            case "vatpercentage":
              extractedData.paidVatPercentage = cleanValue.replace(/[^0-9.]/g, "");
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