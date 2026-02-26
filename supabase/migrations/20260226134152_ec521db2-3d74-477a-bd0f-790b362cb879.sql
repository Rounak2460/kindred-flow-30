
-- Create Manish Janu as an auth user first, then profile
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'manish.janu@iimb.ac.in',
  crypt('placeholder_not_for_login', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Profile will be auto-created by handle_new_user trigger, but let's update it
UPDATE public.profiles SET
  name = 'Manish Janu',
  batch = 'PGP 2024-26',
  section = 'G',
  bio = 'PGP2 at IIMB. Created comprehensive academic guides for Term 1 and Term 2 to help the next batch thrive.',
  email_verified = true,
  onboarding_complete = true,
  founding_contributor = true,
  credits = 100
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Insert 11 core courses
INSERT INTO public.courses (id, code, name, professor, term, category, domain, description, created_by, avg_rating, review_count) VALUES
  ('aaaaaaaa-0001-4000-a000-000000000001', 'DS-1', 'Decision Sciences 1', 'Prof. Anand Deo', 'Term 1', 'core', 'analytics',
   'Statistics and probability fundamentals. Covers normal distribution, hypothesis testing, ANOVA, chi-square tests, regression analysis. Evaluation: CP/Quizzes 10%, Project 15%, Mid Term 35%, End Term 40%.',
   '11111111-1111-1111-1111-111111111111', 4, 1),
  ('aaaaaaaa-0002-4000-a000-000000000002', 'OD', 'Organization Design', 'Prof. Sushanta Mishra', 'Term 1', 'core', 'hr',
   'Covers organizational structures, environment, culture, decision-making models, and change management. Evaluation: Quiz 20%, Mid Term 35%, End Term 30%, Project 15%.',
   '11111111-1111-1111-1111-111111111111', 4, 1),
  ('aaaaaaaa-0003-4000-a000-000000000003', 'MICRO', 'Microeconomics', 'Prof. Manaswini Bhalla', 'Term 1', 'core', 'economics',
   'Conceptual microeconomics. Evaluation: Quiz 1 (5%), Quiz 2 (5%), Mid Term 35%, End Term 35%, Project 20%.',
   '11111111-1111-1111-1111-111111111111', 4, 1),
  ('aaaaaaaa-0004-4000-a000-000000000004', 'AFD', 'Accounting for Decision Making', 'Prof. Srinivasan Rangan', 'Term 1', 'core', 'finance',
   'Financial and managerial accounting fundamentals. Evaluation: Quiz 15%, Mid Term 25%, End Term 35%, Project 25%.',
   '11111111-1111-1111-1111-111111111111', 4, 1),
  ('aaaaaaaa-0005-4000-a000-000000000005', 'MM', 'Marketing Management', 'Prof. Mayank Nagpal', 'Term 1', 'core', 'marketing',
   'Core marketing concepts including STP, positioning, CLV, pricing. Evaluation: CP 20%, Project 30%, Mid Term 25%, End Term 25%.',
   '11111111-1111-1111-1111-111111111111', 4, 1),
  ('aaaaaaaa-0006-4000-a000-000000000006', 'ABC', 'Analytical & Business Communication', 'Prof. Malvika Harita', 'Term 1', 'core', 'communication',
   'Professional communication skills. Evaluation: 2-min Monologue 35%, 2-min PPT 35%, Project 30%.',
   '11111111-1111-1111-1111-111111111111', 3, 1),
  ('aaaaaaaa-0007-4000-a000-000000000007', 'CS', 'Corporate Strategy', 'Prof. Sai Chittaranjan Kalubandi', 'Term 2', 'core', 'strategy',
   'Strategy frameworks: Porter''s 5 Forces, VRIO/N, competitive analysis. Evaluation: CP 20%, Quiz 20%, Mid Term 15%, End Term 20%, Project 25%.',
   '11111111-1111-1111-1111-111111111111', 3, 1),
  ('aaaaaaaa-0008-4000-a000-000000000008', 'CF', 'Corporate Finance', 'Prof. Shashidhar Murthy', 'Term 2', 'core', 'finance',
   'NPV, DCF, capital structure, bonds. Evaluation: Quizzes 10%, Mid Term 40%, End Term 40%, Bloomberg 4%, Connect 6%.',
   '11111111-1111-1111-1111-111111111111', 4, 1),
  ('aaaaaaaa-0009-4000-a000-000000000009', 'DS-2', 'Decision Sciences 2', 'Prof. Jitamitra Desai', 'Term 2', 'core', 'analytics',
   'Operations research: LP formulation, sensitivity analysis, branch and bound, mixed integer programming. Evaluation: Cases 20%, Mid Term 40%, End Term 40%.',
   '11111111-1111-1111-1111-111111111111', 4, 1),
  ('aaaaaaaa-0010-4000-a000-000000000010', 'HRDM', 'Human Resource Development & Management', 'Prof. Neha Bellamkonda', 'Term 2', 'core', 'hr',
   'HR frameworks, compensation design, organizational behavior. Evaluation: Quizzes 30%, End Term 40%, Project 15%, CP 5%, Reflection 10%.',
   '11111111-1111-1111-1111-111111111111', 3, 1),
  ('aaaaaaaa-0011-4000-a000-000000000011', 'OM', 'Operations Management', 'Prof. Krishna Sundar', 'Term 2', 'core', 'operations',
   'Operations: inventory, process optimization, six sigma, supply chain. Evaluation: Case Writeups 25%, Game 10%, CP 10%, Mid Term 25%, End Term 30%.',
   '11111111-1111-1111-1111-111111111111', 4, 1);

-- Insert course reviews
INSERT INTO public.course_reviews (course_id, user_id, overall_rating, difficulty_rating, relevance_rating, workload_rating, review_text, tags, tips, is_anonymous) VALUES
('aaaaaaaa-0001-4000-a000-000000000001', '11111111-1111-1111-1111-111111111111', 4, 3, 4, 3,
'Prof. Anand Deo is lenient and wants students to score well. CP is via Mentimeter quizzes (best 10/12), you can discuss answers with classmates. Median ~9/10.

Mid term (35 marks, median 22/35): Probability, normal distribution, Poisson/exponential. Practice tutorial sets religiously. Don''t mix std deviation with variance, watch out for conditional probability.

End term (40 marks, median 29/40): Easier than mid. Hypothesis testing, chi-square, ANOVA, t-test, F-test. Professor teaches step-by-step — just replicate with different values. Tricky 5-mark cascading question can give 0/5 if part (a) is wrong.

Project (15 marks, median 14/15): Very lenient grading. Submit mid-term proposal (3 marks) carefully.

The DS problem set is compiled from previous year mid term questions — complete it first. Slides > textbook for this course.',
ARRAY['lenient-prof', 'practice-heavy', 'scoring', 'tutorial-is-key'],
'Complete the DS problem set first — it''s PYQ compilation. Prof Deo''s slides > textbook. For end term, know F-test vs t-test distinction.',
false),

('aaaaaaaa-0002-4000-a000-000000000002', '11111111-1111-1111-1111-111111111111', 4, 3, 4, 3,
'Prof. Sushanta Mishra sets new questions every year. This is a 4/4 gradeable subject with constant effort — discipline over brainpower.

Quizzes (20 marks): Biggest differentiator. 3 announced quizzes with negative marking, best 2/3. First quiz median was 6/10 — take the lead early. Questions from book and articles: organizational structures, interdependence types, economies of scope vs scale.

Mid term (35 marks, median ~22): 17-18 MCQs (negative marking) + descriptive. Articles contributed 4-5 MCQs + 1 descriptive. 8-mark question on functional structure appeared in both quiz and mid term.

End term (30 marks, median 19): 4 MCQs from guest lectures = biggest differentiator. Reach out to seniors for tips. Questions on population ecology, Carnegie model, garbage can model.

CRITICAL: Read ALL articles first, then book. More questions come from articles. Questions change every year — understand concepts, don''t memorize PYQs.',
ARRAY['article-heavy', 'consistent-effort', '4/4-possible', 'no-repeats'],
'Read articles before book. First quiz median is low — ace it for early lead. Guest lecture MCQs in end term are biggest differentiator.',
false),

('aaaaaaaa-0003-4000-a000-000000000003', '11111111-1111-1111-1111-111111111111', 4, 2, 4, 3,
'Prof. Manaswini Bhalla teaches a completely conceptual subject. Strategy: practice PYQs and problem sets.

Quizzes (10 marks): Very easy — median 5/5 every quiz. Professor shares question bank and PYQs on Moodle. Some MCQs picked directly from PYQs.

Mid term (35 marks): 40-mark paper, median ~33/40, 3 students scored 40/40. All MCQs from class notes. Practice problem sets — same concepts, changed values.

End term (35 marks): 40-mark paper, median 30/40. 5-6 tough MCQs, some multiple correct. Need absolute conceptual clarity.

Project (20 marks): Include dummy variables in regression — many students missed this. Marks not revealed, grades given directly.

Most straightforward course. Effort = output.',
ARRAY['conceptual', 'practice-based', 'high-scoring', 'straightforward'],
'Practice question bank and PYQs — same concepts, changed values. Include dummy variables in regression project.',
false),

('aaaaaaaa-0004-4000-a000-000000000004', '11111111-1111-1111-1111-111111111111', 4, 3, 5, 3,
'Prof. Srinivasan Rangan runs a practice-heavy, high-scoring course. Textbook is your bible.

Quiz (15 marks): 40-mark quiz, median 36-38/40. No negative marking. Do the MOOC and understand book concepts.

Mid term (25 marks): 90-mark paper, median 76.5. Step marking. IMPORTANT: Start with the 24-25 mark balance sheet question at the END — students run out of time. Time-constrained (3 hours).

End term (35 marks): 80-mark paper, median 61. Don''t ignore managerial accounting (last 4 lectures) — 33/80 marks came from it! Students who skipped it suffered. Financial accounting had theory, managerial had direct numericals.

Project (25 marks): Easy, follow prof''s instructions. Only 1-1.5 marks std deviation.

Every concept from lecture 1-20 appears in exams. Don''t skip anything.',
ARRAY['practice-heavy', 'textbook-essential', 'time-constrained', 'high-scoring'],
'Start balance sheet question first in mid term (24-25 marks). Don''t skip managerial accounting (33/80 in end term!). Practice all textbook questions.',
false),

('aaaaaaaa-0005-4000-a000-000000000005', '11111111-1111-1111-1111-111111111111', 4, 2, 4, 3,
'Prof. Mayank Nagpal''s course has tight grade distribution — 2-3 marks can swing your grade significantly.

CP (20 marks): 10 CP + 10 quizzes. Everyone gets min 6/10 CP (marks: 6/8/10). Read cases and ChatGPT summaries before lectures. Make sure to speak every class.

Mid term (25 marks): 50-mark paper, median 39/50. MCQs + 5-mark long answers. Positioning statements, STP numericals, case analysis. A few MCQs directly from PYQs.

End term (25 marks): 50-mark paper, median ~31/50. Toughest paper — I couldn''t complete it. CLV calculation, service gaps (IIMB mess case), product lifecycle stages. Questions from every case except Dlight and Amazon.

Project (30 marks): Big differentiator. Meet prof 2-3 times. One group got 30/30, min was 25/30.

CRITICAL: Both exams are open-book but TIME-CONSTRAINED. You MUST have read the book — searching everything during exam doesn''t work. Write all case discussions in your binder.',
ARRAY['tight-grading', 'case-heavy', 'open-book-trap', 'project-matters'],
'Write ALL case discussions in binder. STP positioning + CLV calculations come every year. Meet prof 2-3 times for project.',
false),

('aaaaaaaa-0006-4000-a000-000000000006', '11111111-1111-1111-1111-111111111111', 3, 2, 3, 2,
'Prof. Malvika Harita is professional and strict. Won''t allow shorts in class.

Monologue (35 marks): She wanted pitch variability — told me I was monotonous. Work on voice modulation.

PPT (35 marks): Do NOT look back at PPT while speaking. Clean, visual slides — no text-heavy content, use color coding.

Project (30 marks): Group pitch to investors. Median was 72 marks across components, some got 88.

1.5-credit course with limited CGPA impact, but don''t neglect it.',
ARRAY['presentation-skills', 'professional', 'low-credit'],
'Practice voice modulation for monologue. Never read from PPT slides. Dress professionally.',
false),

('aaaaaaaa-0007-4000-a000-000000000007', '11111111-1111-1111-1111-111111111111', 3, 4, 4, 4,
'Prof. Kalubandi is strict and demanding. Grades are almost entirely professor-dependent — most CP-dependent course.

CP (20 marks = 15 CP + 5 attendance): THE grade decider. CP marks ranged 4.5 to 20, median 10. Missing one attendance = 1 mark cut, no leniency. CP requires quality arguments — stating case facts gets "So what?" response. He only gives CP when he writes on whiteboard after discussing with you.

The end term topper got only 10/20 in CP → finished with 3.05 GPA.

Quizzes (20 marks): Two 25-mark quizzes scaled to 20. First quiz median 17 (SIP distractions), second 19. 2-3 questions repeat from PYQs.

Mid/End Term (15+20): Fresh case, 3 hours. Apply Porter''s 5 Forces or VRIO/N. Open book with one-pager and binder.

Project (25 marks): Low differentiation — max 20.5, min 18.',
ARRAY['cp-dependent', 'strict-prof', 'case-method', 'framework-heavy'],
'CP decides everything. Get in touch with seniors who had Kalubandi BEFORE course starts. PYQ quizzes have 2-3 repeats.',
false),

('aaaaaaaa-0008-4000-a000-000000000008', '11111111-1111-1111-1111-111111111111', 4, 4, 5, 4,
'Prof. Shashidhar Murthy is laid-back — half the class sleeps. But the content is critical.

Bloomberg (4 marks): Very easy, follow the guide. Marks: 3.8 to 4. Common errors: late submission (-0.2), no beta explanation (-0.2).

Connect Quizzes (6 marks): Multiple attempts, can share answers. Easy 6/6.

Proctored Quizzes (10 marks): 3 quizzes, not hard. Book is very helpful.

Mid term (40 marks): 72 scaled to 40. Easy if you understand discounting. 40+ marks NPV/DCF. Know the infinite GP derivation for twisted questions. Varun Jindal''s slides are excellent.

End term (40 marks): 47 scaled to 40. Numericals + true/false + conceptual questions from cases (Marriott, GEC). Our batch got easiest CF end term ever, but concepts are genuinely hard.',
ARRAY['conceptual', 'textbook-essential', 'free-marks-available'],
'Bloomberg + Connect = free 10/10. Know NPV infinite GP derivation. Use Varun Jindal''s slides. Don''t skip case analyses.',
false),

('aaaaaaaa-0009-4000-a000-000000000009', '11111111-1111-1111-1111-111111111111', 4, 5, 4, 4,
'Prof. Jitamitra Desai (JD) is demanding but the best learning professor. He''s fast — completes in 8 lectures what others take 10.

Cases (20 marks): Only JD requires PPT + report. Groups randomly called to present and get grilled. TA grades reports. For 10/10, add extra analysis and interaction variables. Marks ranged 5.6 to 8.4.

Learn JASP and Excel tools IN CLASS — ChatGPT can''t help. JD won''t share case answers — write them during discussions.

Mid term (40 marks): 53-55 scaled to 40. THREE fixed profiles: (1) Regression table fill — easiest; (2) Multiple regression R-square, F-value — procedural; (3) Multiple outputs choosing — THE differentiator. Must justify output choice.

End term (40 marks): 100 scaled to 40. FIVE fixed profiles: (1) LP formulation — medium; (2) LP with graph — easiest, most scoring; (3) Sensitivity analysis — tricky; (4) Branch and bound — usually easy; (5) Mixed Integer LP — always hardest.

WARNING: Formula sheet notations differ from slides!',
ARRAY['demanding-prof', 'fixed-patterns', 'pyq-essential', 'jasp-required'],
'Mid and end term have FIXED question profiles — practice all 5-6 years of PYQs. Learn JASP in class. LP graphing = easiest; Mixed Integer LP = always hardest.',
false),

('aaaaaaaa-0010-4000-a000-000000000010', '11111111-1111-1111-1111-111111111111', 3, 3, 3, 3,
'Prof. Neha Bellamkonda''s HRDM is OD''s older sibling — mostly rote learning.

Quizzes (30 marks): 3 quizzes on Mettl, median ~24/30. First quiz from book + biases slides. Later quizzes heavier on slides (which aren''t great). Last quiz had framework questions and case discussion questions.

End term (40 marks, median 19/40): Major differentiation. Class case studies (Brunt Hotels, Hiram) did NOT appear. Key: 6-mark McKinsey 7S on your project company (freeriders exposed), 6-mark Nadler Tushman (4C2=6 combos), 8-mark pay structure literally copy-pasted from slides.

Reflection (10 marks): Don''t cheat — shared ChatGPT answers got 5.5-6/10. Unique answers got free marks.

Project (15 marks): Live company projects. Some differentiation in marks.

Print the slides — that 8-mark question was from "Managing Annual Merit Review Process" slide.',
ARRAY['rote-learning', 'slides-matter', 'framework-heavy'],
'Print slides — 8-mark question was copy-pasted from them. Learn McKinsey 7S and Nadler Tushman cold. Write unique reflections.',
false),

('aaaaaaaa-0011-4000-a000-000000000011', '11111111-1111-1111-1111-111111111111', 4, 4, 4, 3,
'Prof. Krishna Sundar is entertaining but doesn''t care about OM. TARUN JAIN IS THE REAL GOD — he sets all exam papers.

Cases (25 marks): Get seniors'' submissions but don''t copy (mostly incorrect). Watch TJ''s videos, understand solutions, then edit submissions.

Game (10 marks): Littlefield simulation — same every year. Get strategy from seniors who got 10/10. Watch TJ''s 13th video (game debrief).

CP (10 marks): Krishna Sundar doesn''t give CP — it''s all the TA. Ask TA directly how marks are awarded. Our TA gave marks for saying literally anything. 23 people got 10/10. 20/20 attendance = 9+ even without speaking.

Mid term (25 marks): 150-mark paper. TJ sections median 135/150; Krishna Sundar''s section median 92/150 (I got 121). Krishna Sundar didn''t teach some topics that appeared.

End term (30 marks): Full syllabus 175-mark paper. I got 175/175 after switching to TJ''s videos post mid term.

GOLDEN TIP: Tarun Jain''s video lectures are EVERYTHING.',
ARRAY['tarun-jain-is-key', 'video-lectures', 'game-strategy'],
'TJ''s video lectures = everything. I got 175/175 using just his videos. Get game strategy from seniors who scored 10/10. Ask TA how CP marks are awarded.',
false);

-- Insert guide posts
INSERT INTO public.posts (user_id, category, title, body, flair, is_anonymous, moderation_status, upvote_count) VALUES
('11111111-1111-1111-1111-111111111111', 'academics',
'The Complete IIMB First Year Academic Strategy Guide',
'This is a compilation of my personal experience during the first year at IIMB. I am fortunate enough to have had many seniors who selflessly guided me, and this is my way of giving back.

**Why does this matter?**
Imagine your peers getting access to past year papers or insider tips while you don''t. Given relative grading, you lose out on the grade you deserve. This is information asymmetry. Everyone should have equal access to guidance.

**The Strategy:**
Every course has multiple evaluation components. While mid/end terms are common across sections, other components depend on your professor. As soon as you know your professors, reach out to PGP2s who had them last year. Learn everything before the first lecture.

**On Note-Taking:**
Taking notes keeps you attentive — your handmade notes are the best exam asset. Staying attentive does 75% of the job.

**Term Reality:**
- **Term 1**: Build your GPA. Courses are controllable — effort = output
- **Term 2**: Hectic with SIP prep. HR and Strategy are globe subjects — subjective and less controllable
- **Term 3**: BGS is the most random course. Even toppers get 2.2-2.4 here. You need a buffer.

Go All Gas, No Brakes in Term 1. Mamba mentality.',
'Pro Tip', false, 'approved', 15),

('11111111-1111-1111-1111-111111111111', 'academics',
'How Grades Work at IIMB — GPA, DML, DHL Explained',
'**Credit System:** Every course is 3 credits except ABC, CDA, MDB (1.5 each). Max grade: 4.0 on a 4-point scale.

**Grading:** Max 25% of section can get 3.5+. Grading is CONTINUOUS — highest scorer gets 4.0, second might get 3.97, then 3.94. Median generally gets 3.00 (varies by professor).

**Real Numbers:** I was 5th in DS-1 → 3.85. 3rd in OD → 3.97. DML cutoff: 3.67. DHL cutoff: 3.56. Rank 10: ~3.74.

**Why DML/DHL Matters:**
- DML = Top 5% → ₹2 Lakhs scholarship
- DHL = Next 5%
- Freezes after Term 3 — first year is your only shot
- Decides foreign exchange university selection
- Top consulting firms target DML students
- Makes you eligible for additional scholarships
- Professors notice you → easier LORs

**Hidden Scholarships:**
- 4/4 in AFD + Corp Finance = ₹5 Lakhs
- Top performance in Corp Strategy + OM + CGPA = ₹1 Lakh',
'Pro Tip', false, 'approved', 12),

('11111111-1111-1111-1111-111111111111', 'academics',
'Term 2 Course Survival Guide — What Nobody Tells You',
'Term 2 is a different beast. SIP prep, buddy calls, case preps — all while academics continue.

**Corporate Strategy (Kalubandi):** Most CP-dependent course. End term topper had 10/20 CP → finished 3.05. Contact seniors who had him BEFORE course starts.

**Corporate Finance (Murthy):** Bloomberg + Connect = free 10/10. Textbook is your bible. Varun Jindal slides are gold.

**DS-2 (JD):** Fixed question profiles every year. Practice 5-6 years of PYQs. Learn JASP IN CLASS — ChatGPT can''t help. Formula sheet notations differ from slides.

**HRDM (Bellamkonda):** Rote learning course. Print slides — an 8-mark question was literally copy-pasted from slides. End term median was only 19/40.

**Operations Management (Krishna Sundar):** TARUN JAIN IS GOD. He sets all papers. I discovered TJ videos after mid term → scored 175/175 in end term. His videos + tutorials = everything.

Build your GPA buffer in Term 1 because Term 2 subjects are less controllable.',
'Pro Tip', false, 'approved', 10);
