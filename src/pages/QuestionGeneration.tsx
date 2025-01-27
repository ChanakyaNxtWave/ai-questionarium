import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
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
import { TopicsSelection } from "@/components/TopicsSelection";
import { MCQDisplay } from "@/components/MCQDisplay";
import { generateQuestions } from "@/utils/openai";
import { supabase } from "@/integrations/supabase/client";

const sqlTopics = [
  {
    "Topic": "Databases",
    "Concept": ["Database","Database Management Systems","Relational Databases","Non-Relational Databases","Non-Relational & Relational DBMS"]
  },
  {
    "Topic": "SQL Introduction",
    "Concept": ["Creating Table","Inserting Data","Retrieving Data","WHERE Clause","Updating Data","Deleting Table","Updating Table"]
  },
  {
    "Topic": "Querying",
    "Concept": ["Comparison Operators","LIKE Operator","AND Operator","OR Operator","NOT Operator","Precedence","Using multiple logical operators","IN","BETWEEN","Ordering results","Distinct results","LIMIT","OFFSET"]
  },
  {
    "Topic": "Aggregations",
    "Concept": ["Sum","Average","Min","Max","Count","Alias"]
  },
  {
    "Topic": "Group By",
    "Concept": ["GROUP BY","GROUP BY with multiple columns","GROUP BY with WHERE Clause","GROUP BY with HAVING"]
  },
  {
    "Topic": "Expressions",
    "Concept": ["Using Expressions in SELECT Clause","Using Expressions in WHERE Clause"]
  },
  {
    "Topic": "SQL Functions",
    "Concept": ["Date","Cast","Arithmetic Functions"]
  },
  {
    "Topic": "Case Clause",
    "Concept": ["Case Clause"]
  },
  {
    "Topic": "Set Operations",
    "Concept": ["Union","Union All","Intersect","Minus"]
  },
  {
    "Topic": "Modeling",
    "Concept": ["ER Models","Relationships","One-to-One","Many-to-One","Many-to-Many relationships","ER Model to Relational Database","Creating Tables","Primary key","Foreign Key constraint","Through table","Querying on multiple tables"]
  },
  {
    "Topic": "Joins",
    "Concept": ["Natural Join","Inner Join","Left Join","Right Join","Full Join","Cross Join","Self Join","Joins on Multiple tables","Joins with other clauses"]
  },
  {
    "Topic": "Views",
    "Concept": ["Creating Views","Deleting Views"]
  },
  {
    "Topic": "Subqueries",
    "Concept": ["Introduction to Subquery"]
  }
];

const formSchema = z.object({
  unitTitle: z.string().min(1, "Unit title is required"),
  contentType: z.enum(["text", "file"]),
  content: z.string().min(1, "Content is required"),
});

export default function QuestionGeneration() {
  const { language } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = React.useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitTitle: "",
      contentType: "text",
      content: "",
    },
  });

  const handleTopicSelect = (topic: string) => {
    const topicIndex = sqlTopics.findIndex((t) => t.Topic === topic);
    const topicsToSelect = sqlTopics
      .slice(0, topicIndex + 1)
      .map((t) => t.Topic);
    setSelectedTopics(topicsToSelect);
  };

  const handleGenerateVariants = () => {
    const selectedQuestions = generatedQuestions.filter(q => q.isSelected);
    if (selectedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question to generate variants",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/generate/sql/${selectedQuestions[0].unitTitle}`);
  };

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
    if (selectedTopics.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one topic",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newQuestions = await generateQuestions(values.content, values.unitTitle);
      
      // Store questions in Supabase
      for (const question of newQuestions) {
        const { error } = await supabase
          .from('generated_questions')
          .insert({
            topic: question.topic,
            concept: question.concept,
            question_key: question.questionKey,
            question_text: question.questionText,
            learning_outcome: question.learningOutcome,
            content_type: question.contentType,
            question_type: question.questionType,
            code: question.code,
            code_language: question.codeLanguage,
            options: question.options,
            correct_option: question.correctOption,
            explanation: question.explanation,
            bloom_level: question.bloomLevel,
            unit_title: values.unitTitle,
            question_category: 'BASE_QUESTION'
          });

        if (error) {
          console.error('Error storing question:', error);
          toast({
            title: "Error",
            description: "Failed to store some questions in the database",
            variant: "destructive",
          });
        }
      }

      // Update state with new questions
      setGeneratedQuestions(prevQuestions => {
        const updatedQuestions = [...prevQuestions, ...newQuestions];
        console.log('Updated questions:', updatedQuestions); // Debug log
        return updatedQuestions;
      });
      
      toast({
        title: "Success",
        description: "Questions have been generated and stored successfully.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show SQL topics for the SQL route
  if (language !== "sql") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Question generation for {language} is coming soon!
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Generate Questions - {language}
      </h1>

      <div className="mb-8">
        <TopicsSelection
          topics={sqlTopics}
          selectedTopics={selectedTopics}
          onTopicSelect={handleTopicSelect}
        />
      </div>

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

      {generatedQuestions.length > 0 && (
        <div className="mt-12">
          <MCQDisplay questions={generatedQuestions} />
          
          {generatedQuestions.some(q => q.isSelected) && (
            <div className="mt-8 flex justify-center">
              <Button 
                onClick={handleGenerateVariants}
                className="w-full md:w-auto"
              >
                Generate Classroom Variants
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
