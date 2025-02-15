
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
import { storeQuestion } from "@/utils/questionStorage";
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
      
      // First, get or create the SQL course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('name', 'SQL')
        .maybeSingle();

      if (courseError) throw courseError;

      let courseId: string;
      if (!courseData) {
        const { data: newCourse, error: createCourseError } = await supabase
          .from('courses')
          .insert({ name: 'SQL' })
          .select('id')
          .single();

        if (createCourseError) throw createCourseError;
        courseId = newCourse.id;
      } else {
        courseId = courseData.id;
      }

      // Create or get the unit
      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select('id')
        .eq('name', values.unitTitle)
        .eq('course_id', courseId)
        .maybeSingle();

      if (unitError) throw unitError;

      let unitId: string;
      if (!unitData) {
        const { data: newUnit, error: createUnitError } = await supabase
          .from('units')
          .insert({ 
            name: values.unitTitle,
            course_id: courseId 
          })
          .select('id')
          .single();

        if (createUnitError) throw createUnitError;
        unitId = newUnit.id;
      } else {
        unitId = unitData.id;
      }

      // Generate questions
      const newQuestions = await generateQuestions(values.content, unitId);
      
      // Store each question in the database sequentially
      for (const question of newQuestions) {
        try {
          await storeQuestion(question);
        } catch (error) {
          console.error('Error storing question:', error);
          toast({
            title: "Warning",
            description: `Failed to store a question: ${error.message}`,
            variant: "destructive",
          });
        }
      }

      // Update local state with successfully generated questions
      setGeneratedQuestions(prev => [...prev, ...newQuestions]);
      
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
        </div>
      )}
    </div>
  );
}
