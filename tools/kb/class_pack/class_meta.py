"""Phân loại 258 câu hỏi của lớp (do người dùng tự soạn) — dạng câu và chủ đề.

Thứ tự trùng với class_questions_src.json. Mã dạng câu:
D description · R routine · P preference_opinion · PR past_recent · PF past_first · M memorable_experience
X problem_experience · CC comparison_change · C2 comparison_two · RA roleplay_ask · RV roleplay_ask_ava
RP roleplay_problem · RE roleplay_experience · I issue_concern · N news_report
"""

CODES = {
    "D": "description", "R": "routine", "P": "preference_opinion", "PR": "past_recent", "PF": "past_first",
    "M": "memorable_experience", "X": "problem_experience", "CC": "comparison_change", "C2": "comparison_two",
    "RA": "roleplay_ask", "RV": "roleplay_ask_ava", "RP": "roleplay_problem", "RE": "roleplay_experience",
    "I": "issue_concern", "N": "news_report",
}

TYPES = (
    "D R PR D R CC D R PR X X R "          # 0–11  Work, Housing
    "P PR M D "                            # 12–15 Movies
    "P R PF M "                            # 16–19 Music
    "D R PR PF M "                         # 20–24 Parks
    "R PR PF "                             # 25–27 Walking
    "D R M M "                             # 28–31 Beaches
    "D R M PF "                            # 32–35 Domestic trips
    "D PF M D PF "                         # 36–40 Overseas trips
    "D PR M "                              # 41–43 Vacations at home
    "D M R M "                             # 44–47 Bars
    "D PR PR M "                           # 48–51 Restaurants
    "D R M PF "                            # 52–55 Coffee shops
    "D PR M D "                            # 56–59 Gatherings
    "D R M PR "                            # 60–63 Food
    "CC D CC CC "                          # 64–67 Health
    "D PF M PF "                           # 68–71 Geography
    "D R CC X "                            # 72–75 Furniture
    "D R PF M "                            # 76–79 Internet
    "P R R PR "                            # 80–83 Phones
    "D R CC X "                            # 84–87 Technology
    "D PF M PR "                           # 88–91 Shopping
    "D P CC PR "                           # 92–95 Fashion
    "D D X CC "                            # 96–99 Weather
    "D R CC X "                            # 100–103 Transportation
    "D R PF X "                            # 104–107 Appointment
    "D PF PR D "                           # 108–111 Holidays
    "D R CC X "                            # 112–115 Banks
    "RA RP RE RA RP RE RA RP RE RA RP RE RA RP RE RA RP RE RA RP RE RA RP RE RA RP RE RA RP RE "  # 116–145
    "RV RV RV RV RV RV "                   # 146–151 Questioning
    "PF M PF X "                           # 152–155 Housing (childhood)
    "CC N I D CC "                         # 156–160 Housing combo-2
    "PR CC I "                             # 161–163 Movies
    "C2 I "                                # 164–165 Music
    "C2 I C2 "                             # 166–168 Parks
    "CC I CC I "                           # 169–172 Trips
    "CC N "                                # 173–174 Bars
    "CC C2 CC I I CC D "                   # 175–181 Restaurants
    "CC I C2 I "                           # 182–185 Gatherings
    "CC N "                                # 186–187 Food
    "C2 N CC "                             # 188–190 Health
    "CC D N CC N "                         # 191–195 Geography
    "D R M PF CC N "                       # 196–201 Recycling
    "I C2 CC I "                           # 202–205 Internet, Phones
    "CC I "                                # 206–207 Shopping
    "D CC PR D "                           # 208–211 Free time
    "I "                                   # 212 Holidays
    "D PR M PR C2 I "                      # 213–218 Family & Friends
    "D R M PR "                            # 219–222 Hotels
    "R PF D N CC CC "                      # 223–228 Newspapers
    "P R CC PF "                           # 229–232 Television
    "D D D D N CC "                        # 233–238 Industry
    "R R M X "                             # 239–242 Text messages
    "D PR PF "                             # 243–245 ID cards
    "RA RP RE RA RP RE RA RP RE RA RP RE"  # 246–257 Role-plays
).split()

# Chủ đề trong tài liệu lớp → key trong taxonomy (combo thường).
TOPIC_MAP = {
    "Work": "work", "Housing": "housing", "Movies": "movies", "Music": "music", "Parks": "parks", "Walking": "walking",
    "Beaches": "beach", "Domestic trips": "domestic_trips", "Overseas trips": "overseas_trips", "Vacations at home": "vacation_home",
    "Bars": "bars", "Restaurants": "restaurants", "Coffee shops": "coffee_shops", "Gatherings": "gatherings", "Food": "food",
    "Health": "health", "Geography": "geography", "Furniture": "furniture", "Internet": "internet", "Phones": "phones",
    "Technology": "technology", "Shopping": "shopping", "Fashion": "fashion", "Weather": "weather", "Transportation": "transportation",
    "Appointment": "appointments", "Holidays": "holidays", "Banks": "banks", "Recycling": "recycling", "Free time": "free_time",
    "Family & Friends": "family_friends", "Hotels": "hotels", "Newspapers": "newspapers", "Television": "television",
    "Industry": "industry", "Text messages": "text_messages", "Identification cards": "id_cards",
}
# Chủ đề role-play trong tài liệu lớp → key taxonomy.
RP_TOPIC_MAP = {
    "Clothing stores": "rp_clothing", "Shopping": "rp_shopping", "Food stores": "rp_food_store", "Trips": "rp_travel",
    "Geography": "rp_geography", "Hotels": "rp_hotel", "Weather": "rp_weather", "Business trips": "rp_business_trip",
    "Furniture": "rp_furniture", "Housing": "rp_housing", "Questioning": "rp_ask_ava", "Store sale": "rp_store_sale",
    "Train": "rp_train", "Phone": "rp_phone_store", "Movies": "rp_cinema",
}

PERSONA_VI = ("Nhân vật mẫu: khoảng 30 tuổi, làm kiểm tra chất lượng ở một nhà máy điện tử, sống ở căn hộ cùng vợ và con gái 5 tuổi. "
              "Hãy thay bằng chi tiết thật của bạn.")
