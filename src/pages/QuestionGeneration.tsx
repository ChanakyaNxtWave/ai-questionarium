import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { TopicsSelection } from "@/components/TopicsSelection";
import { MCQDisplay } from "@/components/MCQDisplay";
import { ContentInput } from "@/components/ContentInput";
import { generateQuestions } from "@/utils/openai";
import { supabase } from "@/integrations/supabase/client";
import { sqlTopics } from "@/data/sqlTopics";
import { MCQ } from "@/types/mcq";

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
  const [generatedQuestions, setGeneratedQuestions] = React.useState<MCQ[]>([]);

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

      setGeneratedQuestions(prevQuestions => [...prevQuestions, ...newQuestions]);
      
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

          <ContentInput
            form={form}
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
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
          
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={handleGenerateVariants}
              className="w-full md:w-auto"
              disabled={!generatedQuestions.some(q => q.isSelected)}
            >
              Generate Classroom Variants
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}