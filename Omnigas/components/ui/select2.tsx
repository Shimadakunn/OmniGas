"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { items: string[] }
>(({ className, items, ...props }, ref) => {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const [isActiveSelect, setIsActiveSelect] = React.useState(false);

  const handleItemClick = (itemName: string) => {
    setSelectedItem(itemName);
    setIsActiveSelect(false);
  };

  return (
    <div
      data-state={isActiveSelect ? "open" : "closed"}
      className="relative group text-text"
      aria-expanded={isActiveSelect}
    >
      <button
        ref={ref}
        onClick={() => setIsActiveSelect(!isActiveSelect)}
        onBlur={() => setIsActiveSelect(false)}
        aria-haspopup="listbox"
        aria-labelledby="select-label"
        className={cn(
          "flex min-w-[10px] w-max cursor-pointer items-center rounded-base border-2 border-border dark:border-darkBorder bg-main px-6 py-2 font-base shadow-light dark:shadow-dark transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none",
          className
        )}
        {...props}
      >
        <div className="mx-auto flex items-center">
          {selectedItem === null ? "Select" : selectedItem}
          <ChevronDown className="ml-2 h-5 w-5 transition-transform group-data-[state=open]:rotate-180 group-data-[state=closed]:rotate-0 ease-in-out" />
        </div>
      </button>
      <div
        role="listbox"
        aria-labelledby="select-label"
        className="absolute left-0 min-w-[160px] w-max group-data-[state=open]:top-20 group-data-[state=open]:opacity-100 group-data-[state=closed]:invisible group-data-[state=closed]:top-[50px] group-data-[state=closed]:opacity-0 group-data-[state=open]:visible rounded-base border-2 border-border dark:border-darkBorder font-base shadow-light dark:shadow-dark transition-all"
      >
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className="block w-full border-b-2 border-border dark:border-darkBorder bg-main px-5 py-3 first:rounded-t-base last:rounded-b-base hover:bg-[#DBCAF4]"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
});
Select.displayName = "Select";

export { Select };
