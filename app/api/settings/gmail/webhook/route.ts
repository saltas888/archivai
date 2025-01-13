import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { google } from 'googleapis';

async function processAttachment(attachment: any, auth: OAuth2Client) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  // Get the attachment data
  const response = await gmail.users.messages.attachments.get({
    userId: 'me',
    messageId: attachment.messageId,
    id: attachment.attachmentId,
  });

  // Convert from base64
  const buffer = Buffer.from(response.data.data || '', 'base64');

  // Process the attachment using your existing document upload logic
  // This would be similar to your UploadThing handler
  // You might want to create a shared service for this
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;
    
    // Decode the message data
    const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
    
    const { emailAddress } = data;
    
    // Find user settings by email
    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, emailAddress),
      with: {
        user: true,
      },
    });

    if (!settings?.gmailAccessToken) {
      return NextResponse.json({ error: "No Gmail tokens found" }, { status: 404 });
    }

    // Set up Gmail client
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({
      access_token: settings.gmailAccessToken,
      refresh_token: settings.gmailRefreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get the email message
    const messageResponse = await gmail.users.messages.get({
      userId: 'me',
      id: data.messageId,
    });

    // Process attachments
    const attachments = messageResponse.data.payload?.parts?.filter(
      part => part.filename && part.body?.attachmentId
    );

    if (attachments) {
      for (const attachment of attachments) {
        await processAttachment({
          messageId: data.messageId,
          attachmentId: attachment.body?.attachmentId,
        }, oauth2Client);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gmail webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process Gmail webhook" },
      { status: 500 }
    );
  }
}