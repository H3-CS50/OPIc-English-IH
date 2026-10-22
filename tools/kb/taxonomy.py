"""Taxonomy dùng chung cho knowledge base OPIc OQC.

Mọi nhãn ở đây là THIẾT KẾ SƯ PHẠM CỦA APP, không phải phân loại chính thức của ACTFL,
trừ khi ghi chú khác (xem 04_QUESTION_TAXONOMY.md).
"""

SCHEMA_VERSION = "1.0"

# category: survey (chủ đề chọn trong Background Survey), unexpected (chủ đề bất ngờ),
# role_play, issue (câu nâng cao kiểu 14–15), intro.
TOPICS = {
    # key: (label_vi, label_en, category)
    "self_intro": ("Giới thiệu bản thân", "Self-introduction", "intro"),
    "work": ("Công việc", "Work", "survey"),
    "oqc_work": ("Công việc OQC / nhà máy", "Quality inspection work (optional OQC branch)", "survey"),
    "housing": ("Nhà ở", "Home / Housing", "survey"),
    "movies": ("Xem phim", "Movies", "survey"),
    "music": ("Nghe nhạc", "Music", "survey"),
    "parks": ("Công viên", "Parks", "survey"),
    "walking": ("Đi bộ / chạy bộ", "Walking & jogging", "survey"),
    "beach": ("Đi biển", "Beaches", "survey"),
    "domestic_trips": ("Du lịch trong nước", "Domestic trips", "survey"),
    "overseas_trips": ("Du lịch nước ngoài", "Overseas trips", "survey"),
    "vacation_home": ("Nghỉ lễ ở nhà", "Vacations at home", "survey"),
    "technology": ("Công nghệ", "Technology", "unexpected"),
    "phones": ("Điện thoại", "Mobile phones", "unexpected"),
    "internet": ("Internet", "Internet", "unexpected"),
    "weather": ("Thời tiết", "Weather & seasons", "unexpected"),
    "transportation": ("Giao thông", "Transportation", "unexpected"),
    "recycling": ("Tái chế / môi trường", "Recycling & environment", "unexpected"),
    "holidays": ("Ngày lễ", "Holidays", "unexpected"),
    "health": ("Sức khỏe", "Health", "unexpected"),
    "family_friends": ("Gia đình & bạn bè", "Family & friends", "unexpected"),
    "restaurants": ("Nhà hàng / ăn ngoài", "Restaurants & eating out", "unexpected"),
    "banks": ("Ngân hàng", "Banks", "unexpected"),
    "appointments": ("Cuộc hẹn", "Appointments", "unexpected"),
    "furniture": ("Đồ nội thất", "Furniture", "unexpected"),
    "shopping": ("Mua sắm", "Shopping", "unexpected"),
    "geography": ("Địa lý đất nước", "Geography", "unexpected"),
    "industry": ("Ngành nghề / việc làm", "Industry & jobs", "unexpected"),
    # --- Chủ đề thêm từ bộ câu hỏi của lớp ---
    "bars": ("Quán bar / quán nhậu", "Bars & pubs", "survey"),
    "coffee_shops": ("Quán cà phê", "Coffee shops", "unexpected"),
    "gatherings": ("Tụ tập / lễ kỷ niệm", "Gatherings & celebrations", "unexpected"),
    "food": ("Món ăn", "Food", "unexpected"),
    "fashion": ("Thời trang", "Fashion", "unexpected"),
    "free_time": ("Thời gian rảnh", "Free time", "unexpected"),
    "hotels": ("Khách sạn", "Hotels", "unexpected"),
    "newspapers": ("Báo chí", "Newspapers", "unexpected"),
    "television": ("Truyền hình", "Television", "unexpected"),
    "text_messages": ("Tin nhắn", "Text messages", "unexpected"),
    "id_cards": ("Giấy tờ tùy thân", "Identification cards", "unexpected"),
    # --- Bổ sung 2026-10 (combo AI soạn, chủ đề đối chiếu từ nguồn cộng đồng) ---
    "concerts": ("Xem biểu diễn / hòa nhạc", "Concerts & performances", "survey"),
    "hiking": ("Leo núi / đi bộ đường dài", "Hiking & trekking", "survey"),
    "libraries": ("Thư viện", "Libraries", "unexpected"),
    "neighborhood": ("Khu phố / hàng xóm", "Neighborhood & neighbors", "unexpected"),
    "school_memories": ("Trường học / kỷ niệm đi học", "School & school days", "unexpected"),
    "festivals": ("Lễ hội truyền thống", "Traditional festivals", "unexpected"),
    "hospitals": ("Bệnh viện / phòng khám", "Hospitals & clinics", "unexpected"),
    "rp_hospital": ("Role-play: hẹn khám nha sĩ / bác sĩ", "Role-play: doctor or dentist", "role_play"),
    "rp_bank": ("Role-play: ngân hàng", "Role-play: bank", "role_play"),
    "rp_internet": ("Role-play: nhà mạng internet", "Role-play: internet provider", "role_play"),
    "rp_concert": ("Role-play: mua vé hòa nhạc", "Role-play: concert tickets", "role_play"),
    "rp_library": ("Role-play: thư viện", "Role-play: library", "role_play"),
    "rp_airline": ("Role-play: hãng bay", "Role-play: airline", "role_play"),
    "rp_rental_car": ("Role-play: thuê xe", "Role-play: car rental", "role_play"),
    "rp_delivery": ("Role-play: đặt đồ ăn cho tiệc", "Role-play: food order for a party", "role_play"),
    "rp_friend_plans": ("Role-play: hẹn đi chơi với bạn", "Role-play: plans with a friend", "role_play"),
    "rp_work_project": ("Role-play: dự án ở công ty", "Role-play: work project", "role_play"),
    "rp_shopping": ("Role-play: cửa hàng mới / để quên ví", "Role-play: new store", "role_play"),
    "rp_food_store": ("Role-play: cửa hàng thực phẩm", "Role-play: food store", "role_play"),
    "rp_geography": ("Role-play: hỏi bạn về địa lý nước bạn", "Role-play: friend abroad", "role_play"),
    "rp_weather": ("Role-play: thời tiết khi đi du lịch", "Role-play: weather on vacation", "role_play"),
    "rp_business_trip": ("Role-play: công tác nước ngoài", "Role-play: business trip", "role_play"),
    "rp_housing": ("Role-play: thuê nhà", "Role-play: renting a house", "role_play"),
    "rp_store_sale": ("Role-play: cửa hàng giảm giá", "Role-play: store sale", "role_play"),
    "rp_train": ("Role-play: mua vé tàu", "Role-play: train ticket", "role_play"),
    "rp_hotel": ("Role-play: khách sạn", "Role-play: hotel", "role_play"),
    "rp_clothing": ("Role-play: cửa hàng quần áo", "Role-play: clothing store", "role_play"),
    "rp_cinema": ("Role-play: rạp phim", "Role-play: movie theater", "role_play"),
    "rp_phone_store": ("Role-play: cửa hàng điện thoại", "Role-play: phone store", "role_play"),
    "rp_travel": ("Role-play: đại lý du lịch", "Role-play: travel agency", "role_play"),
    "rp_furniture": ("Role-play: cửa hàng nội thất", "Role-play: furniture store", "role_play"),
    "rp_gym": ("Role-play: phòng gym", "Role-play: fitness center", "role_play"),
    "rp_restaurant_friend": ("Role-play: hẹn bạn ăn tối", "Role-play: dinner with a friend", "role_play"),
    "rp_work_training": ("Role-play: khóa đào tạo ở công ty", "Role-play: workplace training (OQC branch)", "role_play"),
    "rp_ask_ava": ("Role-play: đặt câu hỏi cho Ava", "Role-play: ask the interviewer", "role_play"),
}

# prompt_type: (label_vi, functions, time_frames, difficulty_design, default mock slot)
PROMPT_TYPES = {
    "self_introduction": ("Tự giới thiệu", ["self_present", "describe"], ["present"], "easy", "intro"),
    "description": ("Miêu tả người / nơi / vật", ["describe"], ["present"], "easy", "combo"),
    "routine": ("Thói quen, hoạt động thường làm", ["describe", "sequence_events"], ["present"], "easy", "combo"),
    "preference_opinion": ("Sở thích / lựa chọn + lý do", ["state_preference", "give_reasons"], ["present"], "easy", "combo"),
    "past_recent": ("Kể lần gần nhất", ["narrate_past", "sequence_events"], ["past"], "medium", "combo"),
    "past_first": ("Kể lần đầu / quá trình hình thành sở thích", ["narrate_past", "describe"], ["past", "present"], "medium", "combo"),
    "memorable_experience": ("Trải nghiệm đáng nhớ / bất ngờ", ["narrate_past", "handle_complication"], ["past"], "medium", "combo"),
    "problem_experience": ("Kể sự cố và cách giải quyết", ["narrate_past", "handle_complication"], ["past"], "challenging", "combo"),
    "comparison_change": ("So sánh quá khứ – hiện tại / sự thay đổi", ["compare", "describe", "narrate_past"], ["past", "present"], "medium", "combo"),
    "comparison_two": ("So sánh hai đối tượng", ["compare", "describe"], ["present"], "medium", "combo"),
    "roleplay_ask": ("Role-play: hỏi 3–4 câu để lấy thông tin", ["ask_questions", "handle_transaction"], ["present", "future"], "easy", "rp_ask"),
    "roleplay_ask_ava": ("Role-play: đặt câu hỏi cho người phỏng vấn", ["ask_questions"], ["present", "past", "future"], "easy", "rp_ask"),
    "roleplay_problem": ("Role-play: giải thích vấn đề + đưa phương án", ["explain_problem", "propose_alternatives", "handle_complication"], ["past", "present", "future"], "challenging", "rp_problem"),
    "roleplay_experience": ("Role-play: kể trải nghiệm liên quan", ["narrate_past", "handle_complication"], ["past"], "medium", "rp_experience"),
    "issue_concern": ("Vấn đề / mối quan tâm xã hội", ["discuss_issue", "give_reasons", "propose_solutions"], ["present", "future"], "challenging", "adv"),
    "news_report": ("Kể lại một tin tức", ["report_event", "narrate_past", "give_opinion"], ["past", "present"], "challenging", "adv"),
}

# Bằng chứng nên có trong câu trả lời (tiếng Việt) — gợi ý luyện tập, không phải tiêu chí chấm chính thức.
EXPECTED_EVIDENCE = {
    "self_introduction": ["Nói rõ bạn là ai: công việc hoặc việc học, nơi sống", "Người sống cùng / gia đình", "1–2 sở thích kèm lý do", "Kết tự nhiên, không đọc như bài thuộc"],
    "description": ["Trả lời thẳng đối tượng được hỏi ngay câu đầu", "2–3 chi tiết cụ thể (vị trí, hình dáng, đặc điểm, con người)", "Cảm nhận hoặc lý do cá nhân", "Các câu nối với nhau thành đoạn (and, but, so, because, which)"],
    "routine": ["Hiện tại đơn + trạng từ tần suất (usually, every…)", "Trình tự rõ ràng (first, then, after that)", "Chi tiết: khi nào, ở đâu, với ai", "Lý do hoặc cảm nhận"],
    "preference_opinion": ["Nêu rõ lựa chọn ngay từ đầu", "Ít nhất 2 lý do khác nhau", "Một ví dụ cụ thể từ trải nghiệm của bạn", "Câu kết khẳng định lại"],
    "past_recent": ["Bối cảnh: khi nào, ở đâu, với ai", "Kể theo trình tự bằng thì quá khứ", "Chi tiết cụ thể và cảm xúc", "Kết: kết quả hoặc suy nghĩ sau đó"],
    "past_first": ["Mốc thời gian bắt đầu (when I was…, back in…)", "Điều gì / ai khiến bạn bắt đầu", "Sự thay đổi từ trước đến nay", "Chuyển thì quá khứ ↔ hiện tại đúng chỗ"],
    "memorable_experience": ["Bối cảnh rõ (thời gian, nơi, người)", "Điểm đặc biệt hoặc bất ngờ", "Diễn biến theo trình tự, thì quá khứ nhất quán", "Cảm xúc + vì sao bạn còn nhớ"],
    "problem_experience": ["Bối cảnh rõ", "Sự cố cụ thể (chuyện gì đã sai)", "Ít nhất 1–2 bước bạn làm để xử lý", "Kết quả + bài học", "Giữ thì quá khứ xuyên suốt"],
    "comparison_change": ["Mô tả quá khứ (used to / past simple)", "Mô tả hiện tại (present simple / present perfect)", "Ít nhất 2 điểm khác biệt cụ thể", "Nguyên nhân hoặc tác động của sự thay đổi"],
    "comparison_two": ["Giới thiệu rõ hai đối tượng", "Điểm giống nhau", "Điểm khác nhau kèm ví dụ", "Ý kiến hoặc lựa chọn của bạn"],
    "roleplay_ask": ["Mở đầu đúng tình huống (chào, nói mục đích)", "3–4 câu hỏi khác nhau, đúng dạng câu hỏi", "Câu hỏi lịch sự (Could you…? I was wondering if…)", "Kết thúc cảm ơn / hẹn liên lạc"],
    "roleplay_ask_ava": ["Hỏi trực tiếp người phỏng vấn (you / your)", "3–4 câu hỏi đa dạng (Wh- và Yes/No)", "Câu hỏi bám sát chủ đề", "Giọng tự nhiên như đang trò chuyện"],
    "roleplay_problem": ["Giới thiệu bạn là ai, gọi về việc gì", "Giải thích vấn đề rõ ràng (đã xảy ra gì)", "2–3 phương án thay thế cụ thể", "Đề nghị phản hồi, kết lịch sự"],
    "roleplay_experience": ["Bối cảnh rõ", "Vấn đề cụ thể", "Bạn đã làm gì để giải quyết", "Kết quả + cảm nghĩ", "Thì quá khứ nhất quán"],
    "issue_concern": ["Nêu 1–2 vấn đề cụ thể", "Nguyên nhân của vấn đề", "Ảnh hưởng tới mọi người", "Giải pháp đang có hoặc ý kiến của bạn", "Ví dụ thực tế"],
    "news_report": ["Tin gì, khi nào, bạn biết qua đâu", "Tóm tắt diễn biến chính bằng thì quá khứ", "Phản ứng của mọi người", "Suy nghĩ của bạn về tin đó"],
}

# Khung phát triển ý (scaffolding) theo dạng câu — thiết kế sư phạm, không bắt buộc.
FRAMEWORKS = {
    "self_introduction": "Who I am → what I do → who I live with → what I enjoy and why",
    "description": "Direct answer → overall picture → 2–3 details → what I like / feel",
    "routine": "How often → step by step → small details → why / how it feels",
    "preference_opinion": "Preference → reason 1 → reason 2 + example → wrap-up",
    "past_recent": "When / where / who → what happened in order → feelings → result",
    "past_first": "Starting point → who / what got me into it → how it changed → now",
    "memorable_experience": "Background → the special moment → what happened next → why I remember it",
    "problem_experience": "Background → the problem → what I tried → result / lesson",
    "comparison_change": "In the past → now → 2 concrete differences → why it changed / impact",
    "comparison_two": "Introduce A and B → similarities → differences + examples → my view",
    "roleplay_ask": "Greeting + purpose → 3–4 different questions → thanks / closing",
    "roleplay_ask_ava": "Short reaction → 3–4 questions about the interviewer → closing",
    "roleplay_problem": "Who I am + why I'm calling → the problem → 2–3 alternatives → closing",
    "roleplay_experience": "Background → the problem → what I did → result / lesson",
    "issue_concern": "The issue → causes → effects → solutions / my opinion + example",
    "news_report": "What / when / where I heard → main events → reactions → my opinion",
}

LEVELS = ["IM", "IH", "AL"]
CONTENT_ORIGINS = ["official_excerpt_reference", "third_party_source", "user_provided", "AI_generated_original", "adapted_with_permission"]
REVIEW_STATUSES = ["draft", "ai_checked", "human_reviewed", "approved"]
SOURCE_TYPES = ["official", "educational", "learner_report", "community", "AI_generated", "user_provided"]
