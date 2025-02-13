
import { supabase } from "@/integrations/supabase/client";

export const generateUniqueQuestionKey = async (baseKey: string): Promise<string> => {
  let attemptCount = 0;
  let uniqueKey = baseKey;
  
  while (attemptCount < 1000) {
    const { data, error } = await supabase
      .from('questions')
      .select('id')
      .eq('question_key', uniqueKey)
      .maybeSingle();

    if (error) {
      console.error('Error checking question key:', error);
      throw error;
    }

    if (!data) {
      return uniqueKey;
    }

    attemptCount++;
    const match = uniqueKey.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const num = parseInt(match[2]);
      uniqueKey = `${prefix}${(num + attemptCount).toString().padStart(2, '0')}`;
    } else {
      uniqueKey = `${baseKey}${attemptCount.toString().padStart(2, '0')}`;
    }
  }

  throw new Error('Unable to generate unique question key after multiple attempts');
};
