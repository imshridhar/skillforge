package com.skillforge.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@SuppressWarnings("null")
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String modelName;

    @Value("${gemini.api.mock-enabled:false}")
    private boolean mockEnabled;

    private static final String GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Common structure for Gemini generateContent requests.
     */
    private String buildPromptPayload(String rawPrompt) throws JsonProcessingException {
        // {"contents":[{"parts":[{"text":"rawPrompt"}]}]}
        var textNode = objectMapper.createObjectNode().put("text", rawPrompt);
        var partsArray = objectMapper.createArrayNode().add(textNode);
        var contentsNode = objectMapper.createObjectNode().set("parts", partsArray);
        var rootNode = objectMapper.createObjectNode().set("contents",
                objectMapper.createArrayNode().add(contentsNode));
        return objectMapper.writeValueAsString(rootNode);
    }

    /**
     * Common structure for parsing Gemini responses.
     */
    private String extractTextFromResponse(String jsonResponse) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(jsonResponse);
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && candidates.size() > 0) {
            JsonNode firstCandidate = candidates.get(0);
            JsonNode parts = firstCandidate.path("content").path("parts");
            if (parts.isArray() && parts.size() > 0) {
                return parts.get(0).path("text").asText();
            }
        }
        return "{}"; // Fallback to an empty JSON object if parsing fails
    }

    public String generateContent(String prompt) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("placeholder-key-for-now")) {
            if (mockEnabled) {
                return generateMockResponse(prompt);
            }
            throw new IllegalStateException("Gemini API key not configured. Set gemini.api.key to a valid key.");
        }

        try {
            String url = GEMINI_API_URL_TEMPLATE.formatted(modelName, apiKey);
            String requestPayload = buildPromptPayload(prompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestPayload, headers);

            String response = restTemplate.postForObject(url, entity, String.class);
            return extractTextFromResponse(response);
        } catch (Exception e) {
            if (mockEnabled) {
                // Fall back to a safe mock response to keep authoring flows unblocked in dev
                return generateMockResponse(prompt);
            }
            throw new RuntimeException("Gemini API request failed. Check your model name, key, and network access.", e);
        }
    }

    // A fallback if the API key isn't provided or the request fails (helpful for
    // local dev if key is missing)
    private String generateMockResponse(String prompt) {
        if (prompt.contains("course plan")) {
            return "[{\"title\": \"Module 1: Introduction\", \"duration\": \"1 Week\", \"outcomes\": \"Understand the basics.\"},"
                    +
                    "{\"title\": \"Module 2: Advanced Concepts\", \"duration\": \"2 Weeks\", \"outcomes\": \"Apply complex logic.\"}]";
        } else if (prompt.contains("content recommendations")) {
            return "[{\"title\":\"Module 1: Foundations\",\"description\":\"Build core understanding.\",\"contents\":[{\"title\":\"Kickoff video\",\"contentType\":\"VIDEO\",\"contentText\":\"Overview of the topic.\"},{\"title\":\"Study notes\",\"contentType\":\"NOTE\",\"contentText\":\"Key concepts and terminology.\"}]},{\"title\":\"Module 2: Practice\",\"description\":\"Apply the concepts.\",\"contents\":[{\"title\":\"Hands-on worksheet\",\"contentType\":\"DOCUMENT\",\"contentText\":\"Guided practice problems.\"}]}]";
        } else if (prompt.contains("exam questions")) {
            int count = extractCountFromPrompt(prompt, 5);
            String topics = extractTopicsFromPrompt(prompt);
            String mode = detectMockQuestionMode(prompt);

            StringBuilder builder = new StringBuilder("[");
            for (int i = 1; i <= count; i++) {
                if (i > 1) {
                    builder.append(',');
                }

                String questionBlock = switch (mode) {
                    case "TRUE_FALSE" -> buildMockTrueFalse(topics, i);
                    case "FLASHCARD" -> buildMockFlashcard(topics, i);
                    case "TEXT" -> buildMockTextQuestion(topics, i);
                    case "MIXED" -> switch ((i - 1) % 4) {
                        case 0 -> buildMockMcq(topics, i);
                        case 1 -> buildMockTrueFalse(topics, i);
                        case 2 -> buildMockFlashcard(topics, i);
                        default -> buildMockTextQuestion(topics, i);
                    };
                    default -> buildMockMcq(topics, i);
                };

                builder.append(questionBlock);
            }
            builder.append(']');
            return builder.toString();
        } else if (prompt.contains("quiz")) {
            return "[{\"question\": \"What did this video just cover?\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctAnswer\": \"A\"}]";
        } else if (prompt.contains("grading a learner response")) {
            return "{\"score\": 82, \"isCorrect\": true, \"feedback\": \"The response covers the main expected concepts with minor gaps.\"}";
        }
        return "{}";
    }

    private int extractCountFromPrompt(String prompt, int fallback) {
        if (prompt == null) {
            return fallback;
        }
        try {
            String marker = "Generate exactly ";
            int start = prompt.indexOf(marker);
            if (start >= 0) {
                int end = prompt.indexOf(" exam questions", start);
                if (end > start) {
                    String number = prompt.substring(start + marker.length(), end).trim();
                    return Integer.parseInt(number);
                }
            }
        } catch (Exception ignored) {
        }
        return fallback;
    }

    private String extractTopicsFromPrompt(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return "the topic";
        }
        String lower = prompt.toLowerCase();
        int aboutIndex = lower.indexOf("about:");
        if (aboutIndex >= 0) {
            int start = aboutIndex + "about:".length();
            int end = prompt.indexOf('.', start);
            if (end == -1) {
                end = prompt.length();
            }
            String extracted = prompt.substring(start, end).trim();
            if (!extracted.isBlank()) {
                return extracted;
            }
        }
        return "the topic";
    }

    private String detectMockQuestionMode(String prompt) {
        if (prompt == null) {
            return "MCQ";
        }
        String upper = prompt.toUpperCase();
        if (upper.contains("TRUE_FALSE")) {
            return "TRUE_FALSE";
        }
        if (upper.contains("FLASHCARD")) {
            return "FLASHCARD";
        }
        if (upper.contains("SHORT-ANSWER") || upper.contains("SHORT ANSWER") || upper.contains("STRICTLY 'TEXT'")) {
            return "TEXT";
        }
        if (upper.contains("MIX OF QUESTION TYPES") || upper.contains("MIXED")) {
            return "MIXED";
        }
        return "MCQ";
    }

    private String buildMockMcq(String topics, int index) {
        String safeTopics = topics == null || topics.isBlank() ? "the topic" : topics;
        int variant = Math.max(0, index - 1);

        String[] stems = new String[] {
                "Which statement best describes " + safeTopics + "?",
                "What is a primary goal of " + safeTopics + "?",
                "Which option is the best example of " + safeTopics + "?",
                "Why is " + safeTopics + " important in problem solving?",
                "Which claim about " + safeTopics + " is most accurate?",
                "What is a common application of " + safeTopics + "?"
        };

        String[] correctAnswers = new String[] {
                "It helps choose efficient strategies for organizing and processing data.",
                "It improves performance by matching data representation to the task.",
                "It focuses on analyzing efficiency, such as time and space usage.",
                "It provides structured ways to model and solve computational problems.",
                "It emphasizes selecting the right structure to simplify operations.",
                "It supports faster search, insertion, or traversal in real systems."
        };

        String[] wrongPool = new String[] {
                "It is only relevant to graphic design and UI layout.",
                "It replaces the need for testing and debugging.",
                "It is a hardware-only concern unrelated to software design.",
                "It guarantees constant time for all operations.",
                "It is mainly about file compression formats.",
                "It is used only when programming embedded devices.",
                "It removes the need to consider memory usage.",
                "It is a synonym for network security protocols.",
                "It is only applied in machine learning pipelines.",
                "It is a deprecated approach no longer used in modern systems."
        };

        String questionText = escapeJson(stems[variant % stems.length] + " (item " + index + ")");
        String correct = escapeJson(correctAnswers[variant % correctAnswers.length]);

        int wrongStart = (variant * 3) % wrongPool.length;
        String option2 = escapeJson(wrongPool[wrongStart]);
        String option3 = escapeJson(wrongPool[(wrongStart + 1) % wrongPool.length]);
        String option4 = escapeJson(wrongPool[(wrongStart + 2) % wrongPool.length]);

        return "{\"questionText\":\"" + questionText + "\",\"questionType\":\"MCQ\",\"options\":[\"" + correct + "\",\"" + option2 + "\",\"" + option3 + "\",\"" + option4 + "\"],\"correctAnswer\":\"" + correct + "\"}";
    }

    private String buildMockTrueFalse(String topics, int index) {
        String safeTopics = topics == null || topics.isBlank() ? "the topic" : topics;
        String[] statements = new String[] {
                safeTopics + " typically involves analyzing time and space trade-offs.",
                safeTopics + " is unrelated to data organization.",
                safeTopics + " often helps choose the right structure for efficient operations.",
                safeTopics + " has no impact on performance in real systems."
        };
        int variant = Math.max(0, index - 1);
        String questionText = escapeJson("True or False: " + statements[variant % statements.length]);
        boolean isTrue = (variant % 2) == 0;
        String answer = isTrue ? "True" : "False";
        return "{\"questionText\":\"" + questionText + "\",\"questionType\":\"TRUE_FALSE\",\"correctAnswer\":\"" + answer + "\"}";
    }

    private String buildMockFlashcard(String topics, int index) {
        String safeTopics = topics == null || topics.isBlank() ? "the topic" : topics;
        String[] fronts = new String[] {
                safeTopics + " — definition",
                safeTopics + " — key benefit",
                safeTopics + " — typical use case",
                safeTopics + " — common misconception"
        };
        String[] backs = new String[] {
                "A concise description of the core idea and why it matters.",
                "It helps reduce complexity by structuring data and operations.",
                "Used when choosing data layouts for efficient updates or queries.",
                "It does not guarantee speed without good implementation choices."
        };
        int variant = Math.max(0, index - 1);
        String questionText = escapeJson(fronts[variant % fronts.length] + " (card " + index + ")");
        String answer = escapeJson(backs[variant % backs.length]);
        return "{\"questionText\":\"" + questionText + "\",\"questionType\":\"FLASHCARD\",\"correctAnswer\":\"" + answer + "\"}";
    }

    private String buildMockTextQuestion(String topics, int index) {
        String safeTopics = topics == null || topics.isBlank() ? "the topic" : topics;
        String[] prompts = new String[] {
                "Explain the main idea behind " + safeTopics + ".",
                "Describe a real-world scenario where " + safeTopics + " improves performance.",
                "Compare two approaches related to " + safeTopics + " and when to use each.",
                "Outline the trade-offs you consider when applying " + safeTopics + "."
        };
        String[] sampleAnswers = new String[] {
                "It focuses on organizing data to make key operations efficient.",
                "For large datasets, it speeds up retrieval and updates.",
                "Choose the approach that minimizes time while controlling memory.",
                "Balance time complexity, space usage, and implementation complexity."
        };
        int variant = Math.max(0, index - 1);
        String questionText = escapeJson(prompts[variant % prompts.length] + " (item " + index + ")");
        String answer = escapeJson(sampleAnswers[variant % sampleAnswers.length]);
        return "{\"questionText\":\"" + questionText + "\",\"questionType\":\"TEXT\",\"correctAnswer\":\"" + answer + "\"}";
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }

    // Specialized Prompts

    public String generateCoursePlan(String subject, String difficulty) {
        String prompt = String.format(
                "Generate a course plan outline for '%s' at a '%s' level. " +
                        "Return ONLY a strictly structured JSON array format. Do not use markdown wraps like ```json. "
                        +
                        "The JSON array should contain objects with: 'title' (string), 'duration' (string), and 'outcomes' (string).",
                subject, difficulty);
        return generateContent(prompt);
    }

    public String generateExamQuestions(String topics, int count, String format) {
        String normalizedFormat = normalizeQuestionFormat(format);
        String formatInstructions = "";

        if ("MCQ".equalsIgnoreCase(normalizedFormat)) {
            formatInstructions = "Generate strictly multiple-choice questions. Each object must have: 'questionText' (string), 'questionType' (strictly 'MCQ'), 'options' (array of 4 strings), and 'correctAnswer' (string matching one option exactly).";
        } else if ("TRUE_FALSE".equalsIgnoreCase(normalizedFormat)) {
            formatInstructions = "Generate strictly True/False questions. Each object must have: 'questionText' (string), 'questionType' (strictly 'TRUE_FALSE'), and 'correctAnswer' (string, either 'True' or 'False'). Do not provide 'options'.";
        } else if ("FLASHCARD".equalsIgnoreCase(normalizedFormat)) {
            formatInstructions = "Generate strictly flashcard-style questions or concepts. Each object must have: 'questionText' (string, the front of the card), 'questionType' (strictly 'FLASHCARD'), and 'correctAnswer' (string, the back of the card/concept definition). Do not provide 'options'.";
        } else if ("TEXT".equalsIgnoreCase(normalizedFormat)) {
            formatInstructions = "Generate strictly subjective short-answer text questions. Each object must have: 'questionText' (string, the prompt), 'questionType' (strictly 'TEXT'), and 'correctAnswer' (string, the ideal expected answer). Do not provide 'options'.";
        } else { // MIXED
            formatInstructions = "Generate a mix of question types (MCQ, TRUE_FALSE, FLASHCARD, TEXT). Each object must have: 'questionText' (string) and 'questionType' (string matching one of the 4 types). If MCQ, include 'options' (array of 4 strings) and 'correctAnswer' (string matching an option). If TRUE_FALSE, 'correctAnswer' is 'True' or 'False'. If FLASHCARD or TEXT, 'correctAnswer' is the text answer.";
        }

        String prompt = String.format(
                "Generate exactly %d exam questions about: %s. %s " +
                        "Use the provided topic(s) explicitly. Avoid placeholder text like 'Sample question' or 'Option A'. " +
                        "For MCQ, provide 4 distinct, realistic options and make sure correctAnswer matches one option exactly. " +
                        "Return ONLY a strictly structured JSON array format. Do not use markdown wraps like ```json. ",
                count, topics, formatInstructions);
        return generateContent(prompt);
    }

    private String normalizeQuestionFormat(String format) {
        if (format == null || format.isBlank()) {
            return "MIXED";
        }

        return switch (format.trim().toUpperCase()) {
            case "QUESTION_ANSWER", "SHORT_ANSWER" -> "TEXT";
            case "FLASH_CARDS" -> "FLASHCARD";
            case "QUIZ" -> "MCQ";
            default -> format.trim().toUpperCase();
        };
    }

    public String generateVideoQuiz(String transcriptSummary) {
        String prompt = String.format(
                "Generate a 3-question quiz based on the following lecture content/summary: %s. " +
                        "Return ONLY a strictly structured JSON array format. Do not use markdown wraps like ```json. "
                        +
                        "The JSON array should contain objects with: 'question' (string), 'options' (array of 4 strings), and 'correctAnswer' (string matching one option exactly).",
                transcriptSummary);
        return generateContent(prompt);
    }

    public String generateFlashcards(String topics, int count) {
        return generateExamQuestions(topics, count, "FLASHCARD");
    }

    public String suggestLearningContent(String subject, String difficulty, String goals) {
        String prompt = String.format(
                "Generate content recommendations for a course in '%s' at '%s' difficulty. " +
                        "The learning goals are: %s. " +
                        "Return ONLY a JSON array of modules. Each module should include: 'title' (string), 'description' (string), and 'contents' (array). " +
                        "Each content item should include: 'title' (string), 'contentType' (one of VIDEO, NOTE, DOCUMENT, TEXT, QUIZ), and 'contentText' (string). " +
                        "Do not wrap the JSON in markdown.",
                subject, difficulty, goals);
        return generateContent(prompt);
    }

    public String gradeDescriptiveAnswer(String question, String expectedAnswer, String learnerAnswer) {
        String prompt = String.format(
                "You are grading a learner response. Question: %s. Expected answer or rubric: %s. Learner answer: %s. " +
                        "Return ONLY a JSON object with 'score' (0-100 number), 'isCorrect' (boolean), and 'feedback' (string). " +
                        "Be concise and fair.",
                question, expectedAnswer, learnerAnswer);
        return generateContent(prompt);
    }
}
