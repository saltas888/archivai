'use client';
import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { ChevronProps, DayPickerProps } from "react-day-picker";

// eslint-disable-next-line import/no-unresolved -- Unsure why this is being flagged with no reason
// import "react-day-picker/dist/style.css";

function Chevron(props: Readonly<ChevronProps>) {
  // Left/Right chevron means navigation
  if (props.orientation === "left") {
    return (
      <div className="flex text-neutral-400">
        <ChevronLeft className="h-4 w-4" />
      </div>
    );
  } else if (props.orientation === "right") {
    return (
      <div className="flex text-neutral-400">
        <ChevronRight className="h-4 w-4" />
      </div>
    );
    // Down chevron means dropdown for month/year selection
  } else {
    return <ChevronDown className="-mb-1 h-4 w-4" />;
  }
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  ...props
}: DayPickerProps) {
  return (
    <DayPicker
      mode="single"
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("p-0", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-y-0",
        month: "space-y-4",
        month_caption:
          "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-flex-start z-10",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames
      }}
      components={{ Chevron: Chevron }}
      {...props}
    />
  );
}

export { Calendar };
