import React, { useState, useCallback, useEffect } from "react";
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

  // Add authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to generate questions.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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

  const saveQuestionsToDatabase = async (questions: any[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session');
      }

      const { error } = await supabase
        .from('generated_questions')
        .insert(questions.map(q => ({
          topic: q.topic,
          concept: q.concept,
          question_key: q.questionKey,
          question_text: q.questionText,
          learning_outcome: q.learningOutcome,
          content_type: q.contentType,
          question_type: q.questionType,
          code: q.code,
          code_language: q.codeLanguage,
          options: q.options,
          correct_option: q.correctOption,
          explanation: q.explanation,
          bloom_level: q.bloomLevel
        })));

      if (error) {
        console.error('Error saving questions:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
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
      
      // Check authentication before proceeding
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to generate questions.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const newQuestions = await generateQuestions(values.content);
      
      // Save questions to database
      await saveQuestionsToDatabase(newQuestions);

      // Update state with new questions
      setGeneratedQuestions(prevQuestions => {
        const updatedQuestions = [...prevQuestions, ...newQuestions];
        console.log('Updated questions state:', updatedQuestions);
        return updatedQuestions;
      });

      toast({
        title: "Questions Generated",
        description: "Your questions have been generated and saved successfully.",
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate or save questions. Please try again.",
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
          <MCQDisplay key={generatedQuestions.length} questions={generatedQuestions} />
        </div>
      )}
    </div>
  );
}