import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MCQDisplay } from "@/components/MCQDisplay";
import { supabase } from "@/integrations/supabase/client";

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
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('generated_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }

      if (data) {
        setQuestions(data as Question[]);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Generated Questions - {decodeURIComponent(unitTitle || '')}
      </h1>
      <MCQDisplay questions={questions} />
    </div>
  );
}