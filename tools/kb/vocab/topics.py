"""Chủ đề của tab Từ vựng.

16 chủ đề đầu giữ đúng id, tên và thứ tự của app "OPIc AL Vocab" (opic_al_vocab_app.json),
8 chủ đề sau là phần mở rộng theo danh sách đề OPIc của lớp.

- levels: cấp luyện mặc định của mục trong chủ đề
- prompt_types: dạng câu hỏi dùng được nhóm này ("*" = mọi dạng) → gợi ý trong tab Luyện
- kb_topics: chủ đề câu hỏi mà nhóm này hỗ trợ → gợi ý theo chủ đề
- sources: nguồn tham khảo mặc định (phải có trong sources.py)
"""

ALL = "*"
PAST = ["past_recent", "past_first", "memorable_experience", "problem_experience", "roleplay_experience"]
RP = ["roleplay_ask", "roleplay_ask_ava", "roleplay_problem"]

VOCAB_TOPICS = [
    dict(id="discourse", vi="Từ nối & mở bài", icon="🔗", kind="discourse_marker", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=[], sources=["SRC-0201", "SRC-0202"]),
    dict(id="fillers", vi="Câu đệm & câu cứu nguy", icon="🛟", kind="phrase", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=[], sources=["SRC-0201", "SRC-0206"]),
    dict(id="al", vi="Mẫu câu ăn điểm AL", icon="⭐", kind="sentence_frame", levels=["IH", "AL"], prompt_types=["self_introduction", "description", "routine", "preference_opinion", "comparison_change", "comparison_two", "issue_concern"], kb_topics=[], sources=["SRC-0003", "SRC-0206"]),
    dict(id="story", vi="Kể chuyện quá khứ", icon="📖", kind="sentence_frame", levels=["IM", "IH", "AL"], prompt_types=PAST, kb_topics=[], sources=["SRC-0203", "SRC-0003"]),
    dict(id="compare", vi="So sánh trước – nay", icon="⚖️", kind="sentence_frame", levels=["IH", "AL"], prompt_types=["comparison_change", "comparison_two", "issue_concern"], kb_topics=[], sources=["SRC-0206", "SRC-0003"]),
    dict(id="feel", vi="Cảm xúc & đánh giá", icon="💬", kind="phrase", levels=["IM", "IH", "AL"], prompt_types=PAST + ["preference_opinion", "description"], kb_topics=[], sources=["SRC-0209", "SRC-0207"]),
    dict(id="roleplay", vi="Role-play & xử lý tình huống", icon="📞", kind="sentence_frame", levels=["IM", "IH", "AL"], prompt_types=RP, kb_topics=[], sources=["SRC-0209", "SRC-0003"]),
    dict(id="pv", vi="Cụm động từ", icon="🧩", kind="phrasal_verb", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=[], sources=["SRC-0205", "SRC-0204"]),
    dict(id="col", vi="Collocation", icon="🔀", kind="collocation", levels=["IH", "AL"], prompt_types=ALL, kb_topics=[], sources=["SRC-0208", "SRC-0207"]),
    dict(id="home", vi="Nhà ở", icon="🏠", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["housing", "furniture", "vacation_home", "rp_housing", "rp_furniture"], sources=["SRC-0207"]),
    dict(id="hood", vi="Khu phố", icon="🏘️", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["housing", "parks", "walking", "geography"], sources=["SRC-0207"]),
    dict(id="work", vi="Công việc", icon="💼", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["work", "industry", "self_intro", "rp_work_training", "rp_business_trip"], sources=["SRC-0207"]),
    dict(id="hobby", vi="Sở thích & giải trí", icon="🎬", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["movies", "music", "parks", "walking", "beach", "television", "free_time", "rp_cinema", "rp_gym"], sources=["SRC-0207"]),
    dict(id="travel", vi="Du lịch", icon="✈️", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["domestic_trips", "overseas_trips", "vacation_home", "hotels", "geography", "rp_travel", "rp_hotel", "rp_geography", "rp_business_trip"], sources=["SRC-0207"]),
    dict(id="tech", vi="Công nghệ", icon="📱", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["technology", "phones", "internet", "text_messages", "rp_phone_store"], sources=["SRC-0207"]),
    dict(id="misc", vi="Chủ đề ngẫu nhiên", icon="🎲", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["banks", "appointments", "holidays", "id_cards", "newspapers", "gatherings", "recycling"], sources=["SRC-0207"]),
    # ---------- Mở rộng ----------
    dict(id="food", vi="Ăn uống & nhà hàng", icon="🍜", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["restaurants", "food", "coffee_shops", "bars", "rp_food_store", "rp_restaurant_friend"], sources=["SRC-0207", "SRC-0208"]),
    dict(id="shopping", vi="Mua sắm & thời trang", icon="🛍️", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["shopping", "fashion", "rp_shopping", "rp_store_sale", "rp_clothing", "rp_furniture", "rp_phone_store"], sources=["SRC-0207", "SRC-0208"]),
    dict(id="health", vi="Sức khỏe & thể thao", icon="💪", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["health", "walking", "parks", "rp_gym"], sources=["SRC-0207", "SRC-0208"]),
    dict(id="weather", vi="Thời tiết & môi trường", icon="🌦️", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["weather", "recycling", "geography", "rp_weather"], sources=["SRC-0207", "SRC-0208"]),
    dict(id="issues", vi="Vấn đề xã hội & tin tức", icon="📰", kind="sentence_frame", levels=["IH", "AL"], prompt_types=["issue_concern", "news_report", "comparison_change"], kb_topics=["newspapers", "industry", "technology", "housing"], sources=["SRC-0003", "SRC-0206"]),
    dict(id="people", vi="Gia đình, bạn bè & miêu tả người", icon="👨‍👩‍👧", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["family_friends", "gatherings", "holidays", "self_intro"], sources=["SRC-0207"]),
    dict(id="transport", vi="Giao thông & đi lại", icon="🚌", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["transportation", "rp_train", "domestic_trips"], sources=["SRC-0207", "SRC-0208"]),
    dict(id="factory", vi="Nhà máy & kiểm tra chất lượng", icon="🏭", kind="word", levels=["IM", "IH", "AL"], prompt_types=ALL, kb_topics=["oqc_work", "work", "industry"], sources=["SRC-0207"]),
]

KINDS = ["word", "phrase", "phrasal_verb", "collocation", "sentence_frame", "discourse_marker", "idiom"]

# Thẻ của bộ flashcard v1 (03-flashcards/anki-opic-ih.tsv) → chủ đề.
V1_TAG_TOPIC = {
    "cam-xuc": "feel", "cuu-nguy": "fillers", "filler": "fillers", "du-lich": "travel", "gioi-thieu": "al",
    "ke-chuyen": "story", "ket": "discourse", "mo-ta": "al", "ngay-le": "misc", "nha-hang": "food",
    "nhac": "hobby", "phim": "hobby", "role-play": "roleplay", "so-sanh": "compare", "so-thich": "feel",
    "thoi-quen": "col", "thoi-tiet": "weather", "xa-hoi": "issues",
}
