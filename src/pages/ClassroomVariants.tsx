import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MCQDisplay } from "@/components/MCQDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ClassroomVariants() {
  const { unitTitle } = useParams();
  const [variants, setVariants] = useState([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const { data, error } = await supabase
          .from('generated_questions')
          .select('*')
          .eq('unit_title', unitTitle)
          .eq('question_category', 'CLASS_ROOM_VARIANT');

        if (error) throw error;
        setVariants(data || []);
      } catch (error) {
        console.error('Error fetching variants:', error);
        toast({
          title: "Error",
          description: "Failed to fetch classroom variants",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariants();
  }, [unitTitle]);

  if (isLoading) {
    return <div>Loading variants...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Classroom Variants - {unitTitle}
      </h1>
      {variants.length > 0 ? (
        <MCQDisplay questions={variants} />
      ) : (
        <p>No variants found for this unit.</p>
      )}
    </div>
  );
}