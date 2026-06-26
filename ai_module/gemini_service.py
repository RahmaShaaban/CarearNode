import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# تحميل المتغيرات من ملف .env
load_dotenv()

# قراءة المفتاح بأمان
GENAI_API_KEY = os.getenv("GENAI_API_KEY")
genai.configure(api_key=GENAI_API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')
def generate_questions_ai(track, level, language, num_questions):
    """توليد أسئلة المقابلة"""
    prompt = f"""
    Act as a STRICT Expert Technical Interviewer.
    Generate EXACTLY {num_questions} technical interview question(s) for a '{track}' developer at '{level}' level.

    CRITICAL INSTRUCTIONS:
    1. DIVERSE TOPICS: Ensure questions cover a wide range of core concepts within the '{track}' domain. Do not repeat the same sub-topic.
    2. KEEP IT SHORT: Max 1-2 sentences. Direct questions only. No long scenarios.
    3. VERBAL ONLY: Ask to explain, compare, or describe. No code writing.
    4. BASE LANGUAGE: {language}. The grammar, prepositions, and conversational parts must be in {language}.
    
    5. STRICT ZERO-TRANSLATION RULE FOR TECH TERMS (CRITICAL): 
       - NEVER translate ANY technical terms, programming concepts, algorithms, data structures, architectures, or frameworks into Arabic.
       - ALL technical keywords MUST remain in their original pure English letters.
       - If {language} is 'Arabic', you MUST structurally integrate the English term using the prefix "الـ" before it to make it sound natural (e.g., "الـ API", "الـ Server", "الـ Framework").
       - Maintain this exact sentence structure: [Arabic conversational text] + [English Tech Term] + [Arabic conversational text].
       - FORBIDDEN ARABIC TRANSLATIONS: مصفوفة, واجهة برمجة, خيط, عملية, تصنيف, كائن, شبكة. (Never use these or any similar literal translations).

    6. FORMAT: Output ONLY a valid JSON array of strings. No markdown, no extra text.
    """
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.8, # رفعنا الـ Temperature سنة صغيرة جداً عشان نرجعله الإبداع والتنوع في الأسئلة
                response_mime_type="application/json" 
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Question Error: {e}")
        fallback_q = "ما هي التحديات التي واجهتك في مشروعك الأخير؟" if language == 'ar' else "What challenges did you face in your last project?"
        return [fallback_q] * int(num_questions)

def clean_arabic_transcript(raw_text):
    """دالة جديدة: تنظيف أخطاء Whisper في المصطلحات التقنية"""
    print("✨ Cleaning technical terms using Gemini...")
    prompt = f"""
    Act as a technical reviewer. Correct technical terms in this Arabic/English interview transcript.
    Common errors: 'Sequence' -> 'SQL', 'Tablets' -> 'Tables', 'عوارع' -> 'عبارة عن'.
    Return ONLY the corrected text.
    
    Original: "{raw_text}"
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as gemini_err:
        print(f"⚠️ Gemini Cleaning failed: {gemini_err}. Using raw text.")
        return raw_text

def analyze_content_ai(question, user_transcript, language):
    """تقييم إجابة المتدرب"""
    if not user_transcript or len(user_transcript.split()) < 3:
        return {
            "score": 0, 
            "feedback": "الإجابة قصيرة جداً أو غير مسموعة." if language == 'ar' else "Answer is too short or inaudible.", 
            "ideal_answer": "N/A", 
            "tips": ["تأكد من إعدادات الميكروفون وتحدث بوضوح" if language == 'ar' else "Check microphone and speak clearly"]
        }

    prompt = f"""
    You are an expert technical interviewer evaluating a candidate's verbal answer.
    
    Context:
    - Interview Track & Level: Technical Interview
    - The Question Asked: "{question}"
    - The Candidate's Answer (Transcribed Speech): "{user_transcript}"
    - Response Language: {language} (You MUST respond in this language)
    
    Task:
    Evaluate the candidate's spoken answer based on technical accuracy, clarity, and logical thinking.
    Keep in mind this is a spoken answer, so ignore minor grammatical errors and focus on the technical meaning.
    
    Scoring Rubric:
    - 0-30: Completely wrong or irrelevant.
    - 31-60: Partially correct but missing key technical details.
    - 61-85: Good answer, but could be more precise or structured better.
    - 86-100: Excellent, accurate, and comprehensive explanation.

    You must output your evaluation strictly as a JSON object with the following schema:
    {{
        "score": integer (0 to 100),
        "feedback": "string (Constructive feedback explaining the score)",
        "ideal_answer": "string (How an expert would explain this verbally and concisely)",
        "tips": ["string", "string", "string"] (Exactly 3 actionable tips for improvement)
    }}
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3, 
                response_mime_type="application/json" 
            )
        )
        return json.loads(response.text)
        
    except Exception as e:
        print(f"Gemini Analysis Error: {e}")
        return {
            "score": 0, 
            "feedback": "حدث خطأ أثناء تقييم الإجابة." if language == 'ar' else "Error analyzing content.", 
            "ideal_answer": "N/A", 
            "tips": []
        }