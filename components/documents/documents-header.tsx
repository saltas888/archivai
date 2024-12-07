"use client";

import { useToast } from "@/components/ui/use-toast";
import { UploadButton } from "@/lib/uploadthing";

export function DocumentsHeader() {
  const { toast } = useToast();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Documents</h1>
      <UploadButton
        endpoint="documentUploader"
        onClientUploadComplete={(res) => {
          toast({
            title: "Upload completed",
            description: "Your file has been uploaded successfully.",
          });
        }}
        onUploadError={(error: Error) => {
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          });
        }}
      />
    </div>
  );
}