"""Nguồn câu hỏi luyện tập (AI-generated original) cho OPIc OQC.

Mỗi câu hỏi do Claude viết mới, mô phỏng CHỨC NĂNG của các dạng câu OPIc phổ biến
(miêu tả, thói quen, kể chuyện, so sánh, role-play, vấn đề xã hội) nhưng câu chữ độc lập.
Không sao chép câu hỏi từ tài liệu luyện thi (bản quyền chưa rõ).
Ngoại lệ duy nhất: Q-000001 dùng câu mở đầu được ACTFL trích công khai trong Familiarization Guide.

Cấu trúc: COMBOS = list các nhóm câu. Mỗi câu: (số_id, prompt_type, câu hỏi, gợi ý ý tưởng (vi), câu hỏi phụ (en)).
Số id cố định — KHÔNG đánh lại số khi thêm câu mới, chỉ thêm số tiếp theo.
"""

COMBOS = [
    # ---------------- Giới thiệu bản thân ----------------
    dict(combo_id="C-intro", topic="self_intro", kind="intro", questions=[
        (1, "self_introduction", "Let's start the interview now. Tell me something about yourself.",
         ["Tên gọi, tuổi hoặc giai đoạn cuộc sống", "Công việc / việc học", "Bạn sống ở đâu, với ai", "Một sở thích và lý do"],
         ["What do you usually do on weekends?"]),
        (2, "self_introduction", "Before we begin, I'd like to get to know you a little. Tell me about your job, the people in your life, and the things you enjoy doing in your free time.",
         ["Công việc hiện tại và bạn thích/không thích điều gì", "Gia đình hoặc bạn bè thân", "Hoạt động lúc rảnh", "Kế hoạch hoặc mục tiêu gần đây"],
         ["What is one goal you have for this year?"]),
        (3, "self_introduction", "Please introduce yourself. What do you do for a living, and what does a normal week look like for you?",
         ["Công việc (có thể nói về OQC nếu bạn làm ở nhà máy)", "Ca làm, giờ giấc trong tuần", "Cuối tuần thường làm gì", "Điều bạn mong đợi nhất trong tuần"],
         ["How do you relax after a long week?"]),
    ]),

    # ---------------- Survey: Work ----------------
    dict(combo_id="C-work-1", topic="work", kind="combo", questions=[
        (4, "description", "You mentioned in the survey that you are working. Tell me about the company you work for. What does it do, where is it located, and what is your role there?",
         ["Loại công ty, sản phẩm/dịch vụ (không nêu thông tin nội bộ)", "Vị trí, quy mô", "Bộ phận và vai trò của bạn", "Điều bạn thích ở công ty"],
         ["How long have you worked there?"]),
        (5, "routine", "Walk me through a normal workday for you. What do you do when you first arrive, and how does the rest of the day usually go?",
         ["Giờ đến công ty, việc làm đầu tiên", "Buổi sáng / giờ ăn trưa", "Họp hành, báo cáo", "Kết thúc ngày làm việc"],
         ["Which part of the day do you enjoy most?"]),
        (6, "problem_experience", "Think about a problem you had to deal with at work recently. What happened, who was involved, and what did you do to solve it?",
         ["Bối cảnh: khi nào, dự án/việc gì", "Vấn đề cụ thể", "Bạn và đồng nghiệp đã làm gì", "Kết quả, bài học"],
         ["What would you do differently next time?"]),
    ]),
    dict(combo_id="C-work-2", topic="work", kind="combo", questions=[
        (7, "description", "Describe the place where you work. What does your workplace look like, and what equipment or tools do you use every day?",
         ["Văn phòng / xưởng / khu vực làm việc", "Bố trí, màu sắc, không khí", "Thiết bị, công cụ bạn dùng", "Điều bạn muốn thay đổi"],
         ["Is your workplace comfortable? Why or why not?"]),
        (8, "description", "Tell me about the people you work with. What are your coworkers like, and how do you usually work together as a team?",
         ["Một đồng nghiệp tiêu biểu (tính cách)", "Cách nhóm phân công", "Một ví dụ làm việc cùng nhau", "Bạn học được gì từ họ"],
         ["Do you ever spend time with coworkers outside of work?"]),
        (9, "memorable_experience", "Tell me about a day at work that was especially busy or stressful. Why was it so busy, what did you do, and how did the day end?",
         ["Ngày đó là khi nào, vì sao bận", "Những việc phải làm liên tục", "Cách bạn xoay xở", "Cảm giác cuối ngày"],
         ["How do you usually deal with stress at work?"]),
    ]),
    dict(combo_id="C-oqc-1", topic="oqc_work", kind="combo", oqc=True, questions=[
        (10, "routine", "In your job, you check the quality of products before they are shipped to customers. Explain to me, step by step, how you usually inspect a product.",
         ["Nhận lô hàng / mẫu kiểm", "Các bước kiểm (ngoại quan, chức năng…) nói chung chung, không nêu quy trình mật", "Ghi kết quả, báo cáo", "Khi phát hiện lỗi thì làm gì"],
         ["Why is this step so important for customers?"]),
        (11, "description", "Describe the line or area where you do your inspections. What does it look like, and what makes it different from other parts of the factory?",
         ["Vị trí khu vực, ánh sáng, đồ bảo hộ", "Thiết bị kiểm tra", "Số người, cách bố trí", "Quy định đặc biệt (sạch, tĩnh điện…)"],
         ["What rules do people have to follow in that area?"]),
        (12, "problem_experience", "Tell me about a time when you found a quality problem that other people had missed. What was the problem, how did you report it, and what happened after that?",
         ["Bối cảnh: ca làm, sản phẩm (chung chung)", "Bạn phát hiện điều gì", "Báo cáo cho ai, xử lý thế nào", "Kết quả và cảm nghĩ"],
         ["How did your team prevent the same problem later?"]),
    ]),

    # ---------------- Survey: Housing ----------------
    dict(combo_id="C-housing-1", topic="housing", kind="combo", questions=[
        (13, "description", "I'd like to know about where you live. Describe your home for me. What does it look like, and how many rooms does it have?",
         ["Nhà riêng / căn hộ, khu vực", "Các phòng chính", "Đồ đạc nổi bật", "Điều bạn thích nhất"],
         ["What would you like to change about your home?"]),
        (14, "routine", "What do you usually do at home on weekdays, and how is that different from what you do on weekends?",
         ["Buổi tối ngày thường", "Việc nhà, ai làm gì", "Cuối tuần: nghỉ ngơi, dọn dẹp, khách", "So sánh ngắn hai nhịp sống"],
         ["Who in your family does most of the housework?"]),
        (15, "comparison_change", "Think about the home you lived in when you were a child. What was it like, and how is it different from the place where you live now?",
         ["Nhà hồi nhỏ: ở đâu, trông thế nào", "Kỷ niệm nổi bật", "Nhà hiện tại", "2 điểm khác biệt rõ nhất + cảm nghĩ"],
         ["Which home do you prefer, and why?"]),
    ]),
    dict(combo_id="C-housing-2", topic="housing", kind="combo", questions=[
        (16, "description", "Which room in your home do you like the most? Describe that room in detail and tell me why it is your favorite.",
         ["Tên phòng, vị trí", "Đồ đạc, màu sắc, ánh sáng", "Bạn làm gì trong phòng đó", "Vì sao thích"],
         ["How often do you change things in that room?"]),
        (17, "past_recent", "Tell me about something you changed in your home recently. Maybe you bought new furniture, painted a wall, or rearranged a room. Why did you make that change, and how did you do it?",
         ["Thay đổi gì, khi nào", "Lý do", "Các bước thực hiện, ai giúp", "Kết quả, bạn có hài lòng không"],
         ["Was it more difficult than you expected?"]),
        (18, "problem_experience", "Things sometimes go wrong at home. Something breaks, or a repair doesn't go as planned. Tell me about a problem you had at home and how you dealt with it.",
         ["Đồ gì hỏng / sự cố gì", "Lúc đó bạn đang làm gì", "Bạn tự sửa hay gọi thợ", "Kết quả, bài học"],
         ["How much did it cost to fix?"]),
    ]),

    # ---------------- Survey: Movies ----------------
    dict(combo_id="C-movies-1", topic="movies", kind="combo", questions=[
        (19, "preference_opinion", "You indicated in the survey that you like watching movies. What kinds of movies do you enjoy the most, and why do you like them more than other kinds?",
         ["Thể loại yêu thích", "Lý do 1: cảm xúc / giải trí", "Lý do 2: diễn viên, kỹ xảo, câu chuyện", "Ví dụ một phim"],
         ["Is there a type of movie you never watch?"]),
        (20, "routine", "What do you usually do when you go to the movies? Tell me everything you do from the time you decide to see a movie until you get home.",
         ["Chọn phim, đặt vé (app?)", "Đi với ai, đến rạp nào", "Đồ ăn, ghế ngồi", "Sau phim làm gì"],
         ["Do you prefer watching movies at home or in a theater?"]),
        (21, "past_recent", "Tell me about the last time you went to see a movie. What did you see, who did you go with, and what happened that day?",
         ["Khi nào, phim gì", "Đi cùng ai", "Diễn biến buổi đó (trước – trong – sau)", "Cảm nhận về phim"],
         ["Would you recommend that movie to a friend?"]),
    ]),
    dict(combo_id="C-movies-2", topic="movies", kind="combo", questions=[
        (22, "description", "Who is an actor or actress you really like? Describe that person and tell me what makes his or her performances special.",
         ["Tên diễn viên, quốc tịch", "Ngoại hình / phong cách", "Vai diễn nổi bật", "Vì sao bạn thích"],
         ["When did you first see this actor on screen?"]),
        (23, "memorable_experience", "Tell me about a movie that left a strong impression on you. What was it about, when did you watch it, and why do you still remember it?",
         ["Tên phim, thể loại", "Nội dung ngắn gọn (không cần kể hết)", "Hoàn cảnh xem", "Vì sao đáng nhớ"],
         ["Have you watched it more than once?"]),
        (24, "comparison_change", "How are the movies people watch today different from the movies you watched when you were growing up?",
         ["Phim hồi nhỏ: xem ở đâu, loại gì", "Phim bây giờ: nền tảng, kỹ xảo", "2 điểm khác biệt cụ thể", "Thay đổi nào bạn thích / không thích"],
         ["Do you think movies are better now?"]),
    ]),

    # ---------------- Survey: Music ----------------
    dict(combo_id="C-music-1", topic="music", kind="combo", questions=[
        (25, "preference_opinion", "You said that you enjoy listening to music. What kinds of music do you listen to, and who is a singer or group you really like?",
         ["Thể loại nhạc", "Ca sĩ / nhóm nhạc yêu thích", "Lý do thích", "Một bài hát cụ thể"],
         ["What kind of music do you dislike?"]),
        (26, "routine", "When and where do you usually listen to music? Tell me about the different ways you enjoy music in your daily life.",
         ["Thời điểm: đi làm, tập thể dục, trước khi ngủ", "Thiết bị / ứng dụng", "Có đi xem nhạc sống không", "Âm nhạc giúp bạn thế nào"],
         ["Do you ever sing karaoke?"]),
        (27, "past_first", "How did you first become interested in music? Tell me how your taste in music has changed from your childhood until now.",
         ["Bắt đầu nghe nhạc khi nào, nhờ ai", "Hồi đó thích thể loại gì", "Bây giờ thay đổi thế nào", "Vì sao thay đổi"],
         ["Is there a song that reminds you of your childhood?"]),
    ]),

    # ---------------- Survey: Parks ----------------
    dict(combo_id="C-parks-1", topic="parks", kind="combo", questions=[
        (28, "description", "You indicated that you go to parks. Tell me about a park you often visit. Where is it, and what does it look like?",
         ["Tên/vị trí công viên", "Cảnh vật: hồ, cây, đường chạy", "Tiện ích", "Không khí vào buổi sáng/tối"],
         ["Is the park usually crowded?"]),
        (29, "routine", "What do you usually do when you go to the park? Who do you go with, and what kinds of things do you see there?",
         ["Đi lúc nào, với ai", "Hoạt động: đi bộ, chơi với con…", "Những người khác làm gì", "Cảm giác sau khi đi"],
         ["How long do you usually stay?"]),
        (30, "memorable_experience", "Tell me about something memorable or unexpected that happened while you were at a park. Give me all the details from beginning to end.",
         ["Khi nào, công viên nào", "Chuyện bất ngờ là gì", "Bạn phản ứng thế nào", "Kết thúc ra sao"],
         ["Did that experience change how you feel about the park?"]),
    ]),

    # ---------------- Survey: Walking / jogging ----------------
    dict(combo_id="C-walking-1", topic="walking", kind="combo", questions=[
        (31, "routine", "You mentioned that you like to take walks or go jogging. Where do you usually go, how often do you do it, and how do you feel afterwards?",
         ["Địa điểm, quãng đường", "Tần suất, thời gian", "Mang theo gì (tai nghe, nước)", "Cảm giác, lợi ích"],
         ["Do you prefer walking alone or with someone?"]),
        (32, "past_first", "Why did you start walking or jogging in the first place? How has your interest in it changed over the years?",
         ["Lý do bắt đầu (sức khỏe, giảm stress…)", "Lúc đầu thế nào", "Bây giờ khác gì", "Mục tiêu tiếp theo"],
         ["Have you ever joined a running event?"]),
        (33, "past_recent", "Tell me about the last time you went for a walk or a run. Where did you go, what did you do to get ready, and did anything interesting happen?",
         ["Khi nào, ở đâu", "Chuẩn bị", "Diễn biến, điều gì đáng chú ý", "Sau đó làm gì"],
         ["What was the weather like that day?"]),
    ]),

    # ---------------- Survey: Beach ----------------
    dict(combo_id="C-beach-1", topic="beach", kind="combo", questions=[
        (34, "description", "Tell me about a beach you like to visit. Where is it, and what makes it beautiful or special?",
         ["Tên bãi biển, tỉnh/thành", "Cát, nước, cảnh quan", "Hàng quán, dịch vụ", "Vì sao đặc biệt"],
         ["What is the best season to go there?"]),
        (35, "routine", "What do you like to do when you go to the beach? Tell me about your typical day at the beach from morning to night.",
         ["Buổi sáng: ngắm bình minh, bơi", "Buổi trưa: ăn hải sản, nghỉ", "Chiều – tối: dạo biển", "Đi cùng ai"],
         ["Do you prefer quiet or busy beaches?"]),
        (36, "memorable_experience", "Tell me about a trip to the beach that you will never forget. Who were you with, what happened, and why was it so memorable?",
         ["Thời gian, nơi, người đi cùng", "Khoảnh khắc đặc biệt", "Có sự cố gì không", "Vì sao nhớ"],
         ["Would you go back to that beach again?"]),
    ]),

    # ---------------- Survey: Domestic trips ----------------
    dict(combo_id="C-domestic-1", topic="domestic_trips", kind="combo", questions=[
        (37, "description", "You said that you travel within your country. Tell me about a place in your country that you like to visit and explain why you enjoy going there.",
         ["Địa điểm, cách đi", "Cảnh quan, món ăn", "Hoạt động ở đó", "Lý do muốn quay lại"],
         ["How long does it take to get there?"]),
        (38, "routine", "What do you usually do to prepare before you go on a trip? Tell me about the things you plan and pack.",
         ["Lên kế hoạch: thời gian, khách sạn", "Đặt vé, xem thời tiết", "Đồ mang theo", "Thứ bạn không bao giờ quên"],
         ["Have you ever forgotten something important?"]),
        (39, "problem_experience", "Trips don't always go as planned. Tell me about a trip in your country when something unexpected happened. What went wrong, and how did you handle it?",
         ["Chuyến đi nào, với ai", "Sự cố (xe hỏng, mưa bão, mất đồ…)", "Cách xử lý từng bước", "Kết quả, bài học"],
         ["What do you do differently now when you travel?"]),
    ]),

    # ---------------- Survey: Overseas trips ----------------
    dict(combo_id="C-overseas-1", topic="overseas_trips", kind="combo", questions=[
        (40, "description", "You indicated that you travel to other countries. Describe a country you have visited. What was it like, and what were the people like?",
         ["Nước nào, đi khi nào", "Cảnh quan, thành phố", "Con người, văn hóa", "Điều khác với Việt Nam"],
         ["What surprised you most there?"]),
        (41, "past_first", "Tell me about your first trip abroad. Where did you go, who did you go with, and what do you remember most about it?",
         ["Lần đầu đi nước ngoài: khi nào, ở đâu", "Cảm xúc trước chuyến đi", "Những việc đã làm", "Điều nhớ nhất"],
         ["How did you feel when you came back home?"]),
        (42, "memorable_experience", "Something unusual often happens when we travel to a foreign country. Tell me about a surprising or unexpected experience you had during a trip abroad.",
         ["Bối cảnh chuyến đi", "Điều bất ngờ (ngôn ngữ, đồ ăn, lạc đường…)", "Bạn đã xử lý thế nào", "Vì sao đáng nhớ"],
         ["What advice would you give to someone visiting that country?"]),
    ]),

    # ---------------- Survey: Vacation at home ----------------
    dict(combo_id="C-vacation-1", topic="vacation_home", kind="combo", questions=[
        (43, "description", "You indicated that you sometimes spend your vacations at home. Who do you usually spend that time with, and what are those people like?",
         ["Người thân, bạn bè", "Tính cách / sở thích của họ", "Bạn làm gì cùng họ", "Vì sao thích nghỉ ở nhà"],
         ["What do you like most about staying home?"]),
        (44, "past_recent", "Tell me about your last vacation at home. What did you do from the first day to the last day?",
         ["Kỳ nghỉ nào, mấy ngày", "Ngày đầu", "Những ngày giữa: gặp ai, ăn gì", "Ngày cuối, cảm giác"],
         ["Did you feel rested afterwards?"]),
        (45, "memorable_experience", "Tell me about something unexpected or funny that happened during a vacation you spent at home. Who was involved, and what happened?",
         ["Khi nào", "Chuyện gì bất ngờ/vui", "Mọi người phản ứng thế nào", "Vì sao nhớ"],
         ["Do your family still talk about it?"]),
    ]),

    # ---------------- Unexpected: Technology ----------------
    dict(combo_id="C-tech-1", topic="technology", kind="combo", questions=[
        (46, "description", "What kinds of technology do people in your country use in their daily lives? Tell me about some common devices or services people depend on.",
         ["Smartphone, ví điện tử, gọi xe", "Ở nhà: TV thông minh, robot hút bụi", "Ở công ty", "Vì sao phổ biến"],
         ["Which technology would be hardest to live without?"]),
        (47, "routine", "What piece of technology do you use most often? Describe how you use it on a typical day.",
         ["Thiết bị nào", "Sáng – trưa – tối dùng để làm gì", "Ứng dụng quan trọng", "Ưu/nhược điểm"],
         ["How many hours a day do you think you use it?"]),
        (48, "problem_experience", "Tell me about a time when a piece of technology did not work properly. Maybe your computer crashed or your phone lost its connection. What happened, and what did you do?",
         ["Thiết bị gì, đang làm gì thì hỏng", "Hậu quả", "Bạn thử những cách nào", "Kết quả cuối"],
         ["Do you usually fix things yourself?"]),
    ]),

    # ---------------- Unexpected: Phones ----------------
    dict(combo_id="C-phones-1", topic="phones", kind="combo", questions=[
        (49, "description", "Tell me about the phone you use now. What do you like most about it? Is it the camera, the screen, or certain apps?",
         ["Hãng, đời máy", "Tính năng thích nhất", "Ứng dụng hay dùng", "Điều chưa hài lòng"],
         ["How long have you had this phone?"]),
        (50, "routine", "Besides calling and texting, what do you use your phone for? Tell me about the things you typically do on it during the day.",
         ["Xem tin, mạng xã hội", "Thanh toán, đặt đồ ăn, gọi xe", "Công việc", "Giải trí buổi tối"],
         ["Do you ever try to use your phone less?"]),
        (51, "comparison_change", "Think about the first phone you ever had. What was it like, and how is it different from the phone you use today?",
         ["Điện thoại đầu tiên: khi nào, trông thế nào", "Chức năng hồi đó", "Điện thoại hiện tại", "Thay đổi lớn nhất"],
         ["Do you miss anything about your old phone?"]),
    ]),

    # ---------------- Unexpected: Internet ----------------
    dict(combo_id="C-internet-1", topic="internet", kind="combo", questions=[
        (52, "description", "What do people in your country usually do on the internet? Talk about the most common things people do online.",
         ["Mạng xã hội, video", "Mua sắm, ngân hàng", "Học online", "Đọc tin"],
         ["What do older people mostly use the internet for?"]),
        (53, "routine", "What do you usually do online? Tell me about the websites or apps you use and why you use them.",
         ["Trang/app hay dùng", "Mục đích: học, làm, giải trí", "Thời điểm trong ngày", "Thói quen tốt/xấu"],
         ["Have you ever bought something online that you regretted?"]),
        (54, "past_first", "Tell me about your early experiences with the internet. When did you first go online, and what do you remember about it?",
         ["Lần đầu dùng internet: ở đâu (quán net?), khi nào", "Làm gì lúc đó", "Tốc độ, thiết bị", "So với bây giờ"],
         ["How did your parents feel about the internet back then?"]),
    ]),

    # ---------------- Unexpected: Weather ----------------
    dict(combo_id="C-weather-1", topic="weather", kind="combo", questions=[
        (55, "description", "Tell me about the weather where you live. What is each season like, and which season do you like best?",
         ["Miền Bắc: 4 mùa / miền Nam: 2 mùa", "Đặc điểm từng mùa", "Mùa thích nhất", "Lý do"],
         ["What do people do to stay cool in the summer?"]),
        (56, "routine", "How does the weather change what you do? Tell me about the things you usually do on hot days and on rainy days.",
         ["Ngày nóng: điều hòa, ra ngoài buổi tối", "Ngày mưa: ở nhà, áo mưa", "Ảnh hưởng tới đi làm", "Cảm giác"],
         ["How do you check the weather forecast?"]),
        (57, "memorable_experience", "Tell me about an experience you had with extreme weather, like a storm, a flood, or a heat wave. What happened, and how did people deal with it?",
         ["Khi nào, ở đâu", "Thời tiết khắc nghiệt thế nào", "Bạn và mọi người đã làm gì", "Hậu quả, bài học"],
         ["Has extreme weather become more common?"]),
    ]),

    # ---------------- Unexpected: Transportation ----------------
    dict(combo_id="C-transport-1", topic="transportation", kind="combo", questions=[
        (58, "description", "How do people get around in your country? Tell me about the most common types of transportation people use.",
         ["Xe máy, ô tô, xe buýt, tàu", "Gọi xe công nghệ", "Ưu/nhược điểm", "Khác biệt thành phố/nông thôn"],
         ["Is public transportation popular where you live?"]),
        (59, "routine", "How do you usually get to work or school? Describe your commute and how long it takes.",
         ["Phương tiện", "Lộ trình, thời gian", "Tình trạng giao thông", "Bạn làm gì trên đường"],
         ["Would you like to change the way you commute?"]),
        (60, "problem_experience", "Tell me about a problem you once had while traveling somewhere, like a breakdown, a traffic jam, or a missed bus. What did you do to deal with it?",
         ["Đang đi đâu, bằng gì", "Sự cố", "Bạn xử lý thế nào", "Có đến nơi kịp không"],
         ["How do you avoid that problem now?"]),
    ]),

    # ---------------- Unexpected: Recycling ----------------
    dict(combo_id="C-recycling-1", topic="recycling", kind="combo", questions=[
        (61, "description", "How does recycling work in your area? Tell me what people do with their trash and recyclable items.",
         ["Phân loại rác ở nhà/khu dân cư", "Thu gom, đổi ve chai", "Quy định mới", "Mọi người có thực hiện không"],
         ["Is recycling easy where you live?"]),
        (62, "routine", "What kinds of things do you recycle or reuse at home? Tell me how you do it.",
         ["Chai nhựa, giấy, lon", "Cách phân loại", "Tái sử dụng đồ", "Ai trong nhà làm"],
         ["Why do you think recycling is important?"]),
        (63, "comparison_change", "What was recycling like when you were a child? How is it different from the way people recycle now?",
         ["Hồi nhỏ: bán ve chai, tận dụng đồ", "Bây giờ: phân loại, thùng rác riêng", "Thay đổi nhận thức", "Ý kiến của bạn"],
         ["What could make recycling better in your city?"]),
    ]),

    # ---------------- Unexpected: Holidays ----------------
    dict(combo_id="C-holidays-1", topic="holidays", kind="combo", questions=[
        (64, "description", "Tell me about an important holiday in your country. When is it, and what do people usually do to celebrate it?",
         ["Tết / Trung thu / 2-9…", "Thời gian", "Phong tục, đồ ăn", "Ý nghĩa"],
         ["Which holiday do children like the most?"]),
        (65, "past_recent", "Tell me about the most recent holiday you celebrated. What did you do, who were you with, and was there anything special about it?",
         ["Ngày lễ nào", "Đi đâu, với ai", "Hoạt động chính", "Điều đặc biệt"],
         ["How do you usually feel when a holiday ends?"]),
        (66, "past_first", "Talk about a holiday memory from your childhood. Where were you, what did that day look like, and what do you remember most?",
         ["Năm nào, ở đâu (quê?)", "Không khí, mùi vị, âm thanh", "Hoạt động với gia đình", "So với bây giờ"],
         ["Do you celebrate holidays the same way now?"]),
    ]),

    # ---------------- Unexpected: Health ----------------
    dict(combo_id="C-health-1", topic="health", kind="combo", questions=[
        (67, "description", "Describe a healthy person you know. What makes that person so healthy?",
         ["Người đó là ai", "Ngoại hình, năng lượng", "Thói quen ăn uống, tập luyện", "Bạn học được gì"],
         ["Do you try to follow any of that person's habits?"]),
        (68, "routine", "What do you do to stay healthy? Tell me about your eating, exercise, and sleeping habits.",
         ["Ăn uống", "Vận động", "Ngủ nghỉ", "Điều bạn đang cố cải thiện"],
         ["What is the hardest healthy habit for you to keep?"]),
        (69, "comparison_change", "Have you ever changed a habit to improve your health? What was the change, why did you make it, and what difference did it make?",
         ["Thói quen cũ", "Lý do thay đổi", "Bạn đã thay đổi thế nào (các bước)", "Kết quả trước/sau"],
         ["Was it hard to keep the new habit?"]),
    ]),

    # ---------------- Unexpected: Family & friends ----------------
    dict(combo_id="C-family-1", topic="family_friends", kind="combo", questions=[
        (70, "description", "Describe a family member or a close friend. What is that person like, and what makes him or her special to you?",
         ["Người đó là ai, quen bao lâu", "Ngoại hình / tính cách", "Một ví dụ thể hiện tính cách", "Vì sao quan trọng với bạn"],
         ["How often do you see that person?"]),
        (71, "routine", "What do you usually do when you spend time with your family or friends? Tell me about your typical get-togethers.",
         ["Gặp khi nào, ở đâu", "Hoạt động: ăn uống, cà phê, du lịch", "Chủ đề hay nói", "Cảm giác"],
         ["Who usually organizes these get-togethers?"]),
        (72, "memorable_experience", "Tell me about a special day you spent with your family or friends. What was the occasion, what happened, and why was it so special?",
         ["Dịp gì", "Chuẩn bị", "Diễn biến chính", "Khoảnh khắc đáng nhớ"],
         ["Do you have photos from that day?"]),
    ]),

    # ---------------- Unexpected: Restaurants ----------------
    dict(combo_id="C-restaurants-1", topic="restaurants", kind="combo", questions=[
        (73, "description", "Tell me about restaurants in your country. What are typical restaurants like, and what kinds of food do they serve?",
         ["Quán vỉa hè, nhà hàng, chuỗi", "Món phổ biến", "Không gian, giá cả", "Nơi bạn hay đến"],
         ["Do people tip at restaurants in your country?"]),
        (74, "past_recent", "Tell me about the last time you ate out. Where did you go, who were you with, and what did you order?",
         ["Quán nào, khi nào", "Đi với ai, dịp gì", "Món đã gọi, mùi vị", "Bạn có quay lại không"],
         ["How did you choose that restaurant?"]),
        (75, "memorable_experience", "Tell me about a memorable experience you had at a restaurant. Maybe the food was amazing, or maybe something went wrong. What happened?",
         ["Bối cảnh", "Điều đặc biệt / sự cố", "Bạn phản ứng thế nào", "Kết quả"],
         ["What makes a restaurant good in your opinion?"]),
    ]),

    # ---------------- Unexpected: Banks ----------------
    dict(combo_id="C-banks-1", topic="banks", kind="combo", questions=[
        (76, "description", "Tell me about banks in your country. What do they usually look like, and where are they located?",
         ["Chi nhánh, cây ATM", "Bên trong ngân hàng", "Vị trí", "Ngân hàng số"],
         ["Do you still visit banks in person?"]),
        (77, "routine", "How do you usually do your banking? Tell me what you do when you need to send money or pay bills.",
         ["App ngân hàng, mã QR", "Các bước chuyển tiền", "Khi nào phải ra quầy", "Bảo mật"],
         ["Do you think mobile banking is safe?"]),
        (78, "problem_experience", "Tell me about a problem you once had with a bank or a payment. Maybe a transfer failed or your card didn't work. How did you handle it?",
         ["Lúc nào, giao dịch gì", "Vấn đề", "Bạn liên hệ ai, làm gì", "Kết quả"],
         ["How long did it take to solve?"]),
    ]),

    # ---------------- Unexpected: Appointments ----------------
    dict(combo_id="C-appointments-1", topic="appointments", kind="combo", questions=[
        (79, "description", "What kinds of appointments do you usually make? Tell me about the places you go to for those appointments.",
         ["Khám bệnh, nha sĩ, cắt tóc, sửa xe", "Ở đâu", "Đặt qua đâu", "Tần suất"],
         ["Which appointment do you dislike the most?"]),
        (80, "routine", "What do you usually do when you make an appointment? Tell me the steps from booking it to the day of the appointment.",
         ["Gọi điện / app", "Chọn giờ", "Nhắc lịch", "Ngày hẹn: đến sớm, mang giấy tờ"],
         ["Have you ever forgotten an appointment?"]),
        (81, "problem_experience", "Tell me about a time when something went wrong with an appointment. Maybe you were late, or the other person canceled. What happened, and how did you deal with it?",
         ["Cuộc hẹn gì", "Chuyện gì xảy ra", "Bạn xử lý thế nào", "Kết quả"],
         ["What did you learn from that experience?"]),
    ]),

    # ---------------- Unexpected: Furniture ----------------
    dict(combo_id="C-furniture-1", topic="furniture", kind="combo", questions=[
        (82, "description", "Tell me about the furniture in your home. Is there a piece of furniture that you especially like?",
         ["Đồ nội thất chính", "Món yêu thích", "Mua ở đâu, khi nào", "Vì sao thích"],
         ["What furniture would you like to buy next?"]),
        (83, "comparison_change", "Think about the furniture your family had when you were a child. How was it different from the furniture you use today?",
         ["Đồ hồi nhỏ (gỗ, cũ, ít)", "Đồ hiện tại", "Thay đổi về kiểu dáng, chức năng", "Bạn thích kiểu nào hơn"],
         ["Does your family still keep any old furniture?"]),
        (84, "problem_experience", "Tell me about a time when you had a problem with a piece of furniture. Maybe it broke or didn't fit. What happened, and how did you solve the problem?",
         ["Đồ gì", "Vấn đề", "Cách giải quyết", "Kết quả"],
         ["Did you ever buy furniture online?"]),
    ]),

    # ---------------- Unexpected: Shopping ----------------
    dict(combo_id="C-shopping-1", topic="shopping", kind="combo", questions=[
        (85, "description", "Where do you usually go shopping? Tell me about that place and what you usually buy there.",
         ["Siêu thị, chợ, trung tâm thương mại, online", "Mô tả nơi đó", "Đồ thường mua", "Vì sao chọn nơi đó"],
         ["Do you make a shopping list?"]),
        (86, "past_recent", "Tell me about the last time you went shopping. Where did you go, what did you buy, and who were you with?",
         ["Khi nào, ở đâu", "Mua gì, vì sao", "Đi cùng ai", "Có hài lòng không"],
         ["Did you spend more than you planned?"]),
        (87, "memorable_experience", "Tell me about a memorable shopping experience. Maybe you found a great deal, or the item you bought turned out to be broken. What happened?",
         ["Bối cảnh", "Điều đặc biệt", "Bạn làm gì", "Kết quả"],
         ["What do you usually do when you get a broken item?"]),
    ]),

    # ---------------- Unexpected: Geography ----------------
    dict(combo_id="C-geography-1", topic="geography", kind="combo", questions=[
        (88, "description", "Describe the geography of your country. Are there mountains, rivers, or beaches? What are the different regions like?",
         ["Hình chữ S, ba miền", "Núi phía Bắc, đồng bằng, bờ biển dài", "Một địa danh tiêu biểu", "Ảnh hưởng tới khí hậu/đời sống"],
         ["Which region would you recommend to a visitor?"]),
        (89, "past_first", "Think about a natural place in your country that you visited when you were young. What was it like, and what do you remember about it?",
         ["Nơi nào, đi với ai", "Cảnh vật", "Hoạt động", "Bây giờ nơi đó thay đổi thế nào"],
         ["Have you been back there as an adult?"]),
        (90, "memorable_experience", "Tell me about a memorable trip you took to a mountain, a lake, or another natural place in your country. What happened during that trip?",
         ["Bối cảnh", "Hành trình", "Khoảnh khắc đặc biệt / khó khăn", "Cảm xúc"],
         ["Would you like to go there again?"]),
    ]),

    # ---------------- Role-play sets ----------------
    dict(combo_id="RP-hotel", topic="rp_hotel", kind="rp", questions=[
        (91, "roleplay_ask", "I'd like to give you a situation and ask you to act it out. You have just checked in to a hotel in a city you are visiting for the first time. Go to the front desk and ask three or four questions about the hotel and things to do nearby.",
         ["Chào lễ tân, nói bạn vừa nhận phòng", "Hỏi giờ ăn sáng, wifi, hồ bơi", "Hỏi địa điểm tham quan gần đó", "Hỏi cách di chuyển"],
         []),
        (92, "roleplay_problem", "I'm sorry, but there is a problem I need you to resolve. When you get to your room, you find that the air conditioner is broken and the room is very hot. Call the front desk, explain the problem, and suggest two or three ways to solve it.",
         ["Giới thiệu số phòng", "Mô tả sự cố, vì sao cần xử lý ngay", "Phương án: sửa ngay / đổi phòng / giảm giá", "Kết lịch sự"],
         []),
        (93, "roleplay_experience", "That's the end of the situation. Have you ever had a problem with a place you stayed during a trip? What was the problem, and how was it resolved?",
         ["Chuyến đi nào", "Vấn đề với chỗ ở", "Bạn đã làm gì", "Kết quả"],
         []),
    ]),
    dict(combo_id="RP-clothing", topic="rp_clothing", kind="rp", questions=[
        (94, "roleplay_ask", "I'd like you to act out a situation. You want to buy a jacket from an online clothing store. Call the store and ask three or four questions about the jacket before you order it.",
         ["Chào, nói muốn mua áo khoác", "Hỏi size, màu, chất liệu", "Hỏi giá, khuyến mãi", "Hỏi giao hàng, đổi trả"],
         []),
        (95, "roleplay_problem", "There is a problem I need you to resolve. The jacket you ordered has arrived, but it is the wrong size and the color is different from the picture. Call the store, explain the problem, and offer two or three alternatives.",
         ["Bạn là ai, đơn hàng nào", "Mô tả sai size, sai màu", "Phương án: đổi / hoàn tiền / giảm giá giữ lại", "Đề nghị gọi lại"],
         []),
        (96, "roleplay_experience", "That's the end of the situation. Have you ever been disappointed with something you bought? What was wrong with it, and what did you do about it?",
         ["Mua gì, ở đâu", "Vấn đề", "Cách xử lý", "Bài học"],
         []),
    ]),
    dict(combo_id="RP-cinema", topic="rp_cinema", kind="rp", questions=[
        (97, "roleplay_ask", "Please act out this situation. You want to see a movie with a friend this weekend. Call the movie theater and ask three or four questions to get tickets for the two of you.",
         ["Chào rạp, nói muốn đặt 2 vé", "Hỏi phim, suất chiếu", "Hỏi giá, chỗ ngồi", "Hỏi combo bắp nước / ưu đãi"],
         []),
        (98, "roleplay_problem", "I'm sorry, but there is a problem. When you arrive at the theater, you realize the tickets you bought are for the wrong day. Explain the situation to the staff and suggest two or three ways to solve the problem.",
         ["Giải thích mua nhầm ngày", "Bạn đã đến cùng bạn bè", "Phương án: đổi suất / đổi ngày / hoàn tiền một phần", "Cảm ơn"],
         []),
        (99, "roleplay_experience", "That's the end of the situation. Have you ever made plans to go somewhere but had to cancel or change them at the last minute? What happened?",
         ["Kế hoạch gì", "Vì sao phải hủy/đổi", "Bạn xử lý thế nào", "Kết quả"],
         []),
    ]),
    dict(combo_id="RP-phone", topic="rp_phone_store", kind="rp", questions=[
        (100, "roleplay_ask", "I'd like you to act out a situation. You are thinking about buying a new smartphone. Call a phone store and ask three or four questions about the phone you want.",
         ["Chào, nói mẫu điện thoại quan tâm", "Hỏi dung lượng, màu, camera", "Hỏi giá, trả góp, khuyến mãi", "Hỏi bảo hành"],
         []),
        (101, "roleplay_problem", "There is a problem I need you to resolve. A few days after buying the phone, you notice that the battery runs out very quickly and the phone gets hot. Call the store, explain the problem, and arrange a solution.",
         ["Mua khi nào, mẫu nào", "Mô tả lỗi pin, nóng máy", "Phương án: đổi máy / sửa bảo hành / máy tạm dùng", "Hẹn thời gian"],
         []),
        (102, "roleplay_experience", "That's the end of the situation. Have you ever bought a piece of technology that didn't work the way you expected? Tell me about that experience.",
         ["Sản phẩm gì", "Không như mong đợi thế nào", "Bạn làm gì", "Kết quả"],
         []),
    ]),
    dict(combo_id="RP-travel", topic="rp_travel", kind="rp", questions=[
        (103, "roleplay_ask", "Please act out this situation. You are planning a short vacation. Call a travel agency and ask three or four questions about a tour package you are interested in.",
         ["Chào, nói muốn đi đâu, khi nào", "Hỏi lịch trình", "Hỏi giá bao gồm gì", "Hỏi chính sách hủy"],
         []),
        (104, "roleplay_problem", "I'm sorry, but there is a problem. You have already paid for the tour, but something urgent has come up and you cannot go on the dates you booked. Call the travel agent, explain the situation, and suggest two or three alternatives.",
         ["Bạn là ai, tour nào", "Lý do không đi được", "Phương án: dời ngày / chuyển cho người khác / hoàn một phần", "Kết lịch sự"],
         []),
        (105, "roleplay_experience", "That's the end of the situation. Tell me about a time when your travel plans didn't work out the way you expected. What happened, and how did you deal with it?",
         ["Chuyến đi nào", "Kế hoạch bị đổ vỡ thế nào", "Bạn xử lý ra sao", "Kết quả"],
         []),
    ]),
    dict(combo_id="RP-furniture", topic="rp_furniture", kind="rp", questions=[
        (106, "roleplay_ask", "I'd like to give you a situation. You are at a furniture store and you see a desk that you like. Go to the salesperson and ask three or four questions about it.",
         ["Chào, nói bạn thích cái bàn", "Hỏi kích thước, chất liệu", "Hỏi giá, màu khác", "Hỏi giao hàng, lắp đặt"],
         []),
        (107, "roleplay_problem", "There is a problem I need you to resolve. The desk was delivered to your home, but one of the legs is broken and there is a big scratch on top. Call the store, explain the problem, and offer two or three solutions.",
         ["Đơn hàng, ngày giao", "Mô tả hư hỏng", "Phương án: đổi mới / thợ đến sửa / giảm giá", "Đề nghị phản hồi"],
         []),
        (108, "roleplay_experience", "That's the end of the situation. Tell me about a time when you broke or damaged something at home. What happened, and what did you do?",
         ["Đồ gì, vì sao hỏng", "Phản ứng lúc đó", "Bạn sửa / thay thế", "Bài học"],
         []),
    ]),
    dict(combo_id="RP-gym", topic="rp_gym", kind="rp", questions=[
        (109, "roleplay_ask", "Please act out this situation. A new fitness center has opened near your home. Call the center and ask three or four questions about becoming a member.",
         ["Chào, nói muốn đăng ký", "Hỏi giờ mở cửa, lớp tập", "Hỏi phí, gói tháng/năm", "Hỏi huấn luyện viên, tập thử"],
         []),
        (110, "roleplay_problem", "I'm sorry, but there is a problem. You signed up for a six-month membership, but you have hurt your knee and can't exercise for a while. Call the fitness center, explain the situation, and suggest some options.",
         ["Bạn là ai, gói nào", "Chấn thương, bác sĩ khuyên nghỉ", "Phương án: tạm dừng / chuyển nhượng / đổi sang dịch vụ khác", "Cảm ơn"],
         []),
        (111, "roleplay_experience", "That's the end of the situation. Have you ever had to stop doing something you enjoyed for a while? What happened, and how did you handle it?",
         ["Hoạt động gì", "Vì sao phải dừng", "Bạn làm gì thay thế", "Quay lại thế nào"],
         []),
    ]),
    dict(combo_id="RP-friend", topic="rp_restaurant_friend", kind="rp", questions=[
        (112, "roleplay_ask", "I'd like you to act out a situation. Your friend has recommended a new restaurant. Call your friend and ask three or four questions about the restaurant.",
         ["Chào bạn, nhắc lời giới thiệu", "Hỏi vị trí, món ngon", "Hỏi giá, có cần đặt bàn", "Rủ đi cùng"],
         []),
        (113, "roleplay_problem", "There is a problem I need you to resolve. You and your friend planned to have dinner at that restaurant tonight, but you have to stay late at work. Call your friend, leave a message explaining the situation, and suggest two or three alternatives.",
         ["Xin lỗi, vì sao bận", "Phương án: dời giờ / dời ngày / bạn đi trước", "Hứa bù lại", "Nhờ gọi lại"],
         []),
        (114, "roleplay_experience", "That's the end of the situation. Tell me about a time when you were late for something important. Why were you late, and what happened?",
         ["Sự kiện gì", "Lý do trễ", "Bạn làm gì", "Hậu quả, bài học"],
         []),
    ]),
    dict(combo_id="RP-training", topic="rp_work_training", kind="rp", oqc=True, questions=[
        (115, "roleplay_ask", "Please act out this situation. Your team leader has asked you to join a training course about a new inspection machine. Call the training coordinator and ask three or four questions about the course.",
         ["Chào, giới thiệu bộ phận", "Hỏi thời gian, địa điểm", "Hỏi nội dung, cần chuẩn bị gì", "Hỏi có kiểm tra cuối khóa không"],
         []),
        (116, "roleplay_problem", "I'm sorry, but there is a problem. On the day of the training, an urgent issue comes up on your line and you cannot leave. Call the coordinator, explain the situation, and suggest two or three alternatives.",
         ["Xin lỗi, giải thích việc gấp (chung chung)", "Vì sao bạn phải ở lại", "Phương án: học buổi sau / học online / nhận tài liệu", "Cảm ơn"],
         []),
        (117, "roleplay_experience", "That's the end of the situation. Tell me about a time when you had to change your plans because of something urgent at work. What happened?",
         ["Kế hoạch ban đầu", "Việc gấp là gì", "Bạn xử lý thế nào", "Kết quả"],
         []),
    ]),
    dict(combo_id="RP-ava", topic="rp_ask_ava", kind="rp", questions=[
        (118, "roleplay_ask_ava", "I live in an apartment in the city. Ask me three or four questions about where I live.",
         ["Hỏi vị trí", "Hỏi số phòng, phòng yêu thích", "Hỏi hàng xóm, tiện ích", "Hỏi có muốn chuyển nhà không"],
         []),
        (119, "roleplay_ask_ava", "I also enjoy going to the movies. Ask me three or four questions about the movies I like to watch.",
         ["Hỏi thể loại", "Hỏi diễn viên yêu thích", "Hỏi lần gần nhất đi xem", "Hỏi xem ở rạp hay ở nhà"],
         []),
        (120, "roleplay_ask_ava", "I'm planning to take a vacation next month. Ask me three or four questions about my vacation plans.",
         ["Hỏi đi đâu", "Hỏi đi với ai, bao lâu", "Hỏi kế hoạch hoạt động", "Hỏi chuẩn bị"],
         []),
    ]),

    # ---------------- Advanced pairs (Q14–15) ----------------
    dict(combo_id="ADV-tech", topic="technology", kind="adv", questions=[
        (121, "comparison_change", "Tell me about a type of technology that you are interested in. How has it changed over the past few years? What are the biggest changes you have noticed?",
         ["Công nghệ gì (AI, xe điện, điện thoại…)", "Trước đây thế nào", "Bây giờ khác gì (2 thay đổi)", "Tác động tới bạn/xã hội"],
         []),
        (122, "issue_concern", "Some people worry that new technology causes problems as well as benefits. What concerns do people in your country have about that technology, and what can be done about them?",
         ["Lo ngại cụ thể (việc làm, quyền riêng tư, nghiện…)", "Nguyên nhân", "Ảnh hưởng", "Giải pháp / ý kiến"],
         []),
    ]),
    dict(combo_id="ADV-phones", topic="phones", kind="adv", questions=[
        (123, "comparison_change", "Describe how people used their phones about ten years ago. How is that different from the way people use their phones today?",
         ["10 năm trước: gọi, nhắn tin, mạng chậm", "Bây giờ: thanh toán, làm việc, giải trí", "2–3 thay đổi lớn", "Nguyên nhân"],
         []),
        (124, "issue_concern", "Some people say that young people spend too much time on their phones and are losing face-to-face communication skills. What do people in your country think about this issue?",
         ["Quan điểm lo ngại", "Quan điểm khác (lợi ích)", "Ví dụ thực tế", "Ý kiến của bạn + giải pháp"],
         []),
    ]),
    dict(combo_id="ADV-housing", topic="housing", kind="adv", questions=[
        (125, "comparison_change", "Homes today are quite different from homes in the past. Tell me how homes in your country have changed over the years.",
         ["Nhà ngày xưa: nhà cấp 4, nhiều thế hệ", "Bây giờ: chung cư, nhà thông minh", "Thay đổi lối sống", "Nguyên nhân"],
         []),
        (126, "news_report", "Housing is often in the news. Tell me about a news story you heard about housing, such as rising prices or new apartment projects. What was it about, and how did people react?",
         ["Tin gì, biết qua đâu", "Nội dung chính", "Phản ứng của mọi người", "Ý kiến của bạn"],
         []),
    ]),
    dict(combo_id="ADV-shopping", topic="shopping", kind="adv", questions=[
        (127, "comparison_change", "Shopping habits have changed a lot over the years. How do people shop now compared to the past? Talk about the most important changes.",
         ["Xưa: chợ, cửa hàng", "Nay: sàn TMĐT, livestream, giao nhanh", "Ưu/nhược", "Tác động tới cửa hàng truyền thống"],
         []),
        (128, "issue_concern", "What problems or concerns do people have when they shop online? What do shoppers and companies do to deal with those problems?",
         ["Hàng giả, giao trễ, lừa đảo", "Nguyên nhân", "Cách người mua tự bảo vệ", "Công ty/sàn làm gì"],
         []),
    ]),
    dict(combo_id="ADV-health", topic="health", kind="adv", questions=[
        (129, "comparison_two", "Different generations often have different ideas about what it means to be healthy. How did your parents' generation think about health, and how does that compare to what your generation believes?",
         ["Thế hệ bố mẹ: ăn no, làm việc chân tay", "Thế hệ bạn: tập gym, ăn kiêng, sức khỏe tinh thần", "Điểm giống", "Ý kiến"],
         []),
        (130, "news_report", "Tell me about a recent news story you heard about a health issue. What was the issue, and how did people in your community react to it?",
         ["Tin về dịch bệnh / ngộ độc / ô nhiễm…", "Diễn biến", "Phản ứng cộng đồng", "Suy nghĩ của bạn"],
         []),
    ]),
    dict(combo_id="ADV-environment", topic="recycling", kind="adv", questions=[
        (131, "comparison_change", "The way people handle waste and recycling has changed over the years. How were things done in the past, and how have they changed?",
         ["Ngày xưa", "Bây giờ: phân loại, quy định", "Thay đổi về ý thức", "Còn tồn tại gì"],
         []),
        (132, "news_report", "Stories about the environment are often in the news. Tell me about a news story related to the environment or pollution that caught your attention. What happened, and how did people respond?",
         ["Tin gì (ô nhiễm không khí, rác nhựa…)", "Diễn biến", "Phản ứng", "Điều bạn rút ra"],
         []),
    ]),
    dict(combo_id="ADV-transport", topic="transportation", kind="adv", questions=[
        (133, "comparison_change", "How has transportation in your city or town changed over the past ten years? Describe the changes in as much detail as you can.",
         ["Trước: đường hẹp, ít xe buýt", "Nay: metro, xe công nghệ, xe điện", "Tác động", "Còn gì cần cải thiện"],
         []),
        (134, "issue_concern", "Traffic is a big issue in many cities. What transportation problems do people in your country talk about, and what is being done to solve them?",
         ["Kẹt xe, ô nhiễm, tai nạn", "Nguyên nhân", "Giải pháp của chính quyền", "Ý kiến của bạn"],
         []),
    ]),
    dict(combo_id="ADV-industry", topic="industry", kind="adv", questions=[
        (135, "description", "Tell me about an industry that is growing quickly in your country. Why is it growing, and what makes it important?",
         ["Ngành gì (điện tử, bán dẫn, du lịch…)", "Lý do phát triển", "Đóng góp cho đất nước", "Cơ hội việc làm"],
         []),
        (136, "comparison_change", "How do young people in your country prepare for jobs in that industry? How has that preparation changed over the past few years?",
         ["Học gì, kỹ năng gì", "Trước đây", "Bây giờ (ngoại ngữ, chứng chỉ, thực tập)", "Ý kiến"],
         []),
    ]),
    dict(combo_id="ADV-oqc", topic="oqc_work", kind="adv", oqc=True, questions=[
        (137, "comparison_change", "Quality standards in factories have changed over time. How has the way your team checks product quality changed since you started working?",
         ["Lúc bạn mới vào", "Bây giờ: tự động hóa, dữ liệu, tiêu chuẩn mới (nói chung chung)", "2 thay đổi cụ thể", "Ảnh hưởng tới công việc của bạn"],
         []),
        (138, "issue_concern", "Customers today expect very high quality from electronic products. What happens when a product does not meet those expectations, and what can companies do to prevent such problems?",
         ["Kỳ vọng của khách hàng", "Hậu quả khi có lỗi (đổi trả, mất uy tín)", "Giải pháp phòng ngừa", "Vai trò của người kiểm tra chất lượng"],
         []),
    ]),
    dict(combo_id="ADV-internet", topic="internet", kind="adv", questions=[
        (139, "comparison_two", "How do people of different ages use the internet differently? Compare how young people and older people in your country use it.",
         ["Người trẻ: mạng xã hội, video ngắn", "Người lớn tuổi: tin tức, gọi video", "Điểm giống", "Ý kiến"],
         []),
        (140, "issue_concern", "Many people are worried about safety and privacy on the internet. What concerns do people have, and how have those concerns changed the way people use the internet?",
         ["Lừa đảo, lộ thông tin", "Ví dụ", "Người dùng thay đổi thói quen thế nào", "Lời khuyên"],
         []),
    ]),
    dict(combo_id="ADV-holidays", topic="holidays", kind="adv", questions=[
        (141, "comparison_change", "How have holiday celebrations in your country changed compared to when you were a child?",
         ["Tết xưa: gói bánh, đi chúc tết", "Tết nay: du lịch, mua sẵn", "Lý do thay đổi", "Bạn thích kiểu nào"],
         []),
        (142, "issue_concern", "What issues or concerns do people have during big holidays, such as traffic, prices, or safety? What do people do to deal with them?",
         ["Kẹt xe, giá tăng, an toàn giao thông", "Nguyên nhân", "Cách mọi người đối phó", "Ý kiến"],
         []),
    ]),
]
