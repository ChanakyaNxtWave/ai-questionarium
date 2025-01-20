import React from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  unitTitle: z.string().min(1, "Unit title is required"),
  contentType: z.enum(["text", "file"]),
  content: z.string().min(1, "Content is required"),
  questionTypes: z.array(z.string()).min(1, "Select at least one question type"),
});

const questionTypes = [
  "Multiple Choice",
  "Fill in the Blanks",
  "True/False",
  "Drag and Drop",
  "Code Analysis",
  "Output Prediction",
  "Short Answer",
];

export default function QuestionGeneration() {
  const { language } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitTitle: "",
      contentType: "text",
      content: "",
      questionTypes: [],
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        form.setValue("content", content);
      };
      reader.readAsText(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      console.log("Form values:", values);
      // TODO: Implement API call to generate questions
      toast({
        title: "Questions Generated",
        description: "Your questions have been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Generate Questions - {language}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="unitTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit/Module Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter unit title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="text">Text Input</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                  </SelectContent>
                </Select>
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
                        onChange={handleFileChange}
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

          <FormField
            control={form.control}
            name="questionTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Types</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {questionTypes.map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={
                        field.value.includes(type) ? "default" : "outline"
                      }
                      onClick={() => {
                        const newValue = field.value.includes(type)
                          ? field.value.filter((t) => t !== type)
                          : [...field.value, type];
                        field.onChange(newValue);
                      }}
                      className="h-auto py-2"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              "Generate Questions"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}