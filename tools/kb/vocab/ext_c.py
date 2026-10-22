"""Từ vựng mở rộng (AI viết mới, 2026-10-22) — 8 chủ đề mới theo danh sách đề OPIc của lớp:
ăn uống, mua sắm, sức khỏe, thời tiết & môi trường, vấn đề xã hội & tin tức,
gia đình & miêu tả người, giao thông, nhà máy & kiểm tra chất lượng.

Mỗi dòng: English | Tiếng Việt | Câu ví dụ | Ghi chú (không bắt buộc)
"""

CHUNKS = [
    dict(topic="food", sources=["SRC-0207", "SRC-0208"], text="""
street-food stall | quán vỉa hè | There's a famous street-food stall near my office.
local dish | món địa phương | Bun cha is a local dish from Hanoi.
signature dish | món đặc trưng của quán | Their signature dish is grilled fish.
order | gọi món | We ordered too much food.
take-out / takeaway | đồ mang đi | I usually get take-out on busy days.
food delivery app | ứng dụng giao đồ ăn | I order lunch through a food delivery app.
spicy | cay | I can't eat very spicy food.
savory | mặn, đậm vị | I prefer savory snacks to sweet ones.
sweet and sour | chua ngọt | Sweet and sour soup is my favorite.
fresh ingredients | nguyên liệu tươi | They only use fresh ingredients.
portion | khẩu phần | The portions are huge for the price.
The service was slow. | Phục vụ chậm. | The food was good, but the service was slow.
The staff were friendly. | Nhân viên thân thiện. | The staff were friendly and helpful.
book a table | đặt bàn | We booked a table for six.
all-you-can-eat buffet | buffet ăn thả ga | We went to an all-you-can-eat buffet for my birthday.
hot pot | lẩu | Hot pot is perfect for cold evenings.
grilled / stir-fried / steamed | nướng / xào / hấp | I like grilled meat and steamed vegetables.
home-cooked meal | bữa cơm nhà nấu | Nothing beats a home-cooked meal.
skip breakfast | bỏ bữa sáng | I sometimes skip breakfast when I'm in a hurry.
grab a coffee | đi uống nhanh ly cà phê | Let's grab a coffee after work.
iced milk coffee | cà phê sữa đá | I drink an iced milk coffee every morning.
bubble tea | trà sữa trân châu | Bubble tea is really popular with teenagers.
split the bill | chia tiền | We usually split the bill.
treat someone | mời, khao ai | I treated my team to lunch after the project.
leftovers | đồ ăn thừa | I take leftovers to work for lunch.
cook from scratch | nấu từ đầu (không dùng đồ làm sẵn) | My mom cooks everything from scratch.
"""),
    dict(topic="shopping", sources=["SRC-0207", "SRC-0208"], text="""
window shopping | ngắm đồ (không mua) | We went window shopping at the mall.
shop around | tham khảo nhiều nơi | I shop around before buying anything expensive.
compare prices | so sánh giá | I compare prices online first.
bargain / haggle | mặc cả | You can haggle at traditional markets.
a good bargain | món hời | The jacket was a good bargain.
impulse buy | mua theo cảm hứng | That blender was an impulse buy.
It fits perfectly. | Vừa khít. | I tried on the shoes, and they fit perfectly.
It's too tight / too loose. | Chật quá / rộng quá. | The shirt was too tight, so I exchanged it.
brand | thương hiệu | I don't care much about brands.
second-hand | đồ cũ | I bought a second-hand bike.
discount code | mã giảm giá | I used a discount code and saved twenty percent.
free shipping | miễn phí vận chuyển | Orders over 300,000 dong get free shipping.
cash on delivery | trả tiền khi nhận hàng | I usually choose cash on delivery.
add to cart | thêm vào giỏ | I add things to my cart and forget about them.
warranty | bảo hành | The phone comes with a one-year warranty.
best-seller | sản phẩm bán chạy | This model is the store's best-seller.
casual clothes | quần áo thường ngày | I wear casual clothes on weekends.
formal wear | trang phục trang trọng | I need formal wear for my friend's wedding.
dress code | quy định trang phục | Our office has a strict dress code.
keep up with fashion trends | theo kịp xu hướng thời trang | I don't really keep up with fashion trends.
outfit | bộ đồ | I wore my favorite outfit to the party.
comfortable shoes | giày thoải mái | I always choose comfortable shoes over stylish ones.
"""),
    dict(topic="health", sources=["SRC-0207", "SRC-0208"], text="""
get enough sleep | ngủ đủ giấc | I try to get enough sleep, but it's hard.
stay hydrated | uống đủ nước | I keep a water bottle on my desk to stay hydrated.
balanced diet | chế độ ăn cân bằng | A balanced diet is important for kids.
go to the gym | đi tập gym | I go to the gym three times a week.
personal trainer | huấn luyện viên cá nhân | My personal trainer pushes me hard.
get in shape | lấy lại vóc dáng | I want to get in shape before summer.
back pain | đau lưng | Sitting all day gives me back pain.
sore throat | đau họng | I had a sore throat after the concert.
run a fever | bị sốt | My son ran a fever last night.
take medicine | uống thuốc | I took some medicine and went to bed early.
prescription | đơn thuốc | The doctor gave me a prescription.
health insurance | bảo hiểm y tế | Our company provides health insurance.
mental health | sức khỏe tinh thần | People talk more about mental health now.
meditation | thiền | Meditation helps me calm down.
yoga | yoga | My wife does yoga every morning.
cool down | thả lỏng sau khi tập | Don't forget to cool down after running.
sit for long hours | ngồi lâu nhiều giờ | People who sit for long hours should stretch often.
posture | tư thế | My posture got worse after years of desk work.
a sedentary lifestyle | lối sống ít vận động | A sedentary lifestyle can cause many health problems.
build muscle | tăng cơ | I lift weights to build muscle.
"""),
    dict(topic="weather", sources=["SRC-0207", "SRC-0208"], text="""
four distinct seasons | bốn mùa rõ rệt | The north of Vietnam has four distinct seasons.
dry season / rainy season | mùa khô / mùa mưa | The south only has a dry season and a rainy season.
sunny / cloudy | nắng / nhiều mây | It was sunny in the morning but cloudy later.
drizzle | mưa phùn | In spring, Hanoi has a lot of drizzle.
downpour | mưa như trút | We got caught in a sudden downpour.
flood | lũ lụt; ngập | The streets flooded after the storm.
heatwave | đợt nắng nóng | During the heatwave, it was over 40 degrees.
scorching hot | nóng như thiêu | It's scorching hot in June.
freezing cold | lạnh cóng | It was freezing cold on the mountain.
foggy | có sương mù | It was too foggy to see the road.
thunder and lightning | sấm sét | I couldn't sleep because of the thunder and lightning.
unpredictable weather | thời tiết thất thường | The weather has become so unpredictable.
climate change | biến đổi khí hậu | Climate change is affecting farmers.
global warming | nóng lên toàn cầu | Global warming is making summers hotter.
air quality | chất lượng không khí | I check the air quality app before jogging.
smog | khói bụi | On bad days, the city is covered in smog.
plant trees | trồng cây | Our company plants trees every year.
save energy | tiết kiệm năng lượng | I turn off the lights to save energy.
single-use plastic | nhựa dùng một lần | Many shops are reducing single-use plastic.
reusable bag | túi dùng nhiều lần | I bring a reusable bag to the supermarket.
"""),
    dict(topic="issues", sources=["SRC-0003", "SRC-0206"], text="""
People are worried that ... | Mọi người lo rằng... | People are worried that housing prices will keep rising.
It's becoming a serious problem. | Nó đang trở thành vấn đề nghiêm trọng. | Traffic jams are becoming a serious problem in big cities.
There are several reasons for this. | Có vài lý do cho việc này. | There are several reasons for this. First, the population is growing.
This has led to ... | Điều này dẫn đến... | This has led to more people moving to the suburbs.
I read an article about ... | Tôi đọc một bài báo về... | I read an article about how AI is changing jobs. | Mở đầu dạng câu tin tức (news).
According to the news, ... | Theo tin tức thì... | According to the news, the new metro line will open next year.
It was all over the news. | Tin đó tràn ngập mặt báo. | The flood was all over the news last month.
It caused a lot of debate. | Nó gây nhiều tranh luận. | The new traffic rule caused a lot of debate.
People had mixed reactions. | Mọi người phản ứng trái chiều. | People had mixed reactions to the price increase.
Some people think ..., while others believe ... | Một số người nghĩ..., trong khi số khác lại cho rằng... | Some people think online learning is better, while others believe it's isolating.
I think the solution is ... | Tôi nghĩ giải pháp là... | I think the solution is better public transportation.
In the long run, ... | Về lâu dài | In the long run, it will save a lot of money.
It's easier said than done. | Nói thì dễ, làm mới khó. | Everyone wants to reduce waste, but it's easier said than done.
Something needs to be done about ... | Cần phải làm gì đó với... | Something needs to be done about air pollution.
The government has introduced ... | Chính phủ đã đưa ra... | The government has introduced stricter rules on drunk driving.
cost of living | chi phí sinh hoạt | The cost of living in Hanoi has gone up a lot.
housing prices | giá nhà đất | Housing prices are too high for young couples.
aging population | dân số già hóa | An aging population is a challenge for many countries.
traffic congestion | ùn tắc giao thông | Traffic congestion wastes hours every day.
privacy concerns | lo ngại về quyền riêng tư | Smart devices raise privacy concerns.
food safety | an toàn thực phẩm | Food safety is a big concern for parents.
unemployment | thất nghiệp | Automation could increase unemployment in some industries.
do my part | góp phần của mình | I try to do my part by recycling.
there's still a long way to go | vẫn còn chặng đường dài | Things are improving, but there's still a long way to go.
"""),
    dict(topic="people", sources=["SRC-0207"], text="""
outgoing | hướng ngoại, cởi mở | My sister is very outgoing and makes friends easily.
easy-going | dễ tính | My dad is easy-going and rarely gets angry.
reliable | đáng tin cậy | My best friend is really reliable.
hard-working | chăm chỉ | My mom is the most hard-working person I know.
thoughtful | chu đáo | He's thoughtful and always remembers birthdays.
generous | hào phóng | My uncle is generous with his time.
patient | kiên nhẫn | My teacher was very patient with us.
shy | nhút nhát | I was shy when I was a kid.
talkative | nói nhiều | My daughter is really talkative.
take after | giống (bố/mẹ) | I take after my father; we both love fishing.
look up to | ngưỡng mộ, noi theo | I've always looked up to my older brother.
childhood friend | bạn từ nhỏ | We've been childhood friends for twenty years.
close friend | bạn thân | I only have a few close friends.
extended family | đại gia đình (họ hàng) | My extended family gets together during Tet.
only child | con một | I'm an only child, so I was a bit spoiled.
the eldest / the youngest | con cả / con út | I'm the eldest of three kids.
get married | kết hôn | We got married five years ago.
raise a family | nuôi dạy gia đình | It's expensive to raise a family in the city.
We have a lot in common. | Chúng tôi có nhiều điểm chung. | We have a lot in common, like music and food.
We see each other ... | Chúng tôi gặp nhau... | We see each other at least once a month.
He's the kind of person who ... | Anh ấy là kiểu người... | He's the kind of person who always helps others.
"""),
    dict(topic="transport", sources=["SRC-0207", "SRC-0208"], text="""
take the bus | đi xe buýt | I take the bus to work when it rains.
book a ride | đặt xe (qua ứng dụng) | I booked a ride because I was running late.
bike lane | làn xe đạp | There aren't many bike lanes in my city.
metro line | tuyến đường sắt đô thị | The new metro line saves me a lot of time.
crowded bus | xe buýt đông người | The bus is always crowded in the morning.
get stuck in traffic | bị kẹt xe | I got stuck in traffic for an hour.
It takes about ... minutes. | Mất khoảng... phút. | It takes about thirty minutes to get to work.
door to door | từ cửa nhà đến nơi | It's forty minutes door to door.
on foot | đi bộ | My school was close enough to go on foot.
driver's license | bằng lái xe | I got my driver's license last year.
wear a helmet | đội mũ bảo hiểm | Everyone has to wear a helmet on a motorbike.
traffic rules | luật giao thông | Some people don't follow traffic rules.
car accident | tai nạn ô tô | I saw a car accident on the highway.
flat tire | xịt lốp | We got a flat tire in the middle of nowhere.
gas station | trạm xăng | We stopped at a gas station to fill up.
fill up the tank | đổ đầy bình xăng | I fill up the tank every week.
public transportation is improving | giao thông công cộng đang tốt lên | Public transportation is improving, but it's still not enough.
"""),
    dict(topic="factory", sources=["SRC-0207"], text="""
production line | dây chuyền sản xuất | I work next to the production line.
quality control | kiểm soát chất lượng | I work in quality control.
outgoing quality control (OQC) | kiểm tra chất lượng xuất hàng | Our OQC team checks products before shipment.
inspect products | kiểm tra sản phẩm | We inspect products before they leave the factory.
defect | lỗi, khuyết tật | We found a small defect on the surface.
defective product | sản phẩm lỗi | Defective products are sent back for repair.
defect rate | tỷ lệ lỗi | Our goal is to keep the defect rate as low as possible.
sampling inspection | kiểm tra lấy mẫu | We do a sampling inspection for each batch.
batch / lot | lô hàng | Each lot is checked before shipping.
meet the standards | đạt tiêu chuẩn | Every product has to meet the standards.
specification | thông số kỹ thuật | We check each part against the specification.
visual inspection | kiểm tra ngoại quan | Visual inspection takes a lot of concentration.
packaging | đóng gói | We also check the packaging and labels.
shipment | lô xuất hàng | The shipment was delayed by one day.
customer complaint | khiếu nại của khách hàng | We take every customer complaint seriously.
find the root cause | tìm nguyên nhân gốc | We worked late to find the root cause.
corrective action | hành động khắc phục | We took corrective action right away.
prevent it from happening again | ngăn tái diễn | We changed the process to prevent it from happening again.
protective equipment | đồ bảo hộ | We wear protective equipment on the floor.
rotating shifts | ca luân phiên | We work rotating shifts.
meet production targets | đạt chỉ tiêu sản xuất | It's stressful to meet production targets every day.
improve the process | cải tiến quy trình | Our team suggested ways to improve the process.
fast-paced environment | môi trường làm việc nhịp độ nhanh | It's a fast-paced environment, but I like it. | Khi nói về công việc, chỉ nói chung chung; đừng nêu thông tin nội bộ.
"""),
]
