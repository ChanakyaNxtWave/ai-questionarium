import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { MCQDisplay } from "@/components/MCQDisplay";
import { supabase } from "@/integrations/supabase/client";
import { TopicsSelection } from "@/components/TopicsSelection";
import { sqlTopics } from "@/data/sqlTopics";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  topic: string;
  concept: string;
  questionKey: string;
  questionText: string;
  learningOutcome: string;
  contentType: string;
  questionType: string;
  code: string;
  codeLanguage: string;
  options: string[];
  correctOption: string;
  explanation: string;
  bloomLevel: string;
}

export default function GeneratedQuestions() {
  const { language, unitTitle } = useParams();
  const location = useLocation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    location.state?.selectedTopics || []
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('generated_questions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching questions:', error);
          toast({
            title: "Error",
            description: "Failed to fetch questions",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          // Map the database fields to our Question interface
          const mappedQuestions: Question[] = data.map(item => ({
            id: item.id,
            topic: item.topic,
            concept: item.concept,
            questionKey: item.question_key,
            questionText: item.question_text,
            learningOutcome: item.learning_outcome,
            contentType: item.content_type,
            questionType: item.question_type,
            code: item.code || '',
            codeLanguage: item.code_language || '',
            options: item.options,
            correctOption: item.correct_option,
            explanation: item.explanation,
            bloomLevel: item.bloom_level
          }));

          // Filter questions based on selected topics
          const filteredQuestions = mappedQuestions.filter(question =>
            selectedTopics.includes(question.topic)
          );

          setQuestions(filteredQuestions);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    fetchQuestions();
  }, [selectedTopics]); // Re-fetch when selected topics change

  const handleTopicSelect = (topic: string) => {
    const topicIndex = sqlTopics.findIndex((t) => t.Topic === topic);
    const topicsToSelect = sqlTopics
      .slice(0, topicIndex + 1)
      .map((t) => t.Topic);
    setSelectedTopics(topicsToSelect);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Generated Questions - {decodeURIComponent(unitTitle || '')}
      </h1>

      <div className="mb-8">
        <TopicsSelection
          topics={sqlTopics}
          selectedTopics={selectedTopics}
          onTopicSelect={handleTopicSelect}
        />
      </div>

      {questions.length > 0 ? (
        <MCQDisplay questions={questions} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          No questions found for the selected topics.
        </div>
      )}
    </div>
  );
}