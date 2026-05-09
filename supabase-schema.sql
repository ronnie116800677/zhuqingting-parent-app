create table if not exists students (
  id text primary key,
  name text not null,
  class_name text not null,
  query_code text not null unique,
  parent_name text not null default '家长',
  created_at timestamptz not null default now()
);

create table if not exists feedbacks (
  id text primary key,
  student_id text not null references students(id) on delete cascade,
  feedback_date date not null,
  homework text not null,
  focus integer not null check (focus between 1 and 5),
  mistakes text not null,
  evaluation text not null,
  reminder text not null,
  created_at timestamptz not null default now()
);

create table if not exists progress_records (
  id text primary key,
  student_id text not null references students(id) on delete cascade,
  record_date date not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table students enable row level security;
alter table feedbacks enable row level security;
alter table progress_records enable row level security;

drop policy if exists "prototype read students" on students;
drop policy if exists "prototype insert students" on students;
drop policy if exists "prototype read feedbacks" on feedbacks;
drop policy if exists "prototype insert feedbacks" on feedbacks;
drop policy if exists "prototype read progress" on progress_records;
drop policy if exists "prototype insert progress" on progress_records;

create policy "prototype read students"
on students for select
to anon
using (true);

create policy "prototype insert students"
on students for insert
to anon
with check (true);

create policy "prototype read feedbacks"
on feedbacks for select
to anon
using (true);

create policy "prototype insert feedbacks"
on feedbacks for insert
to anon
with check (true);

create policy "prototype read progress"
on progress_records for select
to anon
using (true);

create policy "prototype insert progress"
on progress_records for insert
to anon
with check (true);

insert into students (id, name, class_name, query_code, parent_name)
values
  ('stu-chen-yiran', '陈一然', '三年级思维提升班', 'CYR2026', '陈一然妈妈'),
  ('stu-lin-xiaomu', '林小沐', '五年级阅读表达班', 'LXM2026', '林小沐爸爸')
on conflict (id) do nothing;

insert into feedbacks (id, student_id, feedback_date, homework, focus, mistakes, evaluation, reminder)
values
  ('fb-1', 'stu-chen-yiran', current_date - interval '4 day', '按时完成，书写整洁', 4, '计算题有两处粗心，已完成订正。', '今天解题思路清楚，能够主动讲出为什么这样列式。', '回家再练 2 道同类型应用题，注意单位换算。'),
  ('fb-2', 'stu-chen-yiran', current_date - interval '1 day', '完成较好，订正及时', 5, '错题集中在审题关键词漏看。', '专注度很棒，课堂互动积极，已经能自己复盘错误原因。', '今晚复习课堂笔记第 2 页，把关键词画出来。'),
  ('fb-3', 'stu-lin-xiaomu', current_date - interval '2 day', '基本完成，作文需要补充细节', 4, '阅读题第 3 题概括不够完整。', '能跟上课堂节奏，表达比上周更自然。', '亲子共读 15 分钟，请孩子口头复述文章主旨。')
on conflict (id) do nothing;

insert into progress_records (id, student_id, record_date, text)
values
  ('pro-1', 'stu-chen-yiran', current_date - interval '5 day', '主动检查应用题单位，订正速度明显变快。'),
  ('pro-2', 'stu-chen-yiran', current_date - interval '1 day', '课堂举手次数增加，愿意完整说出解题思路。'),
  ('pro-3', 'stu-lin-xiaomu', current_date - interval '4 day', '阅读批注更细，能圈出关键词并归纳段意。')
on conflict (id) do nothing;
