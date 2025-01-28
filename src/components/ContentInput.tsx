import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface ContentInputProps {
  form: UseFormReturn<any>;
  selectedFile: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ContentInput = ({ form, selectedFile, onFileChange }: ContentInputProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="contentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content Source</FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full p-2 border rounded"
              >
                <option value="text">Text Input</option>
                <option value="file">File Upload</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {form.watch("contentType") === "text"
                ? "Content"
                : "Upload File"}
            </FormLabel>
            <FormControl>
              {form.watch("contentType") === "text" ? (
                <Textarea
                  placeholder="Enter your content here"
                  className="min-h-[200px]"
                  {...field}
                />
              ) : (
                <div className="flex flex-col gap-4">
                  <Input
                    type="file"
                    accept=".txt,.md,.py,.js,.html,.css,.sql"
                    onChange={onFileChange}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected file: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};