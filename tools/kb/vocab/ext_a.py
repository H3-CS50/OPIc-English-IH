"""Từ vựng mở rộng (AI viết mới, 2026-10-22) — nhóm chức năng: từ nối, câu đệm, mẫu câu,
kể chuyện, so sánh, cảm xúc, role-play.

Mỗi dòng: English | Tiếng Việt | Câu ví dụ | Ghi chú (không bắt buộc)
Câu ví dụ do AI viết mới; nguồn ghi ở từng nhóm là nơi đối chiếu chức năng/cách dùng.
"""

CHUNKS = [
    dict(topic="discourse", sources=["SRC-0201", "SRC-0202"], text="""
That reminds me, ... | À, nhắc mới nhớ... | That reminds me, I also went to that park last winter. | Dùng để nối sang một ý liên quan vừa nhớ ra.
Now, as for ... | Còn về... thì | Now, as for my neighbors, they're really friendly.
You see, ... | Chuyện là... (đưa thông tin người nghe chưa biết) | You see, I'd never driven on a mountain road before.
You know, ... | Bạn biết đấy (điều ai cũng biết) | You know, Hanoi gets really cold in January. | Đừng lặp lại quá nhiều, nghe như từ đệm.
I suppose ... | Tôi cho là... | I suppose it's because people are busier now.
I guess ... | Tôi đoán là... | I guess I just like quiet places.
Right, so ... | Rồi, vậy thì... (chốt ý, sang ý mới) | Right, so that's my house. Now let me tell you about my room.
What's more, ... | Hơn nữa | What's more, the rent is quite reasonable.
All the same, ... | Dù vậy | It was expensive. All the same, I don't regret it.
As I mentioned earlier, ... | Như tôi đã nói ở trên | As I mentioned earlier, I live with my parents. | Hợp khi câu sau trong combo hỏi lại cùng chủ đề.
Something immediately comes to mind. | Có một chuyện hiện ra ngay trong đầu. | Oh, something immediately comes to mind: my first trip to Da Lat.
Apart from that, ... | Ngoài ra | Apart from that, there's a small market right next to my building.
not to mention ... | chưa kể đến... | The food was great, not to mention the view.
To begin with, ... | Trước hết | To begin with, my apartment is pretty small.
The first thing that comes to mind is ... | Điều đầu tiên tôi nghĩ đến là... | The first thing that comes to mind is the smell of street food.
Another thing is that ... | Một điều nữa là... | Another thing is that the park is open until late at night.
Last but not least, ... | Cuối cùng nhưng không kém phần quan trọng | Last but not least, the staff there are really kind.
On the whole, ... | Nhìn chung | On the whole, I'm happy with where I live.
Having said that, ... | Dù nói vậy | It's noisy. Having said that, it's very convenient.
That being said, ... | Tuy vậy | That being said, I wouldn't move anywhere else.
Still, ... | Dù vậy vẫn | It rained all day. Still, we had a great time.
but at the same time ... | nhưng đồng thời... | I love the city, but at the same time it can be exhausting.
As a matter of fact, ... | Thực tế là (nhấn mạnh) | As a matter of fact, I went there just last week.
Simply put, ... | Nói đơn giản thì | Simply put, it saves me a lot of time.
In short, ... | Tóm lại | In short, it was the best trip I've ever had.
So that's how ... | Thế là... (kết lại câu chuyện) | So that's how I started running every morning.
which means ... | điều đó có nghĩa là... | The bus comes every ten minutes, which means I never have to wait long.
Then again, ... | Nhưng nghĩ lại thì | Then again, the subway is much faster than the bus.
"""),
    dict(topic="fillers", sources=["SRC-0206", "SRC-0003"], text="""
I've forgotten the word for it, but it's ... | Tôi quên mất từ đó, nhưng nó là... | I've forgotten the word for it, but it's the machine you use to cut grass. | Cách "diễn đạt vòng" khi bí từ — tốt hơn im lặng.
It's a kind of ... | Nó là một loại... | It's a kind of soup with rice noodles and beef.
It's something you use to ... | Đó là thứ dùng để... | It's something you use to keep rice warm.
It's like a ..., but ... | Nó giống..., nhưng... | It's like a pancake, but it's crispy and filled with shrimp.
I'm not sure what it's called in English, but ... | Tôi không chắc tiếng Anh gọi là gì, nhưng... | I'm not sure what it's called in English, but it's a sweet dessert made from beans.
In Vietnamese we call it ..., which is basically ... | Tiếng Việt gọi là..., về cơ bản là... | In Vietnamese we call it "che", which is basically a sweet soup.
Let me think for a second. | Để tôi nghĩ một chút. | Let me think for a second. I'd say the last time was in May.
That's an interesting question. | Câu hỏi thú vị đấy. | That's an interesting question. I've never compared the two before.
Off the top of my head, ... | Nghĩ nhanh thì... | Off the top of my head, I'd say about three times a month.
Sorry, where was I? | Xin lỗi, tôi đang nói đến đâu nhỉ? | Sorry, where was I? Oh right, the hotel.
Let me go back a little. | Để tôi quay lại một chút. | Let me go back a little. Before that, we had lunch in town.
Sorry, let me rephrase that. | Xin lỗi, để tôi nói lại. | It was on Monday. Sorry, let me rephrase that, it was on Tuesday. | Tự sửa lỗi tự nhiên, không cần xin lỗi nhiều.
..., or rather ... | ..., hay đúng hơn là... | We left on Saturday, or rather, very early Sunday morning.
I don't really have a ..., but I can tell you about ... | Tôi không thật sự có..., nhưng có thể kể về... | I don't really have a favorite beach, but I can tell you about the one I visited last summer. | Dùng khi câu hỏi không hợp với bạn — vẫn trả lời, không bỏ trống.
I've never ..., but if I did, I would ... | Tôi chưa từng..., nhưng nếu có thì sẽ... | I've never been to a bar alone, but if I did, I'd probably sit at the counter.
It's hard to put into words. | Khó diễn tả thành lời. | The view was amazing. It's hard to put into words.
something like that | đại loại vậy | We stayed for three or four days, something like that.
and stuff like that | và mấy thứ kiểu vậy | I buy snacks, drinks and stuff like that. | Thân mật; dùng vừa phải.
Give me a second. | Cho tôi một giây. | Give me a second. Okay, I remember now.
"""),
    dict(topic="al", sources=["SRC-0206", "SRC-0003"], text="""
The way I see it, ... | Theo cách tôi nhìn nhận... | The way I see it, living in the city has more pros than cons.
One thing I've noticed is that ... | Một điều tôi để ý là... | One thing I've noticed is that young people rarely watch TV anymore.
It might be because ... | Có thể là vì... | It might be because people have less free time these days. | Phỏng đoán lý do (speculating).
It seems like ... | Có vẻ như... | It seems like everyone is ordering food online now.
Chances are ... | Nhiều khả năng là... | Chances are I'll stay home this weekend.
There's nothing better than ...ing | Không gì tuyệt hơn... | There's nothing better than a cold drink after a long walk.
It's worth ...ing | Đáng để... | It's worth visiting if you like history.
Even if ..., I'd still ... | Kể cả nếu..., tôi vẫn... | Even if it rains, I'd still go for a walk.
whether ... or not | dù... hay không | Whether I'm busy or not, I call my parents every Sunday.
I'm used to ...ing | Tôi quen với việc... | I'm used to waking up early because of my job.
I'm getting used to ...ing | Tôi đang dần quen với việc... | I'm getting used to living on my own.
It took me ... to ... | Tôi mất... để... | It took me two years to save enough money for the trip.
It's the first time I've ever ... | Đây là lần đầu tiên tôi... | It's the first time I've ever tried scuba diving.
If everything goes well, I'll ... | Nếu mọi việc suôn sẻ, tôi sẽ... | If everything goes well, I'll move to a bigger apartment next year. | Mở rộng sang khung thời gian tương lai.
I'm hoping to ... | Tôi đang mong là sẽ... | I'm hoping to visit Japan in the spring.
What surprised me the most was ... | Điều làm tôi bất ngờ nhất là... | What surprised me the most was how clean the streets were.
The good thing about ... is ..., but the downside is ... | Cái hay của... là..., nhưng mặt trái là... | The good thing about my job is the salary, but the downside is the long hours.
It's not as ... as people think. | Nó không... như mọi người nghĩ. | Hiking isn't as hard as people think.
There's a saying in Vietnam that ... | Ở Việt Nam có câu... | There's a saying in Vietnam that "food comes first".
I'd describe it as ... | Tôi sẽ miêu tả nó là... | I'd describe it as cozy rather than luxurious.
Let me walk you through ... | Để tôi kể lần lượt... | Let me walk you through a typical day at work.
I'd like to add that ... | Tôi muốn nói thêm rằng... | I'd like to add that the place is very safe at night.
"""),
    dict(topic="story", sources=["SRC-0203", "SRC-0003"], text="""
It was a ... day, and I was ...ing when ... | Hôm đó trời..., tôi đang... thì... | It was a rainy Sunday, and I was cooking lunch when the power went out. | Quá khứ tiếp diễn làm bối cảnh, quá khứ đơn cho việc xảy ra chen ngang.
We had been ...ing for ... when ... | Chúng tôi đã... được... thì... | We had been driving for three hours when the car started making a strange noise. | Quá khứ hoàn thành tiếp diễn: việc kéo dài trước một mốc quá khứ.
I had never ... before, so ... | Trước đó tôi chưa từng..., nên... | I had never been on a plane before, so I was really nervous.
Before I knew it, ... | Chưa kịp nhận ra thì... | Before I knew it, it was already midnight.
The next thing I knew, ... | Rồi bỗng nhiên tôi thấy... | The next thing I knew, I was lying on the ground.
Just as ..., ... | Đúng lúc... thì... | Just as we were about to leave, it started pouring.
A couple of hours later, ... | Vài tiếng sau | A couple of hours later, the mechanic finally arrived.
The following day, ... | Ngày hôm sau | The following day, we took a boat to the island.
Later that night, ... | Tối hôm đó | Later that night, we sat by the fire and talked for hours.
By then, ... | Đến lúc đó thì | By then, most of the shops had already closed.
At that moment, ... | Ngay lúc đó | At that moment, I realized I had left my wallet at home.
It wasn't until ... that I realized ... | Mãi đến khi... tôi mới nhận ra... | It wasn't until I got home that I realized my phone was missing.
Apparently, ... | Hóa ra là / Nghe nói là | Apparently, the road had been closed because of a landslide.
I had no choice but to ... | Tôi không còn cách nào khác ngoài... | I had no choice but to walk back to the hotel.
Fortunately, a stranger ... | May mắn là có người lạ... | Fortunately, a stranger offered to help us push the car.
Thanks to ..., we managed to ... | Nhờ..., chúng tôi đã xoay xở được... | Thanks to a local guide, we managed to find the right bus.
Everything worked out in the end. | Cuối cùng mọi chuyện đều ổn. | It was stressful, but everything worked out in the end.
It was a close call. | Suýt nữa thì toi. | We almost missed the last train. It was a close call.
I'll never do that again. | Tôi sẽ không bao giờ làm vậy nữa. | I went hiking without water once. I'll never do that again.
From that day on, ... | Từ hôm đó trở đi | From that day on, I always check the weather before a trip.
The lesson I learned was ... | Bài học tôi rút ra là... | The lesson I learned was to always have a backup plan.
So that's what happened. | Chuyện là như vậy đó. | So that's what happened on my first day at work.
"""),
    dict(topic="compare", sources=["SRC-0206", "SRC-0209", "SRC-0003"], text="""
Back when I was in high school, ..., whereas now ... | Hồi tôi học cấp ba..., còn bây giờ... | Back when I was in high school, we used paper maps, whereas now everyone uses their phone.
In contrast, ... | Ngược lại | My hometown is quiet. In contrast, Hanoi never sleeps.
Unlike ..., ... | Không giống như... | Unlike my parents, I prefer shopping online.
Both ... and ... | Cả... lẫn... | Both parks have a lake and a walking path.
Neither ... nor ... | Không... cũng không... | Neither of them is cheap, to be honest.
The main similarity is that ... | Điểm giống nhau chính là... | The main similarity is that both are popular with young people.
... has changed a lot since ... became popular. | ... đã thay đổi nhiều từ khi... phổ biến. | Shopping has changed a lot since delivery apps became popular.
a big shift towards ... | sự chuyển dịch lớn sang... | There's been a big shift towards working from home.
It's much easier to ... than it used to be. | Giờ... dễ hơn nhiều so với trước. | It's much easier to book a hotel than it used to be.
People don't ... as much as they used to. | Mọi người không còn... nhiều như trước. | People don't write letters as much as they used to.
There used to be ..., but now there's ... | Trước đây có..., giờ thì có... | There used to be a rice field here, but now there's a shopping mall.
These days you can ..., which was impossible before. | Bây giờ có thể..., điều trước đây không thể. | These days you can pay with your phone, which was impossible before.
If I compare the two, ... | Nếu so sánh hai cái thì... | If I compare the two, the old one was simpler but more reliable.
twice as ... as ... | gấp đôi... | Rent here is twice as expensive as in my hometown.
The gap between ... and ... is getting bigger. | Khoảng cách giữa... và... ngày càng lớn. | The gap between city life and village life is getting bigger.
In some ways ..., but in other ways ... | Ở mặt này..., nhưng ở mặt khác... | In some ways life is easier now, but in other ways it's more stressful.
I'd choose ... over ... because ... | Tôi chọn... hơn... vì... | I'd choose a small café over a big chain because it feels more personal.
Compared with ten years ago, ... | So với mười năm trước | Compared with ten years ago, the air is much more polluted.
"""),
    dict(topic="feel", sources=["SRC-0209", "SRC-0207"], text="""
I was thrilled. | Tôi vui sướng tột độ. | I was thrilled when I got the job offer.
I was a bit let down. | Tôi hơi thất vọng. | The hotel looked great online, so I was a bit let down when I saw the room.
I was caught off guard. | Tôi bị bất ngờ, không kịp trở tay. | The question was so unexpected that I was caught off guard.
I was really anxious. | Tôi rất lo lắng. | I was really anxious before my first presentation.
I felt at peace. | Tôi thấy lòng bình yên. | Sitting by the lake, I felt completely at peace.
I was deeply moved. | Tôi rất xúc động. | I was deeply moved by my father's speech at the wedding.
I was scared to death. | Tôi sợ chết khiếp. | When the plane started shaking, I was scared to death.
I was proud of myself. | Tôi tự hào về bản thân. | I finished the half marathon, and I was really proud of myself.
I felt homesick. | Tôi thấy nhớ nhà. | During my first month abroad, I felt so homesick.
I was confused. | Tôi bối rối. | The signs were only in Japanese, so I was totally confused.
I was grateful for ... | Tôi biết ơn vì... | I was grateful for the help from the hotel staff.
I had mixed feelings. | Tôi có cảm xúc lẫn lộn. | I had mixed feelings about leaving my old job.
It was a dream come true. | Đó là giấc mơ thành hiện thực. | Seeing snow for the first time was a dream come true.
It was way better than I expected. | Tốt hơn tôi nghĩ rất nhiều. | The street food was way better than I expected.
It didn't live up to my expectations. | Nó không được như tôi kỳ vọng. | The movie was hyped a lot, but it didn't live up to my expectations.
It was nothing special. | Chẳng có gì đặc biệt. | The restaurant was okay, but nothing special.
It was hilarious. | Buồn cười cực kỳ. | My friend's story was hilarious.
It was a bit awkward. | Hơi ngượng. | I forgot his name, so it was a bit awkward.
I never get tired of it. | Tôi không bao giờ chán nó. | I've seen that movie ten times, and I never get tired of it.
I'm a huge ... lover. | Tôi cực kỳ mê... | I'm a huge coffee lover, so I visit cafés all the time.
It gets on my nerves. | Nó làm tôi bực mình. | The noise from the construction site really gets on my nerves.
It's such a hassle. | Thật là phiền phức. | Finding a parking spot downtown is such a hassle.
It was eye-opening. | Thật mở mang tầm mắt. | Visiting a village in the mountains was really eye-opening.
It was nerve-racking. | Thật căng thẳng, hồi hộp. | Waiting for the test results was nerve-racking.
"""),
    dict(topic="roleplay", sources=["SRC-0209", "SRC-0003"], text="""
Can I get a confirmation message? | Cho tôi xin tin nhắn xác nhận được không? | Great, can I get a confirmation message for the booking?
Do I need an appointment, or can I just drop in? | Tôi cần đặt hẹn hay cứ ghé qua là được? | Do I need an appointment, or can I just drop in after work?
What does that include? | Giá đó gồm những gì? | It's 500,000 dong? What does that include?
Is it okay if I reschedule for ...? | Tôi dời lịch sang... được không? | Is it okay if I reschedule for next Friday?
The thing is, ... I don't think I can come that day. | Chuyện là..., tôi e là hôm đó tôi không đến được. | The thing is, I have a business trip. I don't think I can come that day.
I recently bought ..., but I have a problem with it. | Tôi mới mua..., nhưng gặp vấn đề. | I recently bought a laptop from your store, but I have a problem with it.
There seems to be a misunderstanding. | Hình như có sự hiểu lầm. | There seems to be a misunderstanding. I booked a double room, not a single.
I can wait if it's not too long. | Tôi có thể đợi nếu không quá lâu. | I can wait if it's not too long. How long will it take?
How long will it take? | Mất bao lâu? | How long will it take to fix the screen?
Could you send someone to fix it? | Có thể cử người đến sửa không? | The air conditioner isn't working. Could you send someone to fix it?
Would it be possible to get a partial refund? | Có thể hoàn lại một phần tiền không? | Would it be possible to get a partial refund for the damaged part?
Could I get store credit instead? | Cho tôi phiếu mua hàng thay vì tiền được không? | If a refund isn't possible, could I get store credit instead?
Hi, it's ... I'm calling about ... | Chào, tôi là... Tôi gọi về việc... | Hi, it's Minh. I'm calling about the tickets I bought yesterday. | Mở đầu khi để lại lời nhắn.
Please call me back at ... | Vui lòng gọi lại cho tôi theo số... | Please call me back at this number when you get this message.
Here are a couple of options. | Có một vài phương án. | Here are a couple of options. First, we could go on Sunday instead.
If neither of those works, ... | Nếu cả hai cách đều không được thì... | If neither of those works, I'd like my money back.
How about we meet halfway? | Hay mình gặp nhau ở giữa đường? | How about we meet halfway, at the coffee shop near the station?
What's the earliest available time? | Giờ trống sớm nhất là khi nào? | What's the earliest available time on Saturday?
Are there any seats left? | Còn chỗ không? | Are there any seats left for the 7 o'clock show?
Do you have this in a different size? | Có cỡ khác không? | I like this shirt. Do you have this in a different size?
Could I speak to the manager, please? | Cho tôi nói chuyện với quản lý được không? | I've explained this twice. Could I speak to the manager, please?
Ava, I heard that you ... I have a few questions. | Ava, tôi nghe nói bạn... Tôi có vài câu hỏi. | Ava, I heard that you just moved. I have a few questions about your new place. | Mở đầu dạng câu "hỏi Ava 3–4 câu".
How often do you ...? | Bạn... bao lâu một lần? | How often do you go to the gym?
What do you like most about ...? | Bạn thích nhất điều gì ở...? | What do you like most about your new neighborhood?
Who do you usually ... with? | Bạn thường... với ai? | Who do you usually go hiking with?
"""),
]
