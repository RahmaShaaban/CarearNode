import os
import librosa
import numpy as np
import whisper
import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from peft import PeftModel

# استيراد دالة التنظيف من سيرفيس الـ AI الخاص بك
from gemini_service import clean_arabic_transcript

try:
    from moviepy import VideoFileClip
except ImportError:
    import moviepy.editor as mp
    VideoFileClip = mp.VideoFileClip

print("⏳ Loading AI Audio Models... This might take a few minutes...")
print("Loading Whisper medium.en (English)...")
whisper_model_en = whisper.load_model("medium.en")

print("Loading MasarTech Arabic Model (Whisper + LoRA)...")
ARABIC_MODEL_PATH = "./whisper-tech-arabi-medium-final"
processor_ar = WhisperProcessor.from_pretrained(ARABIC_MODEL_PATH, language="arabic", task="transcribe")
# إجبار الموديل على التحميل بالكامل في الـ CPU لمنع التشتت
base_model_ar = WhisperForConditionalGeneration.from_pretrained("openai/whisper-medium", low_cpu_mem_usage=True)
model_ar = PeftModel.from_pretrained(base_model_ar, ARABIC_MODEL_PATH)
model_ar.config.suppress_tokens = []
model_ar.config.forced_decoder_ids = None

print("✅ All Audio Models loaded successfully! 🚀")

def extract_audio_optimized(video_path, audio_path):
    try:
        video = VideoFileClip(video_path)
        video.audio.write_audiofile(audio_path, fps=16000, nbytes=2, codec='pcm_s16le', ffmpeg_params=["-ac", "1"], logger=None)
        video.close()
        return True
    except Exception as e:
        print(f"Error extraction: {e}")
        return False

def analyze_audio_metrics(audio_path):
    # (نفس دالة Librosa بتاعتك بدون أي تغيير)
    try:
        y, sr_rate = librosa.load(audio_path, sr=None)
        duration = librosa.get_duration(y=y, sr=sr_rate)
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr_rate)
        threshold = magnitudes > np.median(magnitudes)
        pitch_values = pitches[threshold]
        pitch_values = pitch_values[(pitch_values > 70) & (pitch_values < 400)]
        
        stability_score = "N/A"
        if len(pitch_values) > 10:
            pitch_std = np.std(pitch_values)
            if pitch_std < 15: stability_score = "Monotone (Flat)"
            elif pitch_std < 70: stability_score = "Normal (Stable)"
            else: stability_score = "Dynamic (Expressive)"
        else:
            stability_score = "No Speech Detected"

        non_silent_intervals = librosa.effects.split(y, top_db=25)
        speech_duration = 0
        for interval in non_silent_intervals:
            speech_duration += (interval[1] - interval[0]) / sr_rate
            
        silence_duration = duration - speech_duration
        pause_ratio = (silence_duration / duration) * 100 if duration > 0 else 0

        pattern_feedback = "Balanced"
        if pause_ratio > 45: pattern_feedback = "Long Pauses (Hesitant)"
        elif pause_ratio < 15: pattern_feedback = "Continuous (Rushed)"

        return {
            "duration_sec": duration,
            "voice_stability": stability_score,
            "pause_ratio": round(pause_ratio, 1),
            "speech_pattern": pattern_feedback,
            "silence_sec": round(silence_duration, 2)
        }
    except Exception as e:
        print(f"Audio Analysis Error: {e}")
        return None

def analyze_audio_features(video_path, language="en"):
    temp_audio = video_path + ".wav"
    try:
        if not extract_audio_optimized(video_path, temp_audio):
            return {"error": "Audio extraction failed", "transcript": ""}

        transcript_text = ""
        
        if language == "ar":
            print("🎧 Processing ARABIC audio with MasarTech Custom Model...")
            try:
                audio_array, sampling_rate = librosa.load(temp_audio, sr=16000)
                inputs = processor_ar(audio_array, sampling_rate=16000, return_tensors="pt")
                input_features = inputs.input_features.to(model_ar.device)
                
                with torch.no_grad():
                    predicted_ids = model_ar.generate(input_features, language="arabic", task="transcribe")
                
                raw_text = processor_ar.batch_decode(predicted_ids, skip_special_tokens=True)[0]
                print(f"📝 Raw Arabic Text: {raw_text}")
                
                # الاعتماد على الدالة الجديدة من ملف gemini_service
                transcript_text = clean_arabic_transcript(raw_text)
                print(f"✅ Cleaned Arabic Text: {transcript_text}")
                
            except Exception as e:
                print(f"❌ Arabic Transcription Error: {e}")
                transcript_text = ""
                
        else:
            print("🎧 Processing ENGLISH audio with Base Whisper...")
            try:
                result = whisper_model_en.transcribe(temp_audio, language="en")
                transcript_text = result["text"].strip()
                print(f"📝 English Transcript: {transcript_text}")
            except Exception as e:
                print(f"❌ English Transcription Error: {e}")
                transcript_text = ""

        # ==========================================
        # 🚀 الفكرة الجديدة: تصفية الإجابات القصيرة جداً (لأي لغة)
        # ==========================================
        # لو النص مش فاضي، هنعد الكلمات اللي فيه
        if transcript_text:
            word_count = len(transcript_text.split())
            if word_count < 4:  # لو أقل من 4 كلمات
                print(f"⚠️ Transcript too short ({word_count} words): '{transcript_text}'. Treating as empty/hallucination.")
                transcript_text = ""  # تفريغ النص
        # ==========================================

        audio_metrics = analyze_audio_metrics(temp_audio)
        wpm = 0
        wpm_feedback = "No Answer"
        final_tone = "No Answer"
        final_pause_ratio = 0
        final_speech_pattern = "No Answer"
        
        # الشرط ده دلوقتي مش هيتحقق غير لو transcript_text مليان (يعني 4 كلمات أو أكتر)
        if audio_metrics and audio_metrics["duration_sec"] > 0 and transcript_text:
            words = transcript_text.split()
            word_count = len(words)
            duration_min = audio_metrics["duration_sec"] / 60
            wpm = int(word_count / duration_min)

            if wpm == 0: 
                wpm_feedback = "No Speech"
            else:
                if wpm < 110: wpm_feedback = "Slow"
                elif wpm > 160: wpm_feedback = "Fast"
                else: wpm_feedback = "Perfect"
                
                final_tone = audio_metrics.get("voice_stability", "N/A")
                final_pause_ratio = round(audio_metrics.get("pause_ratio", 0), 1)
                final_speech_pattern = audio_metrics.get("speech_pattern", "N/A")

        return {
            "transcript": transcript_text, 
            "wpm": wpm,
            "wpm_feedback": wpm_feedback,
            "tone": final_tone,
            "pause_ratio": final_pause_ratio,
            "speech_pattern": final_speech_pattern,
            "duration": round(audio_metrics.get("duration_sec", 0), 2) if audio_metrics else 0
        }

    except Exception as e:
        print(f"❌ Verbal Main Error: {e}")
        return {"error": str(e), "transcript": ""}

    finally:
        if os.path.exists(temp_audio):
            try: os.remove(temp_audio)
            except: pass