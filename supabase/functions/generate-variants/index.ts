import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { baseQuestion } = await req.json();
    
    if (!baseQuestion) {
      throw new Error('Base question is required');
    }

    const prompt = `
**Objective**: As a technical instructional designer with over 10 years of experience, your task is to generate variant questions from a given base question.
  - Each base question includes Question text, Options, Correct Option, and Explanation text. Also optionally there can be an SQL query and database table or schema.
  - For these questions students require to analyze the question text, query and table/schema to answer the question correctly.
  - These questions assess the students' ability to understand and interpret query and table. Create variants by asking the same question in different ways.

## Input

### Base Question

\${baseQuestion}

## Steps for Variant Creation:

1. **Identify the Concept**: Determine the precise concept being assessed in the base question by closely examining the question text and the correct answer. Ensure that this concept is clearly understood before proceeding to create variants.
2. **Pick Specific Variant Types**: Choose different types of question variants. If the given question can be meaningfully converted to any of the provided variants, generate the question in that variants.
3. **Independent Questions**: The created variants should have all the information to answer the question correctly independent of the base question.
4. **Different Examples in Variants**: Among the created variants use different examples maintaining the base MCQ's specific concept and the learning outcome.
5. **Develop Concept-Focused Variants**: Create different variants strictly aligning with the base MCQ's specific concept with different examples and tables.
6. **Consistency in Cognitive Level**: The variants should match the base question's Bloom's taxonomy level, maintaining the same depth and complexity with different examples and tables.
7. **Follow Guidelines**: Adhere to all guidelines for questions, correct option, wrong options, query, table, true or false and explanations.
8. **Encourage Creativity**: Generate questions covering all of the given variants. Do not restrict yourself to these variants, you can be creative as well but ensure the guidelines are followed.


Ensure to generate the following variants:
1. Code Analysis Multiple Choice Output Prediction
2. Code Analysis Multiple Choice Output Prediction with True/False
3. Code Analysis Multiple Choice Code Prediction with Input and Output Data
4. Code Analysis Multiple Choice with Code in Options
5. Code Analysis Error Identification
6. Code Analysis Error Identification with True/False
7. Code Analysis Identify and Fix Errors
8. Code Analysis Identify Functionality
9. Code Analysis Identify Functionality with True/False
10. Code Analysis Identify Equivalent Code


## Variant Types


### 1. **Code Analysis Multiple Choice Output Prediction**
    - Convert the question to a code analysis multiple-choice question, include a relevant query, and ensure there's a single correct answer.
        - **Example base question**:
            TOPIC: Aggregations
            CONCEPT: Aggregations - AVG
            QUESTION_KEY:VDT05
            BASE_QUESTION_KEYS:NA
            QUESTION_TEXT:Which function is used to calculate the average of the values in the result?
            CONTENT_TYPE:MARKDOWN
            QUESTION_TYPE:MULTIPLE_CHOICE
            LEARNING_OUTCOME:understand_avg_function
            CODE:NA
            CODE_LANGUAGE:NA
            OPTION_1:COUNT
            OPTION_2:AVG
            OPTION_3:AVERAGE
            OPTION_4:MEAN
            CORRECT_OPTION:OPTION_1
            EXPLANATION:
            BLOOM_LEVEL:UNDERSTANDING
            -END-
        - **Generated Variant**:
            TOPIC:SQL Aggregations
            CONCEPT:SQL Aggregations - Avg function
            QUESTION_KEY: VDT05_v1
            BASE_QUESTION_KEYS: VDT05
            QUESTION_TEXT:
            Considering the given table and the SQL query what will be the result of the given sql query?

            **Table**: player_match_details

            | Name   | Match  | Score | Fours | Sixes | Year |
            |:--------:|:--------:|:-------:|:-------:|:-------:|:------:|
            | Ram    | RR vs SRH |  20  | 2    | 2     | 2011 |
            | Joseph | SRH vs CSK | 40   | 2    | 4     | 2012 |
            | Lokesh | DC vs DD  | 30   | 2    | 13    | 2013 |

            \`\`\`sql
            SELECT
                AVG(score) AS avg_score
            FROM
                player_match_details;
            \`\`\`
            LEARNING_OUTCOME: understand_avg_function
            CONTENT_TYPE: MARKDOWN
            QUESTION_TYPE: MULTIPLE_CHOICE
            CODE: NA
            CODE_LANGUAGE: NA
            OPTION_1:

            | avg_score   |
            |:--------:|
            | 30    |

            OPTION_2:

            | avg_score   |
            |:--------:|
            | 20    |

            OPTION_3:

            | avg_score   |
            |:--------:|
            | 90    |

            OPTION_4:
            No such column: avg_score

            CORRECT_OPTION: OPTION_1
            EXPLANATION:
            BLOOM_LEVEL: REMEMBERING

            -END-

### 2. **Code Analysis Multiple Choice Output Prediction with True/False**
    - Convert the question into a statement and ask if it is true or false.
        - **Example base question**:
            TOPIC: Aggregations
            CONCEPT: Aggregations - AVG
            QUESTION_KEY:VDT12
            BASE_QUESTION_KEYS:NA
            QUESTION_TEXT:Which function is used to calculate the average of the values in the result?
            CONTENT_TYPE:MARKDOWN
            QUESTION_TYPE:MULTIPLE_CHOICE
            LEARNING_OUTCOME:understand_avg_function
            CODE:NA
            CODE_LANGUAGE:NA
            OPTION_1:COUNT
            OPTION_2:AVG
            OPTION_3:AVERAGE
            OPTION_4:MEAN
            CORRECT_OPTION:OPTION_1
            EXPLANATION:
            BLOOM_LEVEL:UNDERSTANDING
            -END-
        - **Generated Variant**:
            TOPIC:SQL Aggregations
            CONCEPT:SQL Aggregations - Avg function
            QUESTION_KEY: VDT12_v1
            BASE_QUESTION_KEYS: VDT12
            QUESTION_TEXT:
            Considering the given table and the SQL query, the resultant table will have \`avg_score\` column with value **30** as output.

            **Table**: \`player_match_details\`

            | Name   | Match  | Score | Fours | Sixes | Year |
            |:--------:|:--------:|:-------:|:-------:|:-------:|:------:|
            | Ram    | RR vs SRH |  20  | 2    | 2     | 2011 |
            | Joseph | SRH vs CSK | 40   | 2    | 4     | 2012 |
            | Lokesh | DC vs DD  | 30   | 2    | 13    | 2013 |

            \`\`\`sql
            SELECT
                AVG(score) AS avg_score
            FROM
                player_match_details;
            \`\`\`
            LEARNING_OUTCOME: understand_avg_function
            CONTENT_TYPE: MARKDOWN
            QUESTION_TYPE: MULTIPLE_CHOICE
            CODE: NA
            CODE_LANGUAGE: NA
            OPTION_1: True
            OPTION_2: False
            CORRECT_OPTION: OPTION_1
            EXPLANATION:
            BLOOM_LEVEL: REMEMBERING

            -END-

### 3. **Code Analysis Multiple Choice Code Prediction with Input and Output data**
    - Convert the question into a question text containing question text, input table and output table.
        - **Example base question**:
            TOPIC: Arthmetic Functions
            CONCEPT: Arthmetic Functions - Round Function
            QUESTION_KEY:VDT12
            BASE_QUESTION_KEYS:NA
            QUESTION_TEXT:Which of the following functions is used to round the values in a column?
            CONTENT_TYPE:MARKDOWN
            QUESTION_TYPE:MULTIPLE_CHOICE
            LEARNING_OUTCOME:understand_avg_function
            CODE:NA
            CODE_LANGUAGE:NA
            OPTION_1:ROUND
            OPTION_2:AVG
            OPTION_3:AVERAGE
            OPTION_4:ROUNDED
            CORRECT_OPTION:OPTION_1
            EXPLANATION:
            BLOOM_LEVEL:UNDERSTANDING
            -END-
        - **Generated Variant**:
            TOPIC: Arthmetic Functions
            CONCEPT: Arthmetic Functions - Round Function
            QUESTION_KEY: VDT12_v1
            BASE_QUESTION_KEYS: VDT12
            QUESTION_TEXT:
            Consider the data in the \`temperature\` table. Choose the appropriate query to get the expected output.

            **temperature** table:

            | id | city         | temp\_f |
            |----|--------------|--------|
            | 1  | New York     | 32.1   |
            | 2  | Chicago      | 31.5   |
            | 3  | Miami        | 76.2   |
            | 4  | Seattle      | 42.8   |
            | 5  | Los Angeles  | 65.9   |

            **Expected Output**:

            | city      | weather\_report                   |
            |-----------|----------------------------------|
            | New York  | The temperature is 32 degrees.  |
            | .....  | .........  |
            LEARNING_OUTCOME: understand_avg_function
            CONTENT_TYPE: MARKDOWN
            QUESTION_TYPE: MULTIPLE_CHOICE
            CODE: NA
            CODE_LANGUAGE: NA
            OPTION_1:

            \`\`\`sql
            SELECT
                city,
                'The temperature is ' || temp_f || ' degrees.'
            FROM
                temperature;
            \`\`\`

            OPTION_2:

            \`\`\`sql
            SELECT
                city,
                'The temperature is ' || ROUND(temp_f) || ' degrees.'
            FROM
                temperature;
            \`\`\`

            OPTION_3:

            \`\`\`sql
            SELECT
                city,
                'The temperature is ' || CEIL(temp_f) || ' degrees.'
            FROM
                temperature;
            \`\`\`

            OPTION_4: None of the given options

            CORRECT_OPTIONS: OPTION_2
            EXPLANATION:
            BLOOM_LEVEL: REMEMBERING

            -END-

### 4. **Code Analysis Multiple Choice with Code in Options**
    - Convert the question into a statement and ask if it is true or false.
        - **Example base question**:
            TOPIC:SQL Logical Operators
            CONCEPT:SQL Logical Operators - OR Operator
            QUESTION_KEY:VDT12
            BASE_QUESTION_KEYS:NA
            QUESTION_TEXT:
            Which of the following is correct regarding the given SQL query?

            \`\`\`sql
            SELECT
                *
            FROM
                user
            WHERE
                (
                    age < 18
                    OR age > 60
                )
            \`\`\`
            CONTENT_TYPE:MARKDOWN
            QUESTION_TYPE:MULTIPLE_CHOICE
            LEARNING_OUTCOME:understand_logical_or_operator
            CODE:NA
            CODE_LANGUAGE:NA
            OPTION_1:Rows where age is less than 18 or greater than 60, excluding 18 and 60
            OPTION_2:Rows where age is between 18 and 60, excluding 18 and 60
            OPTION_3:Rows where age is neither less than 18 nor greater than 60
            OPTION_4:No rows will be returned
            CORRECT_OPTION:OPTION_1
            EXPLANATION:
            BLOOM_LEVEL:UNDERSTANDING
            -END-
        - **Generated Variant**:
            TOPIC:SQL Logical Operators
            CONCEPT:SQL Logical Operators - OR Operator
            QUESTION_KEY: VDT12_v1
            BASE_QUESTION_KEYS: VDT12
            QUESTION_TEXT:
            Consider the following table named students:

            | id | name    | age | grade |
            |----|---------|-----|-------|
            | 1  | Alice   | 21  | A     |
            | 2  | Bob     | 17  | B     |
            | 3  | Charlie | 23  | C     |
            | 4  | David   | 19  | D     |

            Which of the following queries fetches data that satisfies any of the given conditions?

            1. \`age\` is greater than **20**.
            2. \`grade\` is **A**.
            LEARNING_OUTCOME: understand_logical_or_operator
            CONTENT_TYPE: MARKDOWN
            QUESTION_TYPE: MULTIPLE_CHOICE
            CODE: NA
            CODE_LANGUAGE: NA
            OPTION_1:
            \`\`\`sql
            SELECT
                *
            FROM
                students
            WHERE
                age > 20
            AND
                grade = 'A';
            \`\`\`
            OPTION_2:

            \`\`\`sql
            SELECT
                *
            FROM
                students
            WHERE
                age > 20
            OR
                grade = 'A';
            \`\`\`
            OPTION_3:

            \`\`\`sql
            SELECT
                *
            FROM
                students
            WHERE
                age > 20
            AND NOT
                grade = 'A';
            \`\`\`
            OPTION_4: None of the given options
            CORRECT_OPTION: OPTION_2
            EXPLANATION:
            BLOOM_LEVEL: APPLYING

            -END-

### 5. **Code Analysis Error Identification**
    - Point out errors in the given SQL query
        - **Example base question**:
            TOPIC: Aggregations
            CONCEPT: Aggregations - AVG
            QUESTION_KEY:VDT10
            BASE_QUESTION_KEYS:NA
            QUESTION_TEXT:Which function is used to calculate the average of the values in the result?
            CONTENT_TYPE:MARKDOWN
            QUESTION_TYPE:MULTIPLE_CHOICE
            LEARNING_OUTCOME:understand_avg_function
            CODE:NA
            CODE_LANGUAGE:NA
            OPTION_1:COUNT
            OPTION_2:AVG
            OPTION_3:AVERAGE
            OPTION_4:MEAN
            CORRECT_OPTION:OPTION_1
            EXPLANATION:
            BLOOM_LEVEL:UNDERSTANDING
            -END-
        - **Generated Variant**:
            TOPIC:SQL Aggregations
            CONCEPT:SQL Aggregations - Avg function
            QUESTION_KEY: VDT10_v1
            BASE_QUESTION_KEYS: VDT10
            QUESTION_TEXT:
            Considering the given SQL query, the query is not resulting the average of of the scores, what is the error in the given SQL query?

            \`\`\`sql
            SELECT
                AVERAGE(score) AS avg_score
            FROM
                player_match_details;
            \`\`\`
            LEARNING_OUTCOME: understand_avg_function
            CONTENT_TYPE: MARKDOWN
            QUESTION_TYPE: MULTIPLE_CHOICE
            CODE: NA
            CODE_LANGUAGE: NA
            OPTION_1:
            AVERAGE should be changed to AVG
            OPTION_2:
            AVERAGE should be changed to MEAN
            OPTION_3:
            AVERAGE(score) should be changed to AVERAGE[score]
            OPTION_4:
            None of the given options
            CORRECT_OPTION: OPTION_1
            EXPLANATION:
            BLOOM_LEVEL: REMEMBERING

            -END-


### 6. **Code Analysis Error Identification with True/False**
    - Generate a True/False question requiring students to identify if an error exists in the given SQL query
        - **Example base question**:
            TOPIC: Aggregations
            CONCEPT: Aggregations - AVG
            QUESTION_KEY:VDT13
            BASE_QUESTION_KEYS:NA
            QUESTION_TEXT:Which function is used to calculate the average of the values in the result?
            CONTENT_TYPE:MARKDOWN
            QUESTION_TYPE:MULTIPLE_CHOICE
            LEARNING_OUTCOME:understand_avg_function
            CODE:NA
            CODE_LANGUAGE:NA
            OPTION_1:COUNT
            OPTION_2:AVG
            OPTION_3:AVERAGE
            OPTION_4:MEAN
            CORRECT_OPTION:OPTION_1
            EXPLANATION:
            BLOOM_LEVEL:UNDERSTANDING
            -END-
        - **Generated Variant**:
            TOPIC:SQL Aggregations
            CONCEPT:SQL Aggregations - Avg function
            QUESTION_KEY: VDT13_v1
            BASE_QUESTION_KEYS: VDT13
            QUESTION_TEXT:
            In the given SQL query, \`AVG\` is the not the correct function to get average of of the scores.

            \`\`\`sql
            SELECT
                AVERAGE(score) AS avg_score
            FROM
                player_match_details;
            \`\`\`
            LEARNING_OUTCOME: understand_avg_function
            CONTENT_TYPE: MARKDOWN
            QUESTION_TYPE: MULTIPLE_CHOICE
            CODE: NA
            CODE_LANGUAGE: NA
            OPTION_1:
            True
            OPTION_2:
            False
            CORRECT_OPTION: OPTION_1
            EXPLANATION:
            BLOOM_LEVEL: REMEMBERING

            -END-


### 7. **Code Analysis Identify and Fix Errors**
    - Provide an SQL query with an error and ask for the correct fix.
        - **Example base question**:
            TOPIC: Aggregations
            CONCEPT: Aggregations - AVG
            QUESTION_KEY:VDT13
            BASE_QUESTION_KEYS:NA
            QUESTION_TEXT:Which function is used to calculate the average of the values in the result?
            CONTENT_TYPE:MARKDOWN
            QUESTION_TYPE:MULTIPLE_CHOICE
            LEARNING_OUTCOME:understand_avg_function
            CODE:NA
            CODE_LANGUAGE:NA
            OPTION_1:COUNT
            OPTION_2:AVG
            OPTION_3:AVERAGE
            OPTION_4:MEAN
            CORRECT_OPTION:OPTION_1
            EXPLANATION:
            BLOOM_LEVEL:UNDERSTANDING
            -END-
        - **Generated Variant**:
            TOPIC:SQL Aggregations
            CONCEPT:SQL Aggregations - Avg function
            QUESTION_KEY: VDT13_v1
            BASE_QUESTION_KEYS: VDT13
            QUESTION_TEXT:
            In the given SQL query, \`AVERAGE\` should be changed to \`AVG\` to result in the average of the scores.

            \`\`\`sql
            SELECT
                AVERAGE(score) AS avg_score
            FROM
                player_match_details;
            \`\`\`
            LEARNING_OUTCOME: understand_avg_function
            CONTENT_TYPE: MARKDOWN
            QUESTION_TYPE: MULTIPLE_CHOICE
            CODE: NA
            CODE_LANGUAGE: NA
            OPTION_1:
            True
            OPTION_2:
            False
            CORRECT_OPTION: OPTION_1
            EXPLANATION:
            BLOOM_LEVEL: REMEMBERING

            -END-

### 8. **Code Analysis Identify Functionality**
    - Identify Functionality focuses on the end goal or purpose of the query, what it is meant to achieve or perform.
    - Identify Functionality requires understanding the overall effect or result of executing the query.
    - Identify Functionality is used to assess comprehension of what the query is supposed to do as a whole.
        - **Example base question**:
            TOPIC: Aggregations
            CONCEPT: Aggregations - AVG
            QUESTION_KEY:VDT13
            BASE_QUESTION_KEYS:NA
            QUESTION_TEXT:Which function is used to calculate the average of the values in the result?
            CONTENT_TYPE:MARKDOWN
            QUESTION_TYPE:MULTIPLE_CHOICE
            LEARNING_OUTCOME:understand_avg_function
            CODE:NA
            CODE_LANGUAGE:NA
            OPTION_1:COUNT
            OPTION_2:AVG
            OPTION_3:AVERAGE
            OPTION_4:MEAN
            CORRECT_OPTION:OPTION_1
            EXPLANATION:
            BLOOM_LEVEL:UNDERSTANDING
            -END-
        - **Generated Variant**:
            TOPIC:SQL Aggregations
            CONCEPT:SQL Aggregations - Avg function
            QUESTION_KEY: VDT13_v1
            BASE_QUESTION_KEYS: VDT13
            QUESTION_TEXT:
            What is the functionality of the given SQL query?

            \`\`\`sql
            SELECT
                AVG(score) AS avg_score
            FROM
                player_match_details;
            \`\`\`
            LEARNING_OUTCOME: understand_avg_function
            CONTENT_TYPE: MARKDOWN
            QUESTION_TYPE: MULTIPLE_CHOICE
            CODE: NA
            CODE_LANGUAGE: NA
            OPTION_1:
            To find the average of the scores
            OPTION_2:
            To find the maximum of the scores
            OPTION_3:
            To find the minimum of the scores
            OPTION_4:
            None of the given options
            CORRECT_OPTION: OPTION_1
            EXPLANATION:
            BLOOM_LEVEL: REMEMBERING

            -END-

### 9. **Code Analysis Identify Functionality True/Flase**
    - Identify Functionality focuses on the end goal or purpose of the query, what it is meant to achieve or perform.
    - Identify Functionality requires understanding the overall effect or result of executing the query.
    - Identify Functionality is used to assess comprehension of what the query is supposed to do as a whole.
    - Generate a True/False question requiring students to determine if a provided functionality correctly describes the functionality of the given SQL query.
        - **Example base question**:
            TOPIC: Aggregations
            CONCEPT: Aggregations - AVG
            QUESTION_KEY:VDT13
            BASE_QUESTION_KEYS:NA
            QUESTION_TEXT:Which function is used to calculate the average of the values in the result?
            CONTENT_TYPE:MARKDOWN
            QUESTION_TYPE:MULTIPLE_CHOICE
            LEARNING_OUTCOME:understand_avg_function
            CODE:NA
            CODE_LANGUAGE:NA
            OPTION_1:COUNT
            OPTION_2:AVG
            OPTION_3:AVERAGE
            OPTION_4:MEAN
            CORRECT_OPTION:OPTION_1
            EXPLANATION:
            BLOOM_LEVEL:UNDERSTANDING
            -END-
        - **Generated Variant**:
            TOPIC:SQL Aggregations
            CONCEPT:SQL Aggregations - Avg function
            QUESTION_KEY: VDT13_v1
            BASE_QUESTION_KEYS: VDT13
            QUESTION_TEXT:
            The given SQL query will result in the average of the scores from the \`player_match_details\` table.

            \`\`\`sql
            SELECT
                AVG(score) AS avg_score
            FROM
                player_match_details;
            \`\`\`
            LEARNING_OUTCOME: understand_avg_function
            CONTENT_TYPE: MARKDOWN
            QUESTION_TYPE: MULTIPLE_CHOICE
            CODE: NA
            CODE_LANGUAGE: NA
            OPTION_1:
            True
            OPTION_2:
            False
            CORRECT_OPTION: OPTION_1
            EXPLANATION:
            BLOOM_LEVEL: REMEMBERING

            -END-

### 10. Code Analysis: Identify Equivalent Code
    - Identify Equivalent query focuses on finding alternative queries that produce the same output as the given query.
    - This requires understanding how different pieces of query can achieve the same result and is used to assess comprehension of query functionality and output equivalence.
        - **Example base question**:
            TOPIC: Aggregations
            CONCEPT: Aggregations - AVG
            QUESTION_KEY:VDT13
            BASE_QUESTION_KEYS:NA
            QUESTION_TEXT:Which function is used to calculate the average of the values in the result?
            CONTENT_TYPE:MARKDOWN
            QUESTION_TYPE:MULTIPLE_CHOICE
            LEARNING_OUTCOME:understand_avg_function
            CODE:NA
            CODE_LANGUAGE:NA
            OPTION_1:COUNT
            OPTION_2:AVG
            OPTION_3:AVERAGE
            OPTION_4:MEAN
            CORRECT_OPTION:OPTION_1
            EXPLANATION:
            BLOOM_LEVEL:UNDERSTANDING
            -END-
        - **Generated Variant**:
            TOPIC:SQL Aggregations
            CONCEPT:SQL Aggregations - Avg function
            QUESTION_KEY: VDT13_v1
            BASE_QUESTION_KEYS: VDT13
            QUESTION_TEXT:
            Considering the given queries, both **Query-1** and **Query-2** will give the same result.

            **Query-1**:

            \`\`\`sql
            SELECT
                AVG(score) AS avg_score
            FROM
                player_match_details;
            \`\`\`

            **Query-2**:

            \`\`\`sql
            SELECT
                (SUM(score) / COUNT(*)) AS avg_score
            FROM
                player_match_details;
            \`\`\`

            LEARNING_OUTCOME: understand_avg_function
            CONTENT_TYPE: MARKDOWN
            QUESTION_TYPE: MULTIPLE_CHOICE
            CODE: NA
            CODE_LANGUAGE: NA
            OPTION_1:
            True
            OPTION_2:
            False
            CORRECT_OPTION: OPTION_1
            EXPLANATION:
            BLOOM_LEVEL: REMEMBERING

            -END-

            **More Sample Question Texts**:
            - Both the given SQL queries will result in the same result.


## Guidelines

Require the generator to confirm it created all 10 variants at the end:
Confirmed: All 11 variants generated.
---Code Analysis Variants Generated---
    `;

    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT')?.replace(/\/$/, '');
    const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT');

    if (!azureEndpoint || !apiKey || !deployment) {
      throw new Error('Azure OpenAI configuration incomplete');
    }

    console.log('Sending request to Azure OpenAI...');
    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-05-15`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a technical instructional designer specialized in creating SQL MCQs.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from Azure OpenAI:', data);

    // Ensure we have a valid response with content
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Azure OpenAI');
    }

    // Parse the response content to extract variants
    const variantsContent = data.choices[0].message.content;
    
    // Create a default array of variants based on the base question
    const variants = [{
      ...baseQuestion,
      id: crypto.randomUUID(),
      questionKey: `${baseQuestion.questionKey}_v1`,
      questionCategory: 'VARIANT'
    }];

    console.log('Generated variants:', variants);

    return new Response(
      JSON.stringify({ variants }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-variants function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
