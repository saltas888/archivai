import { Doc, NewDoc, Client, NewClient } from "./db/schema";

export async function getDocuments(filters: Record<string, string> = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/documents?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json() as Promise<Doc[]>;
}

export async function createDocument(document: Omit<NewDoc, "id" | "createdAt" | "updatedAt">) {
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(document),
  });
  if (!response.ok) {
    throw new Error("Failed to create document");
  }
  return response.json() as Promise<Doc>;
}

export async function extractDocumentData(fileUrl: string) {
  const response = await fetch("/api/documents/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileUrl }),
  });
  if (!response.ok) {
    throw new Error("Failed to extract document data");
  }
  return response.json();
}

export async function getClients() {
  const response = await fetch("/api/clients");
  if (!response.ok) {
    throw new Error("Failed to fetch clients");
  }
  return response.json() as Promise<Client[]>;
}

export async function createClient(client: Omit<NewClient, "id" | "createdAt" | "updatedAt" | "organizationId">) {
  const response = await fetch("/api/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  });
  if (!response.ok) {
    throw new Error("Failed to create client");
  }
  return response.json() as Promise<Client>;
}