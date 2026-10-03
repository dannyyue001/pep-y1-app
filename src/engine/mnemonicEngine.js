// mnemonicEngine.js — 通用记忆法引擎
// 为任意教材（沪教版 kb_shsb / 新概念一 kb_nce1 / 人教PEP kb）的词汇
// 生成"谐音 / 拆分 / 图像联想 / 词义联想"记忆法，风格对齐 memoryStack 的手工记忆法。
// 记忆法原则：一句话讲清，一年级孩子能复述。

import kb_pep from '../data/kb.js'
import kb_nce1 from '../data/kb_nce1.js'
import kb_shsb from '../data/kb_shsb.js'

const KBS = { pep: kb_pep, nce1: kb_nce1, shsb: kb_shsb }

// ---------- 1. 谐音记忆表 { word: [谐音词, 解释] } ----------
const HOMOPHONE = {
  hello: ['哈喽', '见面打招呼就是"哈喽"'],
  hi: ['嗨', '比 hello 更短的"嗨"，朋友间随意招呼'],
  name: ['内幕', '名字是最重要的"内幕"信息'],
  fine: ['饭', '身体"饭"好好，就是"好的、健康的"'],
  thank: ['三克', '"thank you"谐音"三克油"，感谢时伸三根手指'],
  goodbye: ['古德拜', '"good"+"bye"拼一起＝"古德拜"，挥手再见'],
  school: ['死抠', '上学要"死抠"知识，把每个字都抠明白'],
  excuse: ['一克死秋', '"excuse me"谐音"一克死秋丝密"，打扰别人前先说'],
  pardon: ['怕等', '没听清就说"pardon？"，让对方"怕你等"着再讲一遍'],
  very: ['哇瑞', '非常＝"哇，瑞"！很厉害的意思'],
  much: ['骂吃', '吃太多＝"骂吃"太多，就是"很多"'],
  umbrella: ['俺不热了', '撑开雨伞"俺不热了"，遮阳挡雨'],
  ticket: ['提克特', '门票＝"提克特"，上车前掏出来'],
  number: ['难伯', '"number"谐音"难伯"，数字很难，伯伯帮忙数'],
  five: ['发五', '五指张开"发"出去，就是数字5'],
  sorry: ['骚瑞', '道歉要说"sorry"＝"骚瑞"，对不起'],
  suit: ['素特', '西装＝"素特"，素色的特别西装'],
  student: ['思丢邓', '学生＝"思丢邓"，"思"考不丢分（邓）'],
  nice: ['奈斯', '"nice"谐音"奈斯"，很棒、很高兴'],
  meet: ['密特', '见面"meet"＝"密特"，密友特意见面'],
  make: ['梅克', '"make"谐音"梅克"，梅花可以做成梅子酱'],
  swedish: ['斯威迪须', '瑞典人＝"斯威迪须"，说话带"斯"'],
  english: ['英格利须', '英语＝"英格利须"，英国人说的语言'],
  american: ['饿妹离肯', '美国人＝"饿妹离肯"，妹妹饿了啃面包'],
  italian: ['一他离人', '意大利人＝"一他离人"，一个人在意大利'],
  nationality: ['难哪里提', '问"哪"里来＝国籍，谐音"难哪里提"'],
  keyboard: ['key+board', 'key(键)+board(板)＝按键的板子＝键盘'],
  operator: ['哦呸瑞特', '操作员＝"哦呸瑞特"，操作机器的人'],
  engineer: ['en金尼耳', '工程师＝"en金尼耳"，工程师要懂"金"属'],
  policeman: ['police+man', 'police(警察)+man(人)＝警察'],
  today: ['特得', '"today"谐音"特得"，今天过得特别得意'],
  well: ['歪欧', '好＝"well"，喊"歪欧"表示很好'],
  thanks: ['三克斯', '"thanks"谐音"三克斯"，感谢'],
  shirt: ['舍特', '衬衫＝"舍特"，衬衫是"舍"不得丢的特别衣服'],
  perhaps: ['怕胡思', '"perhaps"谐音"怕胡思"，也许＝"怕胡思乱想"'],
  white: ['歪特', '白色＝"歪特"，白雪歪歪地飘'],
  blue: ['布噜', '蓝色＝"布噜"，大海"布噜布噜"冒泡'],
  catch: ['开吃', '"catch"谐音"开吃"，接住球就"开吃"庆祝'],
  colour: ['卡乐', '颜色＝"colour"谐音"卡乐"，卡片上的颜色很欢乐'],
  green: ['格润', '绿色＝"格润"，草坪绿得湿润'],
  smart: ['斯马特', '聪明＝"smart"谐音"斯马特"，斯文又聪明'],
  hat: ['海特', '帽子＝"hat"谐音"海特"，海边戴的特制帽'],
  same: ['塞姆', '一样＝"same"谐音"塞姆"，塞满同样的东西'],
  face: ['肥丝', '脸＝"face"谐音"肥丝"，脸上的肉像肥肉丝'],
  eye: ['爱', '眼睛＝"eye"谐音"爱"，用眼睛看所爱'],
  nose: ['诺子', '鼻子＝"nose"谐音"诺子"，鼻子上有"诺"字'],
  mouth: ['貌死', '嘴巴＝"mouth"谐音"貌死"，嘴巴管着容貌'],
  ear: ['伊尔', '耳朵＝"ear"谐音"伊尔"，听见"伊"的声音'],
  sing: ['辛', '唱歌＝"sing"谐音"辛"，唱歌让人开心'],
  dance: ['当斯', '跳舞＝"dance"谐音"当斯"，跟着节拍"当斯"'],
  read: ['瑞德', '读书＝"read"谐音"瑞德"，读瑞德的故事'],
  draw: ['做', '画画＝"draw"谐音"做"，动手画出作品'],
  father: ['发得', '爸爸＝"father"谐音"发得"，爸爸头发发得多'],
  mother: ['妈得', '妈妈＝"mother"谐音"妈得"，妈妈=妈'],
  brother: ['布啦泽', '兄弟＝"brother"谐音"布啦泽"，兄弟布啦一声'],
  sister: ['西斯特', '姐妹＝"sister"谐音"西斯特"，姐妹穿西服'],
  friend: ['福润德', '朋友＝"friend"谐音"福润德"，有福同享的朋友'],
  tall: ['掏', '高＝"tall"谐音"掏"，高高地掏东西'],
  short: ['绍特', '矮＝"short"谐音"绍特"，绍特个子小'],
  thin: ['森', '瘦＝"thin"谐音"森"，瘦得像一根"森"木'],
  fat: ['肥特', '胖＝"fat"谐音"肥特"，肥肥的特胖'],
  look: ['卢克', '看＝"look"谐音"卢克"，看卢克的眼神'],
  one: ['万', '一＝"one"谐音"万"，"万"事开头第一'],
  two: ['兔', '二＝"two"谐音"兔"，小兔蹦两下'],
  three: ['思瑞', '三＝"three"谐音"思瑞"，三根手指'],
  four: ['佛', '四＝"four"谐音"佛"，四尊佛'],
  six: ['思科斯', '六＝"six"谐音"思科斯"，六根棒棒糖'],
  many: ['卖你', '许多＝"many"谐音"卖你"，好东西卖你许多'],
  count: ['康特', '数数＝"count"谐音"康特"，数着"康特"'],
  red: ['瑞德', '红色＝"red"谐音"瑞德"，瑞德的红领巾'],
  yellow: ['耶楼', '黄色＝"yellow"谐音"耶楼"，耶，黄色的楼'],
  black: ['布拉克', '黑色＝"black"谐音"布拉克"，布莱克的黑色书包'],
  kite: ['凯特', '风筝＝"kite"谐音"凯特"，凯特放风筝'],
  cake: ['开克', '蛋糕＝"cake"谐音"开克"，切开蛋糕'],
  pizza: ['皮萨', '披萨＝"pizza"谐音"皮萨"，皮萨饼'],
  hamburger: ['汉堡格', '汉堡＝"hamburger"谐音"汉堡格"，汉堡+格子纸'],
  pie: ['派', '派＝"pie"谐音"派"，苹果派'],
  apple: ['爱普', '苹果＝"apple"谐音"爱普"，爱吃的苹果'],
  orange: ['奥润橘', '橙子＝"orange"谐音"奥润橘"，橙色的橘子'],
  peach: ['皮吃', '桃子＝"peach"谐音"皮吃"，桃子带皮吃'],
  pear: ['佩儿', '梨＝"pear"谐音"佩儿"，佩儿吃梨'],
  like: ['赖克', '喜欢＝"like"谐音"赖克"，喜欢就赖着'],
  eat: ['一特', '吃＝"eat"谐音"一特"，一口气吃特别多'],
  tiger: ['泰戈', '老虎＝"tiger"谐音"泰戈"，泰戈老虎'],
  panda: ['潘达', '熊猫＝"panda"谐音"潘达"，潘达熊猫'],
  bear: ['比尔', '熊＝"bear"谐音"比尔"，比尔熊'],
  monkey: ['忙key', '猴子＝"monkey"谐音"忙key"，猴子忙找钥匙'],
  duck: ['达克', '鸭子＝"duck"谐音"达克"，达克鸭'],
  pig: ['皮格', '猪＝"pig"谐音"皮格"，皮格猪'],
  chick: ['吃克', '小鸡＝"chick"谐音"吃克"，小鸡吃米'],
  cow: ['靠', '牛＝"cow"谐音"靠"，牛靠在树边'],
  see: ['西', '看见＝"see"谐音"西"，看见西方的太阳'],
  is: ['一丝', '是＝"is"谐音"一丝"，一丝"是"的线索'],
  me: ['咪', '我＝"me"谐音"咪"，"咪"就是我自己'],
  my: ['买', '我的＝"my"谐音"买"，我的东西自己买'],
  you: ['优', '你＝"you"谐音"优"，你很优秀'],
  we: ['威', '我们＝"we"谐音"威"，我们威风'],
  he: ['黑', '他＝"he"谐音"黑"，他穿黑衣服'],
  she: ['希', '她＝"she"谐音"希"，她是希希'],
  this: ['迪斯', '这个＝"this"谐音"迪斯"，这个迪士尼'],
  that: ['呆特', '那个＝"that"谐音"呆特"，那个呆呆的特'],
  at: ['爱特', '在＝"at"谐音"爱特"，在@符号处'],
  can: ['看', '能＝"can"谐音"看"，我能看得见'],
  do: ['杜', '做＝"do"谐音"杜"，杜老师做示范'],
  what: ['沃特', '什么＝"what"谐音"沃特"，"沃特"是什么'],
  who: ['胡', '谁＝"who"谐音"胡"，谁叫小胡'],
  here: ['黑耳', '这里＝"here"谐音"黑耳"，这里有一只黑耳朵'],
  it: ['伊特', '它＝"it"谐音"伊特"，伊特是它'],
  oh: ['哦', '哦＝"oh"，就是"哦"的一声'],
  classmate: ['class+mate', 'class(班级)+mate(伙伴)＝同班伙伴＝同学'],
  goodbye2: ['古德拜', '"good"+"bye"＝"古德拜"，再见'],
  morning: ['默宁', '早晨很安静（默）、阳光明媚（宁），就是"默宁"'],
  how: ['好', '"how"谐音"好"，问"how"就是问"好不好/怎么样"'],
  rubber: ['擦擦擦', '橡皮就是"擦擦擦"的小帮手'],
  give: ['给', '"give"谐音"给"，give就是把手上的东西"给"出去'],
  please: ['普利斯', '请求时说"please"＝"普利斯"，请人帮忙'],
  touch: ['踏七', '"touch"谐音"踏七"，用手"踏"上去触摸'],
  sir: ['瑟', '"sir"谐音"瑟"，先生"sir"彬彬有礼'],
  mr: ['密斯特', '"Mr"＝"密斯特"，先生（Mr）叫密斯特'],
  mrs: ['密色斯', '"Mrs"＝"密色斯"，太太（Mrs）'],
  miss: ['蜜丝', '"miss"谐音"蜜丝"，小姐/女士（Miss）甜甜的像蜜丝'],
  new: ['牛', '"new"谐音"牛"，新的东西都很"牛"'],
  i: ['爱', '大写 I 像人站得笔直，字母 I 永远大写——"我"要抬头挺胸'],
  am: ['爱母', '"I am"＝"爱母"，我是固定搭配用 I am'],
  are: ['啊', '"you are"＝"优啊"，你是用 you are'],
  clean: ['克林', '"clean"谐音"克林"，干净＝克林'],
  dirty: ['得题', '"dirty"谐音"得题"，脏衣服要"得题"（洗）'],
  whose: ['胡斯', '"whose"谐音"胡斯"，"whose"问"谁的"'],
  come: ['卡姆', '"come"谐音"卡姆"，"come"＝过来'],
  evening: ['伊芙宁', '傍晚＝"伊芙宁"，伊芙在宁静的傍晚散步'],
  your: ['优儿', '"your"谐音"优儿"，"你的"东西都很"优"'],
  schoolbag: ['school+bag', 'school(学校)+bag(包)＝上学背的包＝书包'],
  pencil_case: ['铅笔盒', 'pencil(铅笔)+case(盒子)＝装铅笔的盒子＝铅笔盒'],
  on_duty: ['on+duty', 'on(在)+duty(值班)＝在值日岗位上＝值日'],
  blackboard2: ['black+board', 'black(黑)+board(板)＝黑色的板＝黑板'],
  fly_away: ['fly+away', 'fly(飞)+away(离开)＝飞走＝飞离'],
  come_back: ['come+back', 'come(来)+back(回)＝回来'],
  flap_wings: ['flap+wings', 'flap(拍打)+wings(翅膀)＝拍打翅膀'],
  tie_shoelaces: ['tie+shoelaces', 'tie(系)+shoelaces(鞋带)＝系鞋带'],
  take_a_photo: ['take+a+photo', 'take(拍/拿)+photo(照片)＝拍照'],
  helpful: ['help+ful', 'help(帮助)+ful(充满……的)＝充满帮助的＝有益的'],
  animal: ['安妮莫', '动物＝"安妮莫"，小动物们是安妮的伙伴'],
  horse: ['浩思', '马＝"horse"谐音"浩思"，骏马奔跑带风声（浩）'],
  dog: ['道格', '狗＝"dog"谐音"道格"，小狗叫道格'],
  hen: ['亨', '母鸡＝"hen"谐音"亨"，母鸡"咯咯"哼（亨）唱'],
  bee: ['比', '蜜蜂＝"bee"谐音"比"，蜜蜂"嗡嗡"比较忙'],
  cat: ['凯特', '猫＝"cat"谐音"凯特"，小猫叫凯特'],
  hill: ['嘿', '山丘＝"hill"谐音"嘿"，小山上的人挥手说"嘿"'],
  high: ['嗨', '高＝"high"谐音"嗨"，跳到高高的地方说"嗨"'],
  try: ['揣', '尝试＝"try"谐音"揣"，揣着试一试的心态'],
  hooray: ['呼瑞', '欢呼＝"hooray"谐音"呼瑞"，"呼"一声"瑞"起来'],
  wash: ['沃西', '洗＝"wash"谐音"沃西"，把东西洗得"沃"亮'],
  find: ['饭的', '找到＝"find"谐音"饭的"，找到的就是"饭的"（属于自己的饭）'],
  spoon: ['思普', '勺子＝"spoon"谐音"思普"，用勺子舀（思普）汤'],
  skip: ['思磕', '跳绳＝"skip"谐音"思磕"，跳绳脚"磕"地'],
  play: ['普雷', '玩＝"play"谐音"普雷"，小朋友"普雷"一起玩'],
  fun: ['饭', '有趣＝"fun"谐音"饭"，好玩得像吃大餐（饭）'],
  warm: ['沃姆', '温暖＝"warm"谐音"沃姆"，窝（沃）里暖暖的'],
  happy: ['嗨皮', '幸福＝"happy"谐音"嗨皮"，开心得"嗨"起来'],
  love: ['拉夫', '爱＝"love"谐音"拉夫"，拉拉手（拉）就是爱'],
  class: ['克拉斯', '班级＝"class"谐音"克拉斯"，全班同学都"克拉斯"'],
  desk: ['戴斯克', '书桌＝"desk"谐音"戴斯克"，书桌上放戴斯克的文具'],
  door: ['到', '门＝"door"谐音"到"，敲门"咚咚"（door）到'],
  chair: ['切儿', '椅子＝"chair"谐音"切儿"，搬椅子"切儿"一声'],
  floor: ['佛楼', '地板＝"floor"谐音"佛楼"，地板是"佛"教的楼'],
  mum: ['妈', '妈妈＝"mum"，就是"妈"'],
  dad: ['爹', '爸爸＝"dad"，就是"爹"'],
  brother2: ['布啦泽', '兄弟＝"brother"谐音"布啦泽"，兄弟布啦一声'],
  sister2: ['西斯特', '姐妹＝"sister"谐音"西斯特"，姐妹穿西服'],
  round: ['软得', '圆＝"round"谐音"软得"，圆的东西摸起来软软的'],
  soft: ['索夫特', '软＝"soft"谐音"索夫特"，柔软的沙发（索夫）'],
}

// ---------- 2. 合成词拆分表 { word: [前缀义, 后缀义] } ----------
const SPLIT = {
  classmate: ['class', 'mate'],
  classroom: ['class', 'room'],
  policeman: ['police', 'man'],
  policewoman: ['police', 'woman'],
  taxi_driver: ['taxi', 'driver'],
  air_hostess: ['air', 'hostess'],
  postman: ['post', 'man'],
  milkman: ['milk', 'man'],
  hairdresser: ['hair', 'dresser'],
  housewife: ['house', 'wife'],
  workman: ['work', 'man'],
  grandfather: ['grand', 'father'],
  grandmother: ['grand', 'mother'],
  bookcase: ['book', 'case'],
  football: ['foot', 'ball'],
  basketball: ['basket', 'ball'],
  rainbow: ['rain', 'bow'],
  sunflower: ['sun', 'flower'],
  snowman: ['snow', 'man'],
  bedroom: ['bed', 'room'],
  bathroom: ['bath', 'room'],
  kitchen: ['kitchen', ''],
  weekday: ['week', 'day'],
  weekend: ['week', 'end'],
  homework: ['home', 'work'],
  class: ['', ''],
  blackboard: ['black', 'board'],
  policeman2: ['police', 'man'],
  afternoon: ['after', 'noon'],
  handbag: ['hand', 'bag'],
  cloakroom: ['cloak', 'room'],
  schoolbag: ['school', 'bag'],
  pencilcase: ['pencil', 'case'],
  blackboard3: ['black', 'board'],
  flyaway: ['fly', 'away'],
  comeback: ['come', 'back'],
  flapwings: ['flap', 'wings'],
  tieshoelaces: ['tie', 'shoelaces'],
  takeaphoto: ['take', 'photo'],
  afternoon2: ['after', 'noon'],
  classroom2: ['class', 'room'],
}

// ---------- 3. 图像/字母联想表 { word: 记忆法 } ----------
const IMAGE = {
  good: 'g 像竖起的大拇指，good 就是"棒"',
  book: '两个 o 像书的两个"眼睛"，书是用来看的',
  pencil: 'pen(笔)+cil：铅笔是用笔芯写的笔',
  ruler: 'rule(规则)+r：尺子量东西讲"规则"',
  eraser: 'er(擦)+ase：橡皮是"擦擦擦"的小帮手',
  teacher: 'teach(教)+er(人)＝教书的人＝老师',
  student: 'study(学习)变来的：认真学习的人就是 student',
  house: '房子=h，屋顶像一个 h',
  cake2: '蛋糕圆圆的像字母 c',
  schoolbag: 'school(学校)+bag(包)：上学背的包＝书包',
  pencilcase: 'pencil(铅笔)+case(盒子)：装铅笔的盒子',
  blackboard: 'black(黑)+board(板)：黑色的板＝黑板',
  flyaway: 'fly(飞)+away(离开)：飞走＝飞离',
  comeback: 'come(来)+back(回)：回来',
  flapwings: 'flap(拍打)+wings(翅膀)：拍打翅膀',
  tieshoelaces: 'tie(系)+shoelaces(鞋带)：系鞋带',
  takeaphoto: 'take(拍)+photo(照片)：拍照',
  family: 'family=father+mother+I+love+you：family里藏着"爸爸妈妈我爱你"',
  wash: 'w像水波纹，洗东西要用水',
  spoon: '勺子的柄像一个s',
  flag: 'f像一面飘动的旗子',
  whistle: 'wh像吹哨子的嘴型',
  key: 'k像一把钥匙',
  duck: 'duck的小鸭子嘎嘎叫',
}

// ---------- 词根义（用于拆分时解释） ----------
const ROOT_CN = {
  class: '班级', room: '房间', mate: '伙伴', police: '警察', man: '男人',
  woman: '女人', taxi: '出租车', driver: '司机', air: '空中', hostess: '服务员',
  post: '邮局', milk: '牛奶', hair: '头发', dresser: '打理发型的人', house: '房子',
  wife: '妻子', work: '工作', grand: '祖辈', father: '爸爸', mother: '妈妈',
  bed: '床', bath: '洗澡', snow: '雪', sun: '太阳', flower: '花',
  rain: '雨', bow: '彩虹的弧', foot: '脚', ball: '球', basket: '篮',
  week: '周', day: '天', end: '末尾', home: '家', black: '黑', board: '板',
  after: '之后', noon: '中午', hand: '手', bag: '包', cloak: '斗篷/大衣',
}

// ---------- 生成记忆法 ----------
export function generateMnemonic(word, cn) {
  const w = String(word || '').toLowerCase().trim()
  if (!w) return `记住「${cn || word}」的意思，多读几遍就会啦。`

  // 1) 精确谐音
  const h = HOMOPHONE[w]
  if (h) return `谐音"${h[0]}"，${h[1]}。`

  // 2) 合成词拆分
  const parts = SPLIT[w]
  if (parts && parts[0] && parts[1]) {
    const a = ROOT_CN[parts[0]] || parts[0]
    const b = ROOT_CN[parts[1]] || parts[1]
    return `${parts[0]}(${a}) + ${parts[1]}(${b}) = ${a}+${b}，合起来就是「${cn || w}」。`
  }

  // 3) 图像联想
  const img = IMAGE[w]
  if (img) return img + '。'

  // 4) 多字母词的字母联想（取首字母）
  if (w.length >= 5) {
    const ch = w[0].toUpperCase()
    return `以字母 ${ch} 开头，${cn || w} 这个词跟 ${ch} 绑在一起记。`
  }

  // 5) 兜底：词义联想
  return `把「${cn || w}」记成脑海里的一幅画：${cn || w}是什么样子，就记住那个样子。`
}

// ---------- 从知识库构建记忆栈单元 ----------
// 返回 [{ unitId, unitNo, unitName, topic, words:[{word,cn,phonetic,example,exampleCn,mnemonic}] }]
export function buildMemoryUnits(bookKey = 'shsb') {
  const kb = KBS[bookKey] || kb_shsb
  if (!kb || !kb.units) return []
  return kb.units.map((u) => {
    const vocab = (kb.vocabulary || []).filter((v) => v.kp_id.startsWith(u.unit_id + '_'))
    return {
      unitId: u.unit_id,
      unitNo: u.unit_no,
      unitName: u.name_en,
      nameCn: u.name_cn,
      topic: u.topic,
      words: vocab.map((v) => ({
        word: v.word,
        cn: v.cn,
        phonetic: v.phonetic,
        mnemonic: generateMnemonic(v.word, v.cn),
        example: v.example_en,
        exampleCn: v.example_cn,
      })),
    }
  })
}

// 教材显示名
export const BOOK_LABEL = { pep: '人教PEP', nce1: '新概念一', shsb: '沪教版' }
