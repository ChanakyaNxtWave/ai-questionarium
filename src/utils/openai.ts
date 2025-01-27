export const generateQuestions = async (content: string, unitTitle: string) => {
  try {
    const response = await fetch('/functions/v1/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        unitTitle,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    console.log('Raw response:', data);

    if (!data.questions) {
      throw new Error('No questions received from the API');
    }

    const questions = parseOpenAIResponse(data.questions);
    console.log('Parsed questions:', questions);
    return questions;
  } catch (error) {
    console.error('Error in generateQuestions:', error);
    throw error;
  }
};

const parseOpenAIResponse = (response: string) => {
  const questions = [];
  const questionBlocks = response.split('-END-').filter(block => block.trim());

  for (const block of questionBlocks) {
    try {
      const question: any = {};
      const lines = block.trim().split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;

        const [key, ...valueParts] = line.split(':');
        if (!key || valueParts.length === 0) continue;

        const value = valueParts.join(':').trim();
        
        switch (key.trim()) {
          case 'TOPIC':
            question.topic = value;
            break;
          case 'CONCEPT':
            question.concept = value;
            break;
          case 'QUESTION_KEY':
            question.question_key = value;
            break;
          case 'QUESTION_TEXT':
            question.question_text = value;
            break;
          case 'LEARNING_OUTCOME':
            question.learning_outcome = value;
            break;
          case 'CONTENT_TYPE':
            question.content_type = value;
            break;
          case 'QUESTION_TYPE':
            question.question_type = value;
            break;
          case 'CODE':
            question.code = value === 'NA' ? null : value;
            break;
          case 'CODE_LANGUAGE':
            question.code_language = value === 'NA' ? null : value;
            break;
          case 'OPTION_1':
          case 'OPTION_2':
          case 'OPTION_3':
          case 'OPTION_4':
            if (!question.options) question.options = [];
            question.options.push(value);
            break;
          case 'CORRECT_OPTION':
            question.correct_option = value;
            break;
          case 'EXPLANATION':
            question.explanation = value;
            break;
          case 'BLOOM_LEVEL':
            question.bloom_level = value;
            break;
        }
      }

      if (Object.keys(question).length > 0) {
        questions.push(question);
      }
    } catch (error) {
      console.error('Error parsing question block:', error);
    }
  }

  return questions;
};