"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RECORD_TYPE_VALUES } from "@/lib/db/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createDocument, extractDocumentData, getClients } from "@/lib/api";
import { FileText, Loader2, Upload } from "lucide-react";

const documentSchema = z.object({
  recordType: z.enum(RECORD_TYPE_VALUES),
  serviceProviderName: z.string().min(1, "Service provider name is required"),
  vatNumber: z.string().optional(),
  recordNumber: z.string().min(1, "Record number is required"),
  totalAmount: z.string().min(1, "Amount is required"),
  currency: z.string().min(1, "Currency is required"),
  purpose: z.string().min(1, "Purpose is required"),
  paidVatPercentage: z.string().optional(),
  additionalInfo: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
});

type DocumentFormData = z.infer<typeof documentSchema>;

export function UploadDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'details'>('upload');
  const [fileUrl, setFileUrl] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });

  const mutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setOpen(false);
      reset();
      setFileUrl(undefined);
      setFileName(undefined);
      setStep('upload');
      toast({
        title: "Success",
        description: "Document created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      });
    },
  });

  const extractMutation = useMutation({
    mutationFn: extractDocumentData,
    onSuccess: (data) => {
      if (data.serviceProviderName) setValue("serviceProviderName", data.serviceProviderName);
      if (data.vatNumber) setValue("vatNumber", data.vatNumber);
      if (data.recordNumber) setValue("recordNumber", data.recordNumber);
      if (data.totalAmount) setValue("totalAmount", data.totalAmount);
      if (data.paidVatPercentage) setValue("paidVatPercentage", data.paidVatPercentage);
      
      setStep('details');
      toast({
        title: "Success",
        description: "Document data extracted successfully",
      });
    },
    onError: () => {
      setStep('details');
      toast({
        title: "Warning",
        description: "Could not extract all document data. Please fill in the details manually.",
      });
    },
  });

  const onSubmit = (data: DocumentFormData) => {
    if (!fileUrl || !fileName) {
      toast({
        title: "Error",
        description: "Please upload a file",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      ...data,
      fileUrl,
      fileName,
      date: new Date(),
      totalAmount: parseFloat(data.totalAmount),
      paidVatPercentage: data.paidVatPercentage ? parseFloat(data.paidVatPercentage) : null,
    });
  };

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setStep('upload');
      reset();
      setFileUrl(undefined);
      setFileName(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Upload Document</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' ? 'Upload Document' : 'Document Details'}
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            {fileUrl ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">File uploaded successfully</p>
                </div>
                <Button 
                  onClick={() => extractMutation.mutate(fileUrl)}
                  disabled={extractMutation.isPending}
                >
                  {extractMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting Data...
                    </>
                  ) : (
                    'Continue to Details'
                  )}
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-md space-y-4">
                <UploadButton
                  endpoint="documentUploader"
                  onClientUploadComplete={(res) => {
                    console.log(res);
                    if (res?.[0]) {
                      setFileUrl(res[0].url);
                      setFileName(res[0].name);
                      toast({
                        title: "File uploaded",
                        description: "Your file has been uploaded successfully.",
                      });
                      
                      // Start extraction immediately after upload
                      extractMutation.mutate(res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.trace(error)
                    toast({
                      title: "Upload failed",
                      description: error.message,
                      variant: "destructive",
                    });
                  }}
                  onBeforeUploadBegin={(files) => {
                    console.log('asdasdas')
                    console.trace()
                    // Preprocess files before uploading (e.g. rename them)
                    return files.map(
                      (f) => new File([f], "renamed-" + f.name, { type: f.type }),
                    );
                  }}
                  onUploadBegin={(name) => {
                    console.trace()
                    // Do something once upload begins
                    console.log("Uploading: ", name);
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select onValueChange={(value) => setValue("clientId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-destructive">{errors.clientId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recordType">Record Type</Label>
              <Select onValueChange={(value) => setValue("recordType", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {RECORD_TYPE_VALUES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.recordType && (
                <p className="text-sm text-destructive">{errors.recordType.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceProviderName">Service Provider</Label>
              <Input {...register("serviceProviderName")} />
              {errors.serviceProviderName && (
                <p className="text-sm text-destructive">{errors.serviceProviderName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatNumber">VAT Number</Label>
              <Input {...register("vatNumber")} />
              {errors.vatNumber && (
                <p className="text-sm text-destructive">{errors.vatNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recordNumber">Record Number</Label>
              <Input {...register("recordNumber")} />
              {errors.recordNumber && (
                <p className="text-sm text-destructive">{errors.recordNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Amount</Label>
                <Input {...register("totalAmount")} type="number" step="0.01" />
                {errors.totalAmount && (
                  <p className="text-sm text-destructive">{errors.totalAmount.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input {...register("currency")} defaultValue="USD" />
                {errors.currency && (
                  <p className="text-sm text-destructive">{errors.currency.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidVatPercentage">VAT Percentage</Label>
              <Input {...register("paidVatPercentage")} type="number" step="0.01" />
              {errors.paidVatPercentage && (
                <p className="text-sm text-destructive">{errors.paidVatPercentage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input {...register("purpose")} />
              {errors.purpose && (
                <p className="text-sm text-destructive">{errors.purpose.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Input {...register("additionalInfo")} />
              {errors.additionalInfo && (
                <p className="text-sm text-destructive">{errors.additionalInfo.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Document"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}