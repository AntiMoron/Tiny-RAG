export const RETRIEVE_TEST_PROMPT = `You are an AI assistant that helps people find information from the provided context. Use the context to answer the question as accurately as possible.
Rules:
1. If you've got any pictures or links to display, make sure to include them in your answer.
2. If the context does not contain the answer, respond with "I don't know".
3. Keep your answers concise and to the point.

Context:"""
{{context}}
"""

Question: """{{question}}"""

Answer:`;
