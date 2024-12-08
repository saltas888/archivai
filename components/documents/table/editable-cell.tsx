import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDocument } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Doc } from "@/lib/db/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RECORD_TYPE_VALUES } from "@/lib/db/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EditableCellProps {
    getValue: any;
  row: { original: Doc };
  column: { id: string };
}

export function EditableCell({ getValue, row, column }: EditableCellProps) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Doc> }) =>
      updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Success",
        description: "Document updated successfully",
      });
      setIsEditing(false);
    },
    onError: () => {
      setValue(initialValue);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
    },
  });

  const onBlur = () => {
    if (value !== initialValue) {
      mutation.mutate({
        id: row.original.id,
        data: { [column.id]: value },
      });
    }
    setIsEditing(false);
  };

  if (column.id === "recordType") {
    return (
      <Select
        value={value}
        onValueChange={(newValue) => {
          setValue(newValue);
          mutation.mutate({
            id: row.original.id,
            data: { recordType: newValue },
          });
        }}
      >
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RECORD_TYPE_VALUES.map((type) => (
            <SelectItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (column.id === "date") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"ghost"}
            className={cn(
              "w-full justify-start text-left font-normal h-8",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={new Date(value)}
            onSelect={(newValue) => {
              if (newValue) {
                setValue(newValue);
                console.log(newValue);
                mutation.mutate({
                  id: row.original.id,
                  data: { date: newValue },
                });
              }
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (isEditing) {
    return (
      <Input
        className="h-8"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onBlur();
          }
          if (e.key === "Escape") {
            setValue(initialValue);
            setIsEditing(false);
          }
        }}
        autoFocus
      />
    );
  }

  return (
    <div
      className="h-8 flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground px-2 rounded"
      onClick={() => setIsEditing(true)}
    >
      {column.id === "totalAmount"
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: row.original.currency || "USD",
          }).format(parseFloat(value))
        : value}
    </div>
  );
}