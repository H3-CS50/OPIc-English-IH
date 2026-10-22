"""JSON Schemas (draft 2020-12) cho dữ liệu OPIc OQC. x-status: MVP | Later."""

from taxonomy import TOPICS, PROMPT_TYPES, LEVELS, CONTENT_ORIGINS, REVIEW_STATUSES, SOURCE_TYPES

_str = {"type": "string"}
_strs = {"type": "array", "items": {"type": "string"}}

SOURCE = {
    "x-status": "MVP",
    "type": "object", "additionalProperties": False,
    "required": ["source_id", "title", "publisher_or_author", "source_type", "tier", "url", "publication_or_updated_date",
                 "access_date", "page_language", "test_language", "format", "access_status", "copyright_or_reuse_status",
                 "relevant_sections", "key_findings", "limitations", "confidence"],
    "properties": {
        "source_id": {"type": "string", "pattern": "^SRC-[A-Z0-9-]+$"},
        "title": _str, "publisher_or_author": _str,
        "source_type": {"enum": SOURCE_TYPES},
        "tier": {"type": "integer", "enum": [1, 2, 3, 4]},
        "url": _str, "publication_or_updated_date": {"type": ["string", "null"]},
        "access_date": {"type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$"},
        "page_language": _str, "test_language": _str, "format": _str,
        "access_status": {"enum": ["accessible", "partial", "paywalled", "login_required", "unavailable", "snippet_only"]},
        "copyright_or_reuse_status": _str, "relevant_sections": _strs, "key_findings": _strs, "limitations": _strs, "confidence": _str,
    },
}

QUESTION = {
    "x-status": "MVP",
    "type": "object", "additionalProperties": False,
    "required": ["question_id", "test_language", "topic", "topic_label_vi", "topic_category", "subtopic", "question_text", "prompt_type",
                 "communicative_functions", "time_frame_targets", "target_practice_levels", "difficulty_design", "mock_slot",
                 "combo_id", "combo_order", "oqc_branch", "source_id", "source_url", "content_origin", "copyright_status",
                 "expected_evidence", "follow_up_questions", "scaffolding_hints", "answer_framework", "review_status", "schema_version"],
    "properties": {
        "question_id": {"type": "string", "pattern": "^Q-\\d{6}$"},
        "test_language": {"const": "English"},
        "topic": {"enum": list(TOPICS)},
        "topic_label_vi": _str,
        "topic_category": {"enum": ["intro", "survey", "unexpected", "role_play", "issue"]},
        "subtopic": _str,
        "question_text": {"type": "string", "minLength": 10},
        "prompt_type": {"enum": list(PROMPT_TYPES)},
        "communicative_functions": _strs,
        "time_frame_targets": {"type": "array", "items": {"enum": ["past", "present", "future"]}, "minItems": 1},
        "target_practice_levels": {"type": "array", "items": {"enum": LEVELS}, "minItems": 1},
        "difficulty_design": {"enum": ["easy", "medium", "challenging"]},
        "mock_slot": {"enum": ["intro", "combo", "rp_ask", "rp_problem", "rp_experience", "adv"]},
        "combo_id": _str, "combo_order": {"type": "integer", "minimum": 1},
        "oqc_branch": {"type": "boolean"},
        "source_id": _str, "source_url": {"type": ["string", "null"]},
        "content_origin": {"enum": CONTENT_ORIGINS},
        "copyright_status": {"enum": ["original", "short_quote_official", "user_provided_unclear", "user_owned", "permission_granted"]},
        "expected_evidence": _strs, "follow_up_questions": _strs, "scaffolding_hints": _strs, "answer_framework": _str,
        "review_status": {"enum": REVIEW_STATUSES},
        "schema_version": _str,
    },
}

SAMPLE_ANSWER = {
    "x-status": "MVP",
    "type": "object", "additionalProperties": False,
    "required": ["answer_id", "set_id", "question_id", "target_practice_level", "answer_text", "word_count", "persona_vi",
                 "content_origin", "source_id", "level_label_type", "demonstrated_features", "improvement_notes_vi",
                 "what_this_answer_demonstrates", "what_not_to_memorize", "how_to_personalize", "possible_follow_up_questions",
                 "next_level_improvement", "set_key_differences_vi", "personalization_prompts", "review_status", "schema_version"],
    "properties": {
        "answer_id": {"type": "string", "pattern": "^A-\\d{6}$"},
        "set_id": {"type": "string", "pattern": "^S\\d{2}$"},
        "question_id": {"type": "string", "pattern": "^Q-\\d{6}$"},
        "target_practice_level": {"enum": LEVELS},
        "answer_text": {"type": "string", "minLength": 40},
        "word_count": {"type": "integer"},
        "persona_vi": _str,
        "content_origin": {"const": "AI_generated_original"},
        "source_id": {"type": ["string", "null"]},
        "level_label_type": {"const": "practice_target_not_official_rating"},
        "demonstrated_features": _strs, "improvement_notes_vi": _strs,
        "what_this_answer_demonstrates": _strs, "what_not_to_memorize": _str, "how_to_personalize": _str,
        "possible_follow_up_questions": _strs, "next_level_improvement": _str, "set_key_differences_vi": _strs,
        "personalization_prompts": _strs,
        "review_status": {"enum": REVIEW_STATUSES}, "schema_version": _str,
    },
}

# --- Kết quả AI coach (dùng trực tiếp làm structured output cho Claude / Gemini) ---
_dim = {
    "type": "object", "additionalProperties": False,
    "required": ["status", "observation_vi", "evidence_quotes"],
    "properties": {
        "status": {"type": "string", "enum": ["assessed", "not_assessed", "insufficient_evidence"]},
        "observation_vi": {"type": "string", "description": "Nhận xét ngắn bằng tiếng Việt, dựa trên bằng chứng"},
        "evidence_quotes": {"type": "array", "items": {"type": "string"}, "description": "1–2 trích đoạn NGUYÊN VĂN từ bài nói (không bịa)"},
    },
}
_delivery = {
    "type": "object", "additionalProperties": False,
    "required": ["status", "observation_vi"],
    "properties": {
        "status": {"type": "string", "enum": ["assessed", "not_assessed", "insufficient_evidence"]},
        "observation_vi": {"type": "string"},
    },
}
COACH_RESULT = {
    "x-status": "MVP",
    "type": "object", "additionalProperties": False,
    "required": ["input_mode", "transcript_used", "task_response", "main_idea_summary_vi", "fact", "delivery",
                 "practice_level_estimate", "what_works", "main_gap", "language_fixes", "next_level_move",
                 "expanded_example_en", "retry_task", "limitations_vi"],
    "properties": {
        "input_mode": {"type": "string", "enum": ["transcript_only", "audio", "audio_and_transcript"]},
        "transcript_used": {"type": "string", "description": "Nếu có audio: chép lại lời người học nói (nguyên văn, không sửa). Nếu chỉ có transcript: để chuỗi rỗng."},
        "task_response": {
            "type": "object", "additionalProperties": False, "required": ["status", "comment_vi"],
            "properties": {
                "status": {"type": "string", "enum": ["fully_addressed", "partially_addressed", "off_task", "insufficient_evidence"]},
                "comment_vi": {"type": "string"},
            },
        },
        "main_idea_summary_vi": {"type": "string"},
        "fact": {
            "type": "object", "additionalProperties": False,
            "required": ["functions_tasks", "accuracy", "context_content", "text_type"],
            "properties": {"functions_tasks": _dim, "accuracy": _dim, "context_content": _dim, "text_type": _dim},
        },
        "delivery": {
            "type": "object", "additionalProperties": False, "required": ["pronunciation", "fluency"],
            "properties": {"pronunciation": _delivery, "fluency": _delivery},
        },
        "practice_level_estimate": {
            "type": "object", "additionalProperties": False, "required": ["label", "confidence", "rationale_vi"],
            "properties": {
                "label": {"type": "string", "enum": ["below_IM", "IM", "IM_IH_borderline", "IH", "IH_AL_borderline", "AL", "insufficient_evidence"]},
                "confidence": {"type": "string", "enum": ["low", "medium", "high"]},
                "rationale_vi": {"type": "string"},
            },
        },
        "what_works": {
            "type": "array", "description": "1–3 điểm tốt",
            "items": {"type": "object", "additionalProperties": False, "required": ["point_vi", "evidence_quote"],
                      "properties": {"point_vi": {"type": "string"}, "evidence_quote": {"type": "string"}}},
        },
        "main_gap": {
            "type": "object", "additionalProperties": False, "required": ["point_vi", "evidence_quote", "why_it_matters_vi"],
            "properties": {"point_vi": {"type": "string"}, "evidence_quote": {"type": "string"}, "why_it_matters_vi": {"type": "string"}},
        },
        "language_fixes": {
            "type": "array", "description": "Tối đa 5 lỗi quan trọng nhất",
            "items": {"type": "object", "additionalProperties": False, "required": ["original", "suggested", "explanation_vi", "impact"],
                      "properties": {"original": {"type": "string"}, "suggested": {"type": "string"}, "explanation_vi": {"type": "string"},
                                     "impact": {"type": "string", "enum": ["affects_meaning", "minor"]}}},
        },
        "next_level_move": {
            "type": "object", "additionalProperties": False, "required": ["target_level", "action_vi"],
            "properties": {"target_level": {"type": "string", "enum": ["IM", "IH", "AL", "AL_maintain"]}, "action_vi": {"type": "string"}},
        },
        "expanded_example_en": {"type": "string", "description": "Bản phát triển câu trả lời CỦA NGƯỜI HỌC (giữ ý của họ), tiếng Anh nói tự nhiên"},
        "retry_task": {
            "type": "object", "additionalProperties": False, "required": ["goal_vi", "instruction_vi", "success_check_vi"],
            "properties": {"goal_vi": {"type": "string"}, "instruction_vi": {"type": "string"}, "success_check_vi": {"type": "string"}},
        },
        "limitations_vi": {"type": "array", "items": {"type": "string"}},
    },
}

# Câu hỏi của lớp: câu hỏi do người dùng tự soạn + 1 bài mẫu IH do AI viết.
CLASS_QUESTION = {
    "x-status": "MVP",
    "type": "object", "additionalProperties": False,
    "required": QUESTION["required"] + ["origin_set", "source_index", "class_type", "sample_answer_ih", "sample_word_count",
                                        "sample_origin", "sample_level_label_type", "sample_persona_vi"],
    "properties": {
        **QUESTION["properties"],
        "question_id": {"type": "string", "pattern": "^CL-\\d{4}$"},
        "origin_set": {"const": "class"},
        "source_index": {"type": "integer"},
        "class_type": {"enum": ["Combo-3", "Combo-2", "Role-plays"]},
        "sample_answer_ih": {"type": "string", "minLength": 40},
        "sample_word_count": {"type": "integer"},
        "sample_origin": {"const": "AI_generated_original"},
        "sample_level_label_type": {"const": "practice_target_not_official_rating"},
        "sample_persona_vi": _str,
    },
}

# Từ vựng & cụm từ (tab Từ vựng). vocab_id = "<topic_id>::<English>" để tiến độ học ổn định.
VOCAB_ITEM = {
    "x-status": "MVP",
    "type": "object", "additionalProperties": False,
    "required": ["vocab_id", "topic_id", "en", "vi", "example_en", "note_vi", "kind", "target_levels", "prompt_types",
                 "source_ids", "content_origin", "review_status", "schema_version"],
    "properties": {
        "vocab_id": {"type": "string", "pattern": "^[a-z_]+::.+$"},
        "topic_id": _str,
        "en": {"type": "string", "minLength": 1}, "vi": {"type": "string", "minLength": 1},
        "example_en": {"type": "string", "minLength": 3}, "note_vi": _str,
        "kind": {"enum": ["word", "phrase", "phrasal_verb", "collocation", "sentence_frame", "discourse_marker", "idiom"]},
        "target_levels": {"type": "array", "items": {"enum": LEVELS}, "minItems": 1},
        "prompt_types": {"type": "array", "items": {"enum": list(PROMPT_TYPES)}},
        "source_ids": {"type": "array", "items": _str, "minItems": 1},
        "content_origin": {"enum": ["user_app", "AI_generated_original"]},
        "review_status": {"enum": REVIEW_STATUSES},
        "schema_version": _str,
    },
}

PRACTICE_SESSION = {
    "x-status": "MVP",
    "description": "Một lần luyện (lưu cục bộ trên máy, KHÔNG lưu file ghi âm)",
    "type": "object", "additionalProperties": False,
    "required": ["attempt_id", "created_at", "mode", "question_id", "question_text", "prompt_type", "topic", "target_level",
                 "input_mode", "seconds", "transcript", "coach_result", "provider", "retry_of"],
    "properties": {
        "attempt_id": _str, "created_at": {"type": "string", "format": "date-time"},
        "mode": {"enum": ["practice", "mock", "daily", "retry"]},
        "question_id": _str, "question_text": _str, "prompt_type": _str, "topic": _str,
        "target_level": {"enum": LEVELS}, "input_mode": {"enum": ["transcript_only", "audio", "audio_and_transcript"]},
        "seconds": {"type": "integer"}, "transcript": _str,
        "coach_result": {"oneOf": [{"type": "null"}, {"$ref": "#/$defs/coach_result"}]},
        "provider": {"enum": ["claude", "gemini", "copy", "none"]},
        "retry_of": {"type": ["string", "null"]},
    },
}

PROGRESS = {
    "x-status": "Later (MVP tính trực tiếp từ practice_session trên máy)",
    "type": "object",
    "properties": {
        "user_id": _str, "period": _str,
        "attempts_by_prompt_type": {"type": "object"},
        "level_estimate_distribution": {"type": "object"},
        "weak_prompt_types": _strs,
    },
}


EXT_QUESTION = {
    "x-status": "MVP",
    "type": "object", "additionalProperties": False,
    "required": CLASS_QUESTION["required"],
    "properties": {
        **CLASS_QUESTION["properties"],
        "question_id": {"type": "string", "pattern": "^EX-\\d{4}$"},
        "origin_set": {"const": "ext"},
        "class_type": {"enum": ["Combo-3", "Combo-2", "Role-plays"]},
    },
}


def bundle():
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "opic-oqc/08_DATA_SCHEMA.json",
        "title": "OPIc OQC knowledge base & app data schema",
        "x-schema-version": "1.0",
        "$defs": {
            "source": SOURCE, "question": QUESTION, "class_question": CLASS_QUESTION, "ext_question": EXT_QUESTION, "sample_answer": SAMPLE_ANSWER,
            "coach_result": COACH_RESULT, "vocab_item": VOCAB_ITEM, "practice_session": PRACTICE_SESSION, "progress": PROGRESS,
        },
    }
