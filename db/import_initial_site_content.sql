DO $$
DECLARE
  payload jsonb := $json${
  "hero": {
    "eyebrow": "LANDSCAPE PHOTOGRAPHY",
    "title": "Light, Silence, and Distance.",
    "description": "Where stillness carries the shape of motion",
    "scrollLabel": "Scroll",
    "imageSrc": "/uploads/photos%2F1776696848237-mmexport1684750562658.jpg",
    "imageAlt": "Dramatic mountain landscape with sweeping clouds at golden hour"
  },
  "about": {
    "eyebrow": "About Me",
    "title": "Seeking the quietest moments of the landscape",
    "portraitImageSrc": "",
    "portraitImageAlt": "Portrait photo of Shawn",
    "paragraphs": [
      "我专注于山地、海岸、荒野与夜景创作，以大画幅般的秩序感与留白控制，让每一张作品都像展墙上的独立叙事。",
      "网站当前以展示为主，后续可无缝扩展博客、作品管理、访客留言、商业合作表单与会员系统，并接入 Neon 与 Cloudflare R2 形成完整内容架构。"
    ]
  },
  "contact": {
    "eyebrow": "Contact",
    "title": "Available for brand collaborations, licensing, and custom prints.",
    "email": "hello@example.com"
  },
  "blog": {
    "eyebrow": "Blog",
    "title": "Journal & Notes"
  },
  "socialLinks": [
    { "id": "instagram", "label": "Instagram", "platform": "instagram", "href": "#", "enabled": true },
    { "id": "tiktok", "label": "TikTok", "platform": "tiktok", "href": "#", "enabled": true },
    { "id": "facebook", "label": "Facebook", "platform": "facebook", "href": "#", "enabled": true },
    { "id": "youtube", "label": "YouTube", "platform": "youtube", "href": "#", "enabled": true },
    { "id": "bilibili", "label": "Bilibili", "platform": "bilibili", "href": "#", "enabled": false },
    { "id": "xiaohongshu", "label": "Xiaohongshu", "platform": "xiaohongshu", "href": "#", "enabled": false },
    { "id": "behance", "label": "Behance", "platform": "behance", "href": "#", "enabled": false },
    { "id": "500px", "label": "500px", "platform": "500px", "href": "#", "enabled": false },
    { "id": "email", "label": "Email", "platform": "email", "href": "mailto:hello@example.com", "enabled": true }
  ],
  "blogPosts": [
    { "id": "1", "category": "Field Notes", "title": "暴风雪前的蓝调窗口", "excerpt": "记录在高海拔等待天气裂开的一小时，以及如何判断山脊上最后一束可用侧光。" },
    { "id": "2", "category": "Gear", "title": "长曝与海岸线构图方法", "excerpt": "关于 ND 镜、快门时长、前景节奏，以及如何避免“平滑海面”变成没有信息量的空白。" },
    { "id": "3", "category": "Travel", "title": "冰岛冬季路线初稿", "excerpt": "从追光路线、天气窗口到住宿密度，整理一套更适合摄影师而不是游客的行程逻辑。" }
  ],
  "photos": [
    { "id": "2", "title": "Meili Snow Mountain", "src": "/uploads/uploads%2Foriginal%2F1776713450873-dsc_6595-1-low.jpg", "width": 1080, "height": 608, "category": "mountains", "alt": "", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776713450873-dsc_6595-1-low.jpg.webp", "description": "Mianzimu Peak rises above the clouds in Deqin, Yunnan, before sunrise.", "specifications": "" },
    { "id": "4", "title": "Edge of Water", "src": "/uploads/uploads%2Foriginal%2F1776714058083-du0_4152-1-low.jpg", "width": 1080, "height": 608, "category": "sea_lakes", "alt": "Fjord illuminated by golden hour light", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776714058083-du0_4152-1-low.jpg.webp", "description": "Waves roll toward the shore at Bondi Beach in Sydney on a warm winter afternoon.", "specifications": "" },
    { "id": "1776714154155", "title": "Across the River", "src": "/uploads/uploads%2Foriginal%2F1776714188203-du0_7959-low.jpg", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776714188203-du0_7959-low.jpg.webp", "width": 1080, "height": 608, "category": "city", "alt": "", "description": "The Brisbane skyline is seen from Kangaroo Point during blue hour.", "specifications": "" },
    { "id": "1776712893406", "title": "The Three Pagodas", "src": "/uploads/uploads%2Foriginal%2F1776712899872-dsc_5823-l.jpg", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776712899872-dsc_5823-l.jpg.webp", "width": 1080, "height": 649, "category": "sea_lakes", "alt": "", "description": "The Three Pagodas of Chongsheng Temple stand beside a calm lake in Dali, Yunnan, in spring. ", "specifications": "" },
    { "id": "5", "title": "Cradle Mountain", "src": "/uploads/uploads%2Foriginal%2F1776714144259-dsc_2611-low.jpg", "width": 1080, "height": 608, "category": "mountains", "alt": "Wind-shaped desert sand dunes at dusk", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776714144259-dsc_2611-low.jpg.webp", "description": "Cradle Mountain rises under a moving summer sky in Tasmania.", "specifications": "" },
    { "id": "1776714154480", "title": "Falling Light", "src": "/uploads/uploads%2Foriginal%2F1776715002578-dsc_7153hdr-low.jpg", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776715002578-dsc_7153hdr-low.jpg.webp", "width": 1080, "height": 570, "category": "city", "alt": "", "description": "Brisbane’s central skyline stands beside the river at dusk.", "specifications": "" },
    { "id": "7", "title": "Sunset in Redcliffe", "src": "/uploads/uploads%2Foriginal%2F1776714079030-du0_5688-low.jpg", "width": 1080, "height": 608, "category": "sea_lakes", "alt": "Glacier and high mountain peaks in clear air", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776714079030-du0_5688-low.jpg.webp", "description": "A sunset seascape at Redcliffe near Brisbane, photographed in early spring in the southern hemisphere.", "specifications": "" },
    { "id": "9", "title": "A Waiting Chair", "src": "/uploads/uploads%2Foriginal%2F1776714093818-dsc_2241-low.jpg", "width": 1080, "height": 605, "category": "forest", "alt": "Ancient forest with soft morning mist weaving through trees", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776714093818-dsc_2241-low.jpg.webp", "description": "A single chair sits among metasequoia trees by Nanhu Lake in Wuhan in winter.", "specifications": "" },
    { "id": "1776714150531", "title": "Baroque Nocturne", "src": "/uploads/uploads%2Foriginal%2F1776714167520-du0_2090s-low.jpg", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776714167520-du0_2090s-low.jpg.webp", "width": 1080, "height": 608, "category": "city", "alt": "", "description": "The Frauenkirche and Augustus Bridge along the river in Dresden after sunset.", "specifications": "" },
    { "id": "8", "title": "The Milky Way", "src": "/uploads/uploads%2Foriginal%2F1776714132731--_-1-low.jpg", "width": 1080, "height": 608, "category": "nightscape", "alt": "", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776714132731--_-1-low.jpg.webp", "description": "The Milky Way stretches across the night sky above Lake Moogerah near Brisbane.", "specifications": "" },
    { "id": "6", "title": "Broken Reflection", "src": "/uploads/uploads%2Foriginal%2F1776714114252-dsc_5898-low.jpg", "width": 1080, "height": 628, "category": "sea_lakes", "alt": "", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776714114252-dsc_5898-low.jpg.webp", "description": "Yulong Snow Mountain appears in the lake near Lijiang before sunrise.", "specifications": "" },
    { "id": "1776714153752", "title": "Christmas Market", "src": "/uploads/uploads%2Foriginal%2F1776714174448-du0_2597-low.jpg", "thumbnailSrc": "/uploads/uploads%2Fthumb%2F1776714174448-du0_2597-low.jpg.webp", "width": 1080, "height": 608, "category": "city", "alt": "", "description": "The Striezelmarkt fills Altmarkt Square in Dresden during blue hour in winter.", "specifications": "" }
  ],
  "sectionVisibility": {
    "hero": true,
    "portfolio": true,
    "blog": true,
    "contact": true
  }
}
$json$::jsonb;
BEGIN
  INSERT INTO site_content (
    id,
    hero,
    about,
    contact,
    blog,
    portfolio,
    social_links,
    blog_posts,
    section_visibility,
    updated_at
  )
  VALUES (
    1,
    payload->'hero',
    payload->'about',
    payload->'contact',
    payload->'blog',
    COALESCE(payload->'portfolio', '{}'::jsonb),
    COALESCE(payload->'socialLinks', '[]'::jsonb),
    COALESCE(payload->'blogPosts', '[]'::jsonb),
    COALESCE(payload->'sectionVisibility', '{}'::jsonb),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    hero = EXCLUDED.hero,
    about = EXCLUDED.about,
    contact = EXCLUDED.contact,
    blog = EXCLUDED.blog,
    portfolio = EXCLUDED.portfolio,
    social_links = EXCLUDED.social_links,
    blog_posts = EXCLUDED.blog_posts,
    section_visibility = EXCLUDED.section_visibility,
    updated_at = NOW();

  DELETE FROM site_photos;

  INSERT INTO site_photos (
    id,
    title,
    src,
    thumbnail_src,
    width,
    height,
    category,
    alt,
    description,
    specifications,
    position,
    updated_at
  )
  SELECT
    COALESCE(photo->>'id', gen_random_uuid()::text),
    COALESCE(photo->>'title', ''),
    COALESCE(photo->>'src', ''),
    COALESCE(photo->>'thumbnailSrc', photo->>'src', ''),
    COALESCE((photo->>'width')::integer, 0),
    COALESCE((photo->>'height')::integer, 0),
    COALESCE(photo->>'category', 'mountains'),
    COALESCE(photo->>'alt', ''),
    COALESCE(photo->>'description', ''),
    COALESCE(photo->>'specifications', ''),
    ordinality - 1,
    NOW()
  FROM jsonb_array_elements(COALESCE(payload->'photos', '[]'::jsonb)) WITH ORDINALITY AS p(photo, ordinality)
  ORDER BY ordinality ASC;
END $$;
