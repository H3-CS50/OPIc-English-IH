// Nội dung học IPA (bảng phiên âm quốc tế) cho người Việt.
// Ký hiệu theo kiểu Anh–Mỹ, khớp với phiên âm khi chạm vào từ trong app (ipa-dict en_US).
// Cột "uk" là ký hiệu tương ứng trong từ điển Anh–Anh (Cambridge, Oxford) và slide của lớp.
// Mô tả khẩu hình và "gần giống tiếng Việt" chỉ là cách gợi nhớ gần đúng, không phải âm y hệt.

export const SOUNDS = [
  // ---------- Nguyên âm đơn ----------
  { sym: 'i', uk: 'iː', kind: 'vowel', name: 'i dài',
    how: 'Kéo môi sang hai bên như đang cười, lưỡi nâng cao, giữ âm lâu và căng.',
    vn: 'Giống "i" trong "đi" nhưng kéo dài hơn: "iii".',
    tip: 'Đừng đọc ngắn như /ɪ/: "sheep" (con cừu) khác "ship" (con tàu).',
    spell: 'ee, ea, e, ie (see, eat, me, piece)',
    words: [['see', 'nhìn'], ['eat', 'ăn'], ['people', 'mọi người'], ['meet', 'gặp'], ['teacher', 'giáo viên']],
    pair: ['sheep', 'ship'] },
  { sym: 'ɪ', uk: 'ɪ', kind: 'vowel', name: 'i ngắn',
    how: 'Môi và lưỡi thả lỏng, miệng hơi mở hơn /i/, nói nhanh và dứt khoát.',
    vn: 'Nằm giữa "i" và "ê" tiếng Việt, rất ngắn.',
    tip: 'Ngắn và lỏng hơn /i/. "sit" (ngồi) khác "seat" (chỗ ngồi).',
    spell: 'i, y (it, gym)',
    words: [['it', 'nó'], ['sit', 'ngồi'], ['big', 'to'], ['city', 'thành phố'], ['fish', 'cá']],
    pair: ['seat', 'sit'] },
  { sym: 'ɛ', uk: 'e', kind: 'vowel', name: 'e',
    how: 'Miệng mở vừa, môi kéo nhẹ sang hai bên, lưỡi ở giữa–trước.',
    vn: 'Gần "e" trong "mẹ", nhưng miệng mở ít hơn một chút.',
    tip: 'Từ điển Anh–Anh viết là /e/. Đừng mở miệng quá rộng thành /æ/: "bed" khác "bad".',
    spell: 'e, ea, ai (bed, bread, said)',
    words: [['bed', 'giường'], ['red', 'màu đỏ'], ['friend', 'bạn'], ['many', 'nhiều'], ['ten', 'mười']],
    pair: ['bed', 'bad'] },
  { sym: 'æ', uk: 'æ', kind: 'vowel', name: 'a bẹt',
    how: 'Hạ hàm xuống thật thấp, miệng mở rộng sang hai bên, lưỡi đẩy ra trước.',
    vn: 'Như đang nói "e" nhưng mở miệng to như nói "a": nghe giữa "e" và "a".',
    tip: 'Người Việt hay đọc thành "e" hoặc "a". "bad" (tệ) khác "bed" (giường), "cat" khác "cut".',
    spell: 'a (cat, black, happy)',
    words: [['cat', 'con mèo'], ['bad', 'tệ'], ['man', 'người đàn ông'], ['family', 'gia đình'], ['happy', 'vui']],
    pair: ['man', 'men'] },
  { sym: 'ɑ', uk: 'ɑː / ɒ', kind: 'vowel', name: 'a mở sâu',
    how: 'Mở miệng to theo chiều dọc, lưỡi hạ thấp và lùi về sau, môi không tròn.',
    vn: 'Giống "a" trong "ba" nhưng mở miệng rộng hơn, âm từ sâu trong họng.',
    tip: 'Kiểu Anh–Anh: "father" là /ɑː/, còn "hot, job" là /ɒ/ tròn môi hơn. Kiểu Mỹ đọc tất cả là /ɑ/.',
    spell: 'o, a (hot, job, father, car)',
    words: [['hot', 'nóng'], ['stop', 'dừng'], ['father', 'bố'], ['job', 'công việc'], ['box', 'hộp']],
    pair: ['luck', 'lock'] },
  { sym: 'ɔ', uk: 'ɔː', kind: 'vowel', name: 'o tròn',
    how: 'Môi tròn và hơi chu ra, miệng mở vừa, lưỡi lùi về sau.',
    vn: 'Gần "o" trong "bò", hơi kéo dài.',
    tip: 'Nhiều người Mỹ đọc âm này giống /ɑ/ (như "caught" = "cot"); cả hai cách đều được hiểu.',
    spell: 'aw, au, al, o (saw, talk, water, long)',
    words: [['water', 'nước'], ['all', 'tất cả'], ['talk', 'nói chuyện'], ['thought', 'đã nghĩ'], ['long', 'dài']],
    pair: null },
  { sym: 'ʊ', uk: 'ʊ', kind: 'vowel', name: 'u ngắn',
    how: 'Môi hơi tròn nhưng thả lỏng, nói ngắn.',
    vn: 'Nằm giữa "u" và "ư" tiếng Việt, rất ngắn.',
    tip: 'Ngắn hơn /u/: "full" (no) khác "fool" (kẻ ngốc).',
    spell: 'oo, u, ou (book, put, could)',
    words: [['book', 'sách'], ['good', 'tốt'], ['put', 'đặt'], ['look', 'nhìn'], ['could', 'có thể']],
    pair: ['full', 'fool'] },
  { sym: 'u', uk: 'uː', kind: 'vowel', name: 'u dài',
    how: 'Chu môi tròn và căng, lưỡi nâng cao phía sau, giữ âm lâu.',
    vn: 'Giống "u" trong "cũ" nhưng kéo dài: "uuu".',
    tip: 'Từ điển Anh–Anh viết /uː/. "pool" (bể bơi) dài hơn "pull" (kéo).',
    spell: 'oo, u, ue, o (food, blue, two)',
    words: [['food', 'đồ ăn'], ['school', 'trường học'], ['blue', 'màu xanh'], ['two', 'hai'], ['soon', 'sớm']],
    pair: ['pull', 'pool'] },
  { sym: 'ʌ', uk: 'ʌ', kind: 'vowel', name: 'ă / â',
    how: 'Miệng mở vừa, lưỡi thả lỏng ở giữa, nói ngắn và dứt khoát.',
    vn: 'Nghe gần "ă" hoặc "â" tiếng Việt: "cup" ≈ "cắp".',
    tip: 'Đây là âm của chữ "u" trong cup, but, study. Đừng đọc thành "u". "cup" khác "cap".',
    spell: 'u, o, ou (cup, love, money, young)',
    words: [['cup', 'cái cốc'], ['love', 'yêu'], ['mother', 'mẹ'], ['money', 'tiền'], ['study', 'học']],
    pair: ['cup', 'cap'] },
  { sym: 'ə', uk: 'ə', kind: 'vowel', name: 'ơ nhẹ (schwa)',
    how: 'Thả lỏng hoàn toàn miệng và lưỡi, nói rất nhẹ và nhanh.',
    vn: 'Như "ơ" nói lướt, gần như nuốt mất.',
    tip: 'Âm hay gặp nhất trong tiếng Anh, chỉ có ở âm tiết KHÔNG nhấn. Nói đúng âm này giúp giọng tự nhiên hơn rất nhiều (xem Bài 7).',
    spell: 'bất kỳ nguyên âm nào ở âm tiết không nhấn (about, banana, the)',
    words: [['about', 'về'], ['banana', 'chuối'], ['today', 'hôm nay'], ['the', 'cái, những'], ['problem', 'vấn đề']],
    pair: null },
  { sym: 'ɝ', uk: 'ɜː / ə', kind: 'vowel', name: 'ơ + uốn lưỡi',
    how: 'Nói "ơ" rồi cong đầu lưỡi lên và lùi về sau (không chạm vòm miệng), môi hơi tròn.',
    vn: 'Như "ơ" có chữ "r" uốn lưỡi đi kèm: "bird" ≈ "bơ(r)d".',
    tip: 'Kiểu Anh–Anh không uốn lưỡi: "bird" /bɜːd/, "teacher" /ˈtiːtʃə/. Chọn một kiểu và nói nhất quán.',
    spell: 'er, ir, ur, or, ear (her, bird, work, learn)',
    words: [['bird', 'con chim'], ['work', 'làm việc'], ['girl', 'cô gái'], ['learn', 'học'], ['teacher', 'giáo viên']],
    pair: null },
  // ---------- Nguyên âm đôi ----------
  { sym: 'eɪ', uk: 'eɪ', kind: 'diphthong', name: 'ây',
    how: 'Bắt đầu ở "ê" rồi trượt nhẹ lên "i".',
    vn: 'Giống "ây" trong "đây".',
    tip: 'Đừng dừng ở "ê": "late" (muộn) khác "let" (để).',
    spell: 'a_e, ai, ay, ei (name, rain, day, eight)',
    words: [['say', 'nói'], ['day', 'ngày'], ['name', 'tên'], ['great', 'tuyệt'], ['table', 'cái bàn']],
    pair: ['late', 'let'] },
  { sym: 'aɪ', uk: 'aɪ', kind: 'diphthong', name: 'ai',
    how: 'Bắt đầu ở "a" mở rộng rồi trượt lên "i".',
    vn: 'Giống "ai" trong "hai".',
    tip: 'Nhớ đọc cả âm cuối sau "ai": "nice" /naɪs/, "five" /faɪv/, "right" /raɪt/.',
    spell: 'i_e, y, igh, uy (time, my, right, buy)',
    words: [['my', 'của tôi'], ['time', 'thời gian'], ['nice', 'đẹp, tốt'], ['buy', 'mua'], ['five', 'năm (số 5)']],
    pair: null },
  { sym: 'ɔɪ', uk: 'ɔɪ', kind: 'diphthong', name: 'oi',
    how: 'Bắt đầu ở "o" tròn môi rồi trượt sang "i".',
    vn: 'Giống "oi" trong "đòi".',
    tip: 'Âm khá dễ với người Việt.',
    spell: 'oy, oi (boy, noise)',
    words: [['boy', 'cậu bé'], ['enjoy', 'thích'], ['choice', 'lựa chọn'], ['noise', 'tiếng ồn'], ['toy', 'đồ chơi']],
    pair: null },
  { sym: 'aʊ', uk: 'aʊ', kind: 'diphthong', name: 'ao',
    how: 'Bắt đầu ở "a" rồi chu tròn môi trượt về "u".',
    vn: 'Giống "ao" trong "sao" (kết thúc gần "u").',
    tip: '"house" là /haʊs/ — đừng quên âm /s/ cuối.',
    spell: 'ou, ow (house, how)',
    words: [['how', 'thế nào'], ['now', 'bây giờ'], ['house', 'ngôi nhà'], ['about', 'về'], ['town', 'thị trấn']],
    pair: null },
  { sym: 'oʊ', uk: 'əʊ', kind: 'diphthong', name: 'âu / ô-u',
    how: 'Bắt đầu ở "ô" rồi chu môi trượt về "u".',
    vn: 'Giống "ô" rồi trượt sang "u": "go" ≈ "gôu", không phải "gô".',
    tip: 'Lỗi hay gặp: dừng ở "ô". Kiểu Anh–Anh viết /əʊ/, bắt đầu bằng "ơ".',
    spell: 'o, o_e, oa, ow (go, home, road, know)',
    words: [['go', 'đi'], ['home', 'nhà'], ['know', 'biết'], ['phone', 'điện thoại'], ['cold', 'lạnh']],
    pair: ['low', 'law'] },
  // ---------- Phụ âm gần tiếng Việt ----------
  { sym: 'p', uk: 'p', kind: 'consonant', group: 'easy', name: 'p bật hơi',
    how: 'Mím hai môi rồi bật mạnh, có luồng hơi thoát ra (đặt tay trước miệng sẽ thấy).',
    vn: 'Gần "p" trong "pin", nhưng bật hơi mạnh hơn ở đầu từ.',
    tip: 'Ở cuối từ phải khép môi lại: "stop", "cup", "shop".',
    spell: 'p, pp', words: [['pen', 'bút'], ['paper', 'giấy'], ['happy', 'vui'], ['stop', 'dừng']], pair: null },
  { sym: 'b', uk: 'b', kind: 'consonant', group: 'easy', name: 'b',
    how: 'Mím hai môi rồi bật ra, cổ họng rung.', vn: 'Giống "b" trong "ba".',
    tip: 'Cuối từ vẫn phải có: "job", "club".', spell: 'b, bb', words: [['big', 'to'], ['job', 'công việc'], ['baby', 'em bé']], pair: null },
  { sym: 't', uk: 't', kind: 'consonant', group: 'easy', name: 't bật hơi',
    how: 'Đầu lưỡi chạm vào phần lợi ngay sau răng trên (không chạm răng), bật hơi mạnh ở đầu từ.',
    vn: 'Gần "th" trong "thơ" ở đầu từ; ở cuối từ giống "t" trong "mát".',
    tip: 'Cuối từ hay bị bỏ: "cat", "light", "eight". Trong giọng Mỹ, "t" giữa hai nguyên âm (water, city) đọc nhẹ gần như "đ".',
    spell: 't, tt, -ed', words: [['ten', 'mười'], ['water', 'nước'], ['cat', 'con mèo']], pair: null },
  { sym: 'd', uk: 'd', kind: 'consonant', group: 'easy', name: 'd (= đ)',
    how: 'Đầu lưỡi chạm lợi sau răng trên rồi bật ra, cổ họng rung.',
    vn: 'Giống "đ" tiếng Việt — KHÔNG phải "d" tiếng Việt (miền Bắc đọc "d" là /z/).',
    tip: '"day" đọc là "đây", không phải "dây".', spell: 'd, dd, -ed', words: [['day', 'ngày'], ['dog', 'con chó'], ['bed', 'giường']], pair: ['day', 'they'] },
  { sym: 'k', uk: 'k', kind: 'consonant', group: 'easy', name: 'k bật hơi',
    how: 'Cuống lưỡi chạm vòm mềm rồi bật hơi mạnh.', vn: 'Gần "c/k" trong "cá", nhưng bật hơi mạnh ở đầu từ; cuối từ giống "c" trong "các".',
    tip: 'Cuối từ: "book", "like", "make" — phải nghe được âm /k/.', spell: 'c, k, ck, ch', words: [['cat', 'con mèo'], ['book', 'sách'], ['school', 'trường']], pair: null },
  { sym: 'ɡ', uk: 'ɡ', kind: 'consonant', group: 'easy', name: 'g',
    how: 'Như /k/ nhưng cổ họng rung.', vn: 'Giống "g" trong "ga".', tip: 'Cuối từ: "big", "dog" — đừng đọc thành "bích".',
    spell: 'g, gg', words: [['go', 'đi'], ['big', 'to'], ['good', 'tốt']], pair: null },
  { sym: 'f', uk: 'f', kind: 'consonant', group: 'easy', name: 'f (= ph)',
    how: 'Răng trên chạm nhẹ môi dưới, thổi hơi.', vn: 'Giống "ph" trong "phở".', tip: 'Cuối từ: "laugh" /læf/, "life".',
    spell: 'f, ff, ph, gh', words: [['five', 'năm'], ['phone', 'điện thoại'], ['coffee', 'cà phê'], ['laugh', 'cười']], pair: null },
  { sym: 'v', uk: 'v', kind: 'consonant', group: 'easy', name: 'v',
    how: 'Như /f/ nhưng cổ họng rung.', vn: 'Giống "v" trong "về".', tip: 'Cuối từ hay bị bỏ: "have", "five", "love".',
    spell: 'v', words: [['very', 'rất'], ['have', 'có'], ['seven', 'bảy']], pair: null },
  { sym: 's', uk: 's', kind: 'consonant', group: 'easy', name: 's (= x)',
    how: 'Đầu lưỡi gần lợi trên, thổi hơi qua khe hẹp, không rung.', vn: 'Giống "x" trong "xe".',
    tip: 'Đừng quên /s/ ở số nhiều và ngôi thứ ba: "books", "he works".', spell: 's, ss, c, ce', words: [['see', 'nhìn'], ['city', 'thành phố'], ['bus', 'xe buýt'], ['nice', 'tốt']], pair: ['she', 'see'] },
  { sym: 'z', uk: 'z', kind: 'consonant', group: 'easy', name: 'z',
    how: 'Như /s/ nhưng cổ họng rung (nghe tiếng vo ve).', vn: 'Giống "d" hoặc "gi" giọng miền Bắc: "dì".',
    tip: 'Chữ "s" thường đọc là /z/: "is", "dogs", "days".', spell: 'z, s', words: [['zoo', 'sở thú'], ['is', 'là'], ['dogs', 'những con chó'], ['days', 'những ngày']], pair: ['price', 'prize'] },
  { sym: 'h', uk: 'h', kind: 'consonant', group: 'easy', name: 'h',
    how: 'Thở hơi nhẹ ra từ cổ họng.', vn: 'Giống "h" trong "hoa".', tip: 'Chữ "h" trong "hour", "honest" câm.',
    spell: 'h, wh', words: [['hot', 'nóng'], ['happy', 'vui'], ['who', 'ai']], pair: null },
  { sym: 'm', uk: 'm', kind: 'consonant', group: 'easy', name: 'm', how: 'Mím môi, hơi đi qua mũi.', vn: 'Giống "m".',
    tip: 'Cuối từ giữ môi khép: "home", "time".', spell: 'm, mm', words: [['man', 'đàn ông'], ['summer', 'mùa hè'], ['home', 'nhà']], pair: null },
  { sym: 'n', uk: 'n', kind: 'consonant', group: 'easy', name: 'n', how: 'Đầu lưỡi chạm lợi trên, hơi đi qua mũi.', vn: 'Giống "n".',
    tip: 'Người miền Bắc chú ý không lẫn với /l/: "night" khác "light".', spell: 'n, nn, kn', words: [['no', 'không'], ['know', 'biết'], ['sun', 'mặt trời']], pair: ['night', 'light'] },
  { sym: 'ŋ', uk: 'ŋ', kind: 'consonant', group: 'easy', name: 'ng', how: 'Cuống lưỡi chạm vòm mềm, hơi đi qua mũi.',
    vn: 'Giống "ng" trong "sông".', tip: '"-ing" đọc /ɪŋ/, đừng đọc thành "in": "thinking" /ˈθɪŋkɪŋ/.',
    spell: 'ng, n (trước k, g)', words: [['sing', 'hát'], ['long', 'dài'], ['thinking', 'đang nghĩ']], pair: null },
  { sym: 'l', uk: 'l', kind: 'consonant', group: 'easy', name: 'l',
    how: 'Đầu lưỡi chạm lợi trên, hơi đi ra hai bên lưỡi. Ở cuối từ đầu lưỡi VẪN chạm lợi.',
    vn: 'Giống "l" trong "lá". Tiếng Việt không có "l" cuối từ — cần luyện riêng.',
    tip: 'Cuối từ: "feel", "school", "hotel" — giữ đầu lưỡi trên lợi một chút.', spell: 'l, ll', words: [['light', 'ánh sáng'], ['feel', 'cảm thấy'], ['school', 'trường'], ['hello', 'xin chào']], pair: ['low', 'no'] },
  { sym: 'w', uk: 'w', kind: 'consonant', group: 'easy', name: 'w', how: 'Chu tròn môi rồi mở nhanh ra nguyên âm sau.',
    vn: 'Giống "qu"/"oa": "we" ≈ "uy", "way" ≈ "uây".', tip: 'Chữ "o" trong "one" đọc /w/: /wʌn/.', spell: 'w, wh, o', words: [['we', 'chúng tôi'], ['way', 'con đường, cách'], ['one', 'một']], pair: null },
  { sym: 'j', uk: 'j', kind: 'consonant', group: 'easy', name: 'y (ký hiệu j)',
    how: 'Lưỡi nâng gần vòm cứng như sắp nói "i", rồi chuyển nhanh sang nguyên âm.',
    vn: 'Giống "d" giọng miền Nam / "y" trong "yêu".', tip: 'Ký hiệu /j/ KHÔNG phải chữ "j": "yes" /jɛs/. Chữ "j" (job) đọc là /dʒ/.',
    spell: 'y, u, ew (yes, use)', words: [['yes', 'vâng'], ['you', 'bạn'], ['use', 'dùng']], pair: null },
  // ---------- Phụ âm khó với người Việt ----------
  { sym: 'θ', uk: 'θ', kind: 'consonant', group: 'hard', name: 'th không rung',
    how: 'Đặt đầu lưỡi giữa hai hàm răng (thè ra một chút), thổi hơi qua — cổ họng KHÔNG rung.',
    vn: 'Tiếng Việt không có. KHÔNG đọc thành "th" tiếng Việt, "t" hay "s".',
    tip: 'Soi gương: phải thấy đầu lưỡi. "think" khác "sink", "three" khác "tree".',
    spell: 'th (think, three, mouth)', words: [['think', 'nghĩ'], ['three', 'ba'], ['thank', 'cảm ơn'], ['birthday', 'sinh nhật'], ['math', 'toán']],
    pair: ['think', 'sink'] },
  { sym: 'ð', uk: 'ð', kind: 'consonant', group: 'hard', name: 'th rung',
    how: 'Lưỡi đặt như /θ/ nhưng cổ họng rung (đặt tay lên cổ sẽ thấy rung).',
    vn: 'Tiếng Việt không có. Không đọc thành "đ", "d" hay "z".',
    tip: 'Có trong rất nhiều từ ngắn: the, this, that, they, there, mother.',
    spell: 'th (this, mother, weather)', words: [['this', 'cái này'], ['that', 'cái kia'], ['the', 'cái, những'], ['mother', 'mẹ'], ['weather', 'thời tiết']],
    pair: ['they', 'day'] },
  { sym: 'ʃ', uk: 'ʃ', kind: 'consonant', group: 'hard', name: 'sh',
    how: 'Chu môi ra phía trước, lưỡi lùi nhẹ về sau, thổi hơi mạnh — không rung. Giống tiếng "suỵt".',
    vn: 'Gần "s" uốn lưỡi tiếng Việt nhưng môi chu tròn hơn.',
    tip: 'Đừng đọc thành /s/: "she" khác "see", "ship" khác "sip". "-tion" đọc /ʃən/: station, nation.',
    spell: 'sh, ti, ci, s (she, station, special, sure)', words: [['she', 'cô ấy'], ['ship', 'con tàu'], ['sure', 'chắc chắn'], ['station', 'nhà ga'], ['wash', 'rửa']],
    pair: ['ship', 'sip'] },
  { sym: 'ʒ', uk: 'ʒ', kind: 'consonant', group: 'hard', name: 'zh',
    how: 'Khẩu hình như /ʃ/ nhưng cổ họng rung.',
    vn: 'Gần "r" đọc uốn lưỡi trong tiếng Việt chuẩn ("rõ ràng"), môi chu tròn.',
    tip: 'Ít gặp, thường ở "-sure, -sion": measure, usually, television.',
    spell: 's, si, g (measure, vision, garage)', words: [['measure', 'đo'], ['usually', 'thường xuyên'], ['television', 'ti vi'], ['vision', 'tầm nhìn']],
    pair: null },
  { sym: 'tʃ', uk: 'tʃ', kind: 'consonant', group: 'hard', name: 'ch',
    how: 'Đầu lưỡi chạm lợi trên như /t/, môi chu tròn, rồi bật ra thành /ʃ/ — một âm liền, không rung.',
    vn: 'Gần "ch" tiếng Việt nhưng môi chu tròn và có tiếng xì mạnh hơn.',
    tip: 'Cuối từ phải nghe rõ: "watch", "much", "teach". "chip" khác "ship".',
    spell: 'ch, tch, t(ure) (chair, watch, picture)', words: [['chair', 'ghế'], ['teacher', 'giáo viên'], ['watch', 'xem'], ['much', 'nhiều'], ['cheap', 'rẻ']],
    pair: ['cheap', 'sheep'] },
  { sym: 'dʒ', uk: 'dʒ', kind: 'consonant', group: 'hard', name: 'j',
    how: 'Khẩu hình như /tʃ/ nhưng cổ họng rung.',
    vn: 'Gần "gi"/"ch" có rung, môi chu tròn. Không đọc thành "d" hay "z".',
    tip: 'Chữ "j" và "g" trước e, i, y: job, change, age. Cuối từ: "age", "large", "judge".',
    spell: 'j, g, dge (job, age, judge)', words: [['job', 'công việc'], ['judge', 'thẩm phán'], ['change', 'thay đổi'], ['age', 'tuổi'], ['large', 'lớn']],
    pair: ['joke', 'choke'] },
  { sym: 'r', uk: 'r', kind: 'consonant', group: 'hard', name: 'r uốn lưỡi',
    how: 'Cong đầu lưỡi lên và lùi về sau, KHÔNG chạm vòm miệng, môi hơi tròn. Không rung lưỡi.',
    vn: 'Khác "r" tiếng Việt: "r" tiếng Việt có tiếng xát (gần /ʒ/), rung lưỡi, hoặc đọc thành "z". /r/ tiếng Anh không có tiếng xát, lưỡi không chạm đâu cả.',
    tip: 'Kiểu Mỹ đọc /r/ cả ở cuối từ (car, more); kiểu Anh thì không. "right" khác "light", "rice" khác "lice".',
    spell: 'r, rr, wr (red, sorry, write)', words: [['red', 'màu đỏ'], ['right', 'đúng'], ['very', 'rất'], ['room', 'phòng'], ['car', 'xe hơi']],
    pair: ['right', 'light'] },
];

// Cặp âm dễ nhầm (dùng cho luyện nghe / nói). Phiên âm ghi sẵn để không phụ thuộc cách đọc thứ hai của từ.
export const PAIRS = [
  { a: 'sheep', b: 'ship', ia: '/ʃip/', ib: '/ʃɪp/', focus: 'i – ɪ' },
  { a: 'leave', b: 'live', ia: '/liv/', ib: '/lɪv/', focus: 'i – ɪ' },
  { a: 'eat', b: 'it', ia: '/it/', ib: '/ɪt/', focus: 'i – ɪ' },
  { a: 'seat', b: 'sit', ia: '/sit/', ib: '/sɪt/', focus: 'i – ɪ' },
  { a: 'fool', b: 'full', ia: '/ful/', ib: '/fʊl/', focus: 'u – ʊ' },
  { a: 'pool', b: 'pull', ia: '/pul/', ib: '/pʊl/', focus: 'u – ʊ' },
  { a: 'bed', b: 'bad', ia: '/bɛd/', ib: '/bæd/', focus: 'ɛ – æ' },
  { a: 'men', b: 'man', ia: '/mɛn/', ib: '/mæn/', focus: 'ɛ – æ' },
  { a: 'cup', b: 'cap', ia: '/kʌp/', ib: '/kæp/', focus: 'ʌ – æ' },
  { a: 'cut', b: 'cat', ia: '/kʌt/', ib: '/kæt/', focus: 'ʌ – æ' },
  { a: 'luck', b: 'lock', ia: '/lʌk/', ib: '/lɑk/', focus: 'ʌ – ɑ' },
  { a: 'hat', b: 'hot', ia: '/hæt/', ib: '/hɑt/', focus: 'æ – ɑ' },
  { a: 'late', b: 'let', ia: '/leɪt/', ib: '/lɛt/', focus: 'eɪ – ɛ' },
  { a: 'wait', b: 'wet', ia: '/weɪt/', ib: '/wɛt/', focus: 'eɪ – ɛ' },
  { a: 'low', b: 'law', ia: '/loʊ/', ib: '/lɔ/', focus: 'oʊ – ɔ' },
  { a: 'think', b: 'sink', ia: '/θɪŋk/', ib: '/sɪŋk/', focus: 'θ – s' },
  { a: 'three', b: 'tree', ia: '/θri/', ib: '/tri/', focus: 'θ – t' },
  { a: 'thank', b: 'tank', ia: '/θæŋk/', ib: '/tæŋk/', focus: 'θ – t' },
  { a: 'they', b: 'day', ia: '/ðeɪ/', ib: '/deɪ/', focus: 'ð – d' },
  { a: 'then', b: 'den', ia: '/ðɛn/', ib: '/dɛn/', focus: 'ð – d' },
  { a: 'she', b: 'see', ia: '/ʃi/', ib: '/si/', focus: 'ʃ – s' },
  { a: 'ship', b: 'sip', ia: '/ʃɪp/', ib: '/sɪp/', focus: 'ʃ – s' },
  { a: 'cheap', b: 'sheep', ia: '/tʃip/', ib: '/ʃip/', focus: 'tʃ – ʃ' },
  { a: 'chip', b: 'ship', ia: '/tʃɪp/', ib: '/ʃɪp/', focus: 'tʃ – ʃ' },
  { a: 'joke', b: 'choke', ia: '/dʒoʊk/', ib: '/tʃoʊk/', focus: 'dʒ – tʃ' },
  { a: 'right', b: 'light', ia: '/raɪt/', ib: '/laɪt/', focus: 'r – l' },
  { a: 'rice', b: 'lice', ia: '/raɪs/', ib: '/laɪs/', focus: 'r – l' },
  { a: 'road', b: 'load', ia: '/roʊd/', ib: '/loʊd/', focus: 'r – l' },
  { a: 'light', b: 'night', ia: '/laɪt/', ib: '/naɪt/', focus: 'l – n' },
  { a: 'low', b: 'no', ia: '/loʊ/', ib: '/noʊ/', focus: 'l – n' },
  { a: 'price', b: 'prize', ia: '/praɪs/', ib: '/praɪz/', focus: 's – z' },
  { a: 'bus', b: 'buzz', ia: '/bʌs/', ib: '/bʌz/', focus: 's – z' },
];

// Bài học: đọc theo thứ tự. Nội dung HTML đơn giản (b, i, br, ul/li, table).
export const LESSONS = [
  {
    id: 'l1', icon: '🔤', title: 'Đọc phiên âm như thế nào',
    body: `
<p>IPA (International Phonetic Alphabet) là bảng ký hiệu ghi <b>âm</b>, không phải ghi <b>chữ</b>. Mỗi ký hiệu luôn chỉ đúng một âm, nên nhìn phiên âm là đọc được — kể cả từ mới chưa nghe bao giờ.</p>
<p><b>Vì sao cần?</b> Chữ tiếng Anh viết một đằng đọc một nẻo:</p>
<ul>
<li>Cùng chữ "c": <b>c</b>at /kæt/ — <b>c</b>ity /ˈsɪti/</li>
<li>Cùng âm /i/: s<b>ee</b>, <b>ea</b>t, p<b>eo</b>ple, m<b>e</b></li>
<li>Chữ không đọc: <b>k</b>now /noʊ/, <b>h</b>our /aʊɝ/</li>
</ul>
<p><b>Cách đọc một phiên âm</b> — ví dụ <span class="ipa">/ˈtitʃɝ/</span> (teacher):</p>
<ul>
<li>Dấu <b>/ /</b> chỉ là khung bao quanh, không đọc.</li>
<li>Dấu <b>ˈ</b> đứng TRƯỚC âm tiết được nhấn mạnh: <b>TEA</b>-cher.</li>
<li>Dấu <b>ˌ</b> là nhấn phụ, nhẹ hơn: /ˌjunəˈvɝsəti/ (university).</li>
<li>Đọc lần lượt từng ký hiệu: t – i – tʃ – ɝ.</li>
</ul>
<p><b>Mẹo:</b> trong app, chạm vào bất kỳ từ tiếng Anh nào để xem phiên âm, rồi bấm <b>🔤 Cách đọc</b> để tách từng âm và xem cách phát âm.</p>
<p class="muted small">App dùng phiên âm kiểu Anh–Mỹ. Từ điển Anh–Anh (Cambridge, Oxford) và slide của lớp có vài ký hiệu khác — xem bảng ở Bài 3.</p>`,
    sounds: [],
  },
  {
    id: 'l2', icon: '👄', title: 'Nguyên âm ngắn và dài',
    body: `
<p>Tiếng Anh có những cặp nguyên âm chỉ khác nhau ở độ dài và độ căng của miệng. Nói sai là đổi nghĩa:</p>
<table class="ipa-table"><tr><th>Dài, căng</th><th>Ngắn, lỏng</th></tr>
<tr><td>/i/ sh<b>ee</b>p (cừu)</td><td>/ɪ/ sh<b>i</b>p (tàu)</td></tr>
<tr><td>/u/ f<b>oo</b>l (kẻ ngốc)</td><td>/ʊ/ f<b>u</b>ll (no)</td></tr></table>
<p>Ba âm "a/e" dễ lẫn: /ɛ/ b<b>e</b>d — /æ/ b<b>a</b>d — /ʌ/ b<b>u</b>d. Và /ɑ/ h<b>o</b>t, /ɔ/ w<b>a</b>ter mở sâu, lưỡi lùi về sau.</p>
<p><b>Âm /ə/ (schwa)</b> là âm yếu, chỉ xuất hiện ở âm tiết không nhấn. <b>/ɝ/</b> là "ơ" có uốn lưỡi (bird, work).</p>
<p><b>Cách luyện:</b> bấm vào từng âm bên dưới, nghe từ ví dụ, nói theo; rồi luyện cặp âm ở mục 🎯 Luyện.</p>`,
    sounds: ['i', 'ɪ', 'ɛ', 'æ', 'ʌ', 'ɑ', 'ɔ', 'ʊ', 'u', 'ə', 'ɝ'],
  },
  {
    id: 'l3', icon: '🔁', title: 'Nguyên âm đôi và kiểu Anh – Mỹ',
    body: `
<p>Nguyên âm đôi là <b>hai âm trượt vào nhau</b> trong một nhịp. Người Việt hay dừng ở âm đầu: "go" thành "gô", "day" thành "đê". Phải trượt hết sang âm sau.</p>
<p><b>Nguyên âm + r (kiểu Mỹ):</b> near /nɪr/, hair /hɛr/, tour /tʊr/, car /kɑr/, more /mɔr/ — đọc nguyên âm rồi uốn lưỡi /r/.</p>
<p><b>Đối chiếu ký hiệu Anh–Mỹ (app) với Anh–Anh (Cambridge, Oxford, slide lớp):</b></p>
<table class="ipa-table"><tr><th>App (Mỹ)</th><th>Anh–Anh</th><th>Ví dụ</th></tr>
<tr><td>i</td><td>iː</td><td>see</td></tr>
<tr><td>u</td><td>uː</td><td>food</td></tr>
<tr><td>ɛ</td><td>e</td><td>bed</td></tr>
<tr><td>ɑ</td><td>ɑː / ɒ</td><td>father / hot</td></tr>
<tr><td>ɔ</td><td>ɔː</td><td>talk</td></tr>
<tr><td>ɝ</td><td>ɜː / ə</td><td>bird / teacher</td></tr>
<tr><td>oʊ</td><td>əʊ</td><td>go</td></tr>
<tr><td>ɪr</td><td>ɪə</td><td>near</td></tr>
<tr><td>ɛr</td><td>eə</td><td>hair</td></tr>
<tr><td>ʊr</td><td>ʊə</td><td>tour</td></tr></table>
<p class="muted small">Dấu ː nghĩa là kéo dài. Nói giọng Anh hay Mỹ đều được — quan trọng là rõ ràng và nhất quán.</p>`,
    sounds: ['eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'oʊ'],
  },
  {
    id: 'l4', icon: '🙂', title: 'Phụ âm gần giống tiếng Việt',
    body: `
<p>Phần lớn phụ âm tiếng Anh có âm gần giống trong tiếng Việt. Ba điểm cần nhớ:</p>
<ul>
<li><b>Bật hơi:</b> /p/ /t/ /k/ ở đầu từ bật hơi mạnh — để tờ giấy trước miệng, tờ giấy phải rung khi nói "pen", "ten", "cat".</li>
<li><b>Chữ ≠ âm tiếng Việt:</b> /d/ tiếng Anh là "đ" (không phải "d" miền Bắc), /j/ là "y" (yes), /z/ gần "d/gi" miền Bắc.</li>
<li><b>Âm cuối:</b> tiếng Việt chỉ có vài âm cuối (c, ch, m, n, ng, nh, p, t). Tiếng Anh có hầu hết phụ âm ở cuối: /s z v l dʒ tʃ/… Bỏ âm cuối là lỗi số 1 của người Việt (xem Bài 6).</li>
</ul>`,
    sounds: ['p', 'b', 't', 'd', 'k', 'ɡ', 'f', 'v', 's', 'z', 'h', 'm', 'n', 'ŋ', 'l', 'w', 'j'],
  },
  {
    id: 'l5', icon: '👅', title: 'Phụ âm khó với người Việt',
    body: `
<p>Tám âm này tiếng Việt không có hoặc khác nhiều. Luyện trước gương:</p>
<ul>
<li><b>/θ/ /ð/</b> — đầu lưỡi giữa hai hàm răng (think, this). Soi gương phải thấy lưỡi.</li>
<li><b>/ʃ/ /ʒ/ /tʃ/ /dʒ/</b> — môi chu tròn ra trước (she, measure, chair, job).</li>
<li><b>/r/</b> — cong lưỡi lên, không chạm vòm, không rung (red).</li>
</ul>
<p><b>Rung hay không rung?</b> Đặt tay lên cổ: /ð ʒ dʒ z v b d ɡ/ cổ rung; /θ ʃ tʃ s f p t k/ không rung. Mỗi cặp có cùng khẩu hình, chỉ khác rung.</p>`,
    sounds: ['θ', 'ð', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'r'],
  },
  {
    id: 'l6', icon: '🔚', title: 'Âm cuối, -s, -ed và nối âm',
    body: `
<p><b>Đuôi -s / -es</b> (số nhiều, ngôi thứ ba, sở hữu) có 3 cách đọc:</p>
<table class="ipa-table"><tr><th>Đọc</th><th>Khi từ kết thúc bằng</th><th>Ví dụ</th></tr>
<tr><td>/s/</td><td>âm không rung /p t k f θ/</td><td>stops, cats, books, laughs</td></tr>
<tr><td>/z/</td><td>âm rung và nguyên âm</td><td>dogs, days, friends, lives</td></tr>
<tr><td>/ɪz/</td><td>/s z ʃ ʒ tʃ dʒ/</td><td>buses, watches, changes</td></tr></table>
<p><b>Đuôi -ed</b> (quá khứ) cũng có 3 cách:</p>
<table class="ipa-table"><tr><th>Đọc</th><th>Khi từ kết thúc bằng</th><th>Ví dụ</th></tr>
<tr><td>/t/</td><td>âm không rung /p k f s ʃ tʃ/</td><td>stopped, worked, watched</td></tr>
<tr><td>/d/</td><td>âm rung và nguyên âm</td><td>played, lived, cleaned</td></tr>
<tr><td>/ɪd/</td><td>/t/ hoặc /d/</td><td>wanted, needed, visited</td></tr></table>
<p><b>Cụm phụ âm cuối</b> (asks /æsks/, texts /tɛksts/, months): đừng chèn thêm "ơ" ("text-sờ"). Luyện chậm từng âm rồi nhanh dần.</p>
<p><b>Nối âm:</b> phụ âm cuối nối sang nguyên âm đầu của từ sau: "check it out" → "che-ki-tout", "an apple" → "a-napple". Nói nối giúp câu nghe trôi chảy, tự nhiên hơn.</p>
<p class="muted small">Câu kể chuyện trong OPIc dùng rất nhiều động từ quá khứ -ed. Bỏ âm cuối thì người nghe dễ hiểu nhầm là bạn đang dùng thì hiện tại.</p>`,
    sounds: [],
  },
  {
    id: 'l7', icon: '📢', title: 'Trọng âm và âm yếu',
    body: `
<p>Tiếng Việt có <b>thanh điệu</b>; tiếng Anh có <b>trọng âm</b>: âm tiết được nhấn đọc to hơn, dài hơn, cao hơn; các âm tiết khác đọc nhẹ, thường thành /ə/.</p>
<ul>
<li><b>ba-NA-na</b> /bəˈnænə/ — hai chữ "a" không nhấn đều thành /ə/.</li>
<li><b>PHO-to</b> /ˈfoʊˌtoʊ/ → pho-<b>TO</b>-gra-phy /fəˈtɑɡrəfi/ → pho-to-<b>GRA</b>-phic: trọng âm đổi thì nguyên âm cũng đổi.</li>
</ul>
<p><b>Quy tắc gợi ý</b> (có ngoại lệ, luôn kiểm tra bằng dấu ˈ trong phiên âm):</p>
<ul>
<li>Danh từ, tính từ 2 âm tiết thường nhấn âm đầu: <b>TEA</b>cher, <b>HAP</b>py, <b>MO</b>ney.</li>
<li>Động từ 2 âm tiết thường nhấn âm sau: de<b>CIDE</b>, be<b>GIN</b>, en<b>JOY</b>.</li>
<li>Từ đuôi -tion, -sion, -ic, -ity: nhấn âm ngay trước đuôi: edu<b>CA</b>tion, eco<b>NO</b>mic, uni<b>VER</b>sity.</li>
<li>Danh từ ghép nhấn phần đầu: <b>BED</b>room, <b>BIRTH</b>day.</li>
</ul>
<p><b>Âm yếu trong câu:</b> các từ nhỏ (a, the, to, for, and, of, can) thường đọc yếu: "I want <b>to</b> go" → /tə/, "fish <b>and</b> chips" → /ən/. Nhấn vào từ mang nghĩa (danh từ, động từ chính, tính từ).</p>`,
    sounds: ['ə'],
  },
  {
    id: 'l8', icon: '🇻🇳', title: '10 lỗi hay gặp của người Việt',
    body: `
<ol>
<li><b>Bỏ âm cuối:</b> like → "lai", five → "phai", nice → "nai". → Kéo dài và nói rõ âm cuối khi luyện.</li>
<li><b>Thiếu -s, -ed:</b> "two book", "I work yesterday". → Xem Bài 6.</li>
<li><b>/θ ð/ thành "t, d, s, z":</b> think → "sink", this → "dít". → Thè lưỡi.</li>
<li><b>/ʃ/ thành /s/:</b> she → "si". → Chu môi.</li>
<li><b>/l/ – /n/ lẫn nhau</b> (giọng miền Bắc): light ↔ night.</li>
<li><b>/r/ thành "z" hoặc rung lưỡi:</b> rice → "dai". → Cong lưỡi, không chạm.</li>
<li><b>Không phân biệt dài – ngắn:</b> ship = sheep, full = fool.</li>
<li><b>/æ/ thành "e" hoặc "a":</b> bad → "bét".</li>
<li><b>Nguyên âm đôi bị cắt:</b> go → "gô", day → "đê", make → "mếch".</li>
<li><b>Trọng âm sai hoặc đọc đều từng âm tiết như tiếng Việt:</b> → Nghe và nhại lại nhịp (mục Nói theo trong Sổ kịch bản).</li>
</ol>
<p>Luyện các cặp âm dễ nhầm ở mục <b>🎯 Luyện</b>: nghe chọn từ đúng, rồi nói và để máy kiểm tra.</p>`,
    sounds: [],
  },
];

export const KIND_VI = { vowel: 'Nguyên âm đơn', diphthong: 'Nguyên âm đôi', consonant: 'Phụ âm' };
