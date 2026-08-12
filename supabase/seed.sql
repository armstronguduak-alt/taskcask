-- Seed Data for TaskCash

-- Levels
INSERT INTO public.levels (id, name, cost, earning_multiplier, max_daily_ads_cat_a, max_daily_ads_cat_b, max_daily_ads_cat_c, max_daily_tasks, min_withdrawal_sb, min_withdrawal_usdt, req_account_age, req_streak, req_ads, req_tasks, req_referrals, benefits) VALUES
('lvl_1', 'Silver', 0, 1.0, 5, 5, 5, 5, 30000, 20.0, 0, 0, 0, 0, 0, '["Basic Tasks"]'),
('lvl_2', 'Gold', 1000, 1.5, 10, 10, 10, 10, 20000, 15.0, 7, 7, 20, 10, 2, '["Premium Tasks", "Lower Withdrawal limit"]'),
('lvl_3', 'Diamond', 5000, 2.0, 20, 20, 20, 20, 10000, 10.0, 30, 30, 100, 50, 10, '["All Tasks", "Priority Support", "Lowest Withdrawal"]'),
('lvl_4', 'Ruby', 10000, 3.0, 30, 30, 30, 30, 5000, 5.0, 60, 60, 200, 100, 20, '["VIP Exclusive Tasks", "Instant Withdrawals"]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, min_withdrawal_sb = EXCLUDED.min_withdrawal_sb;

-- Task Categories
INSERT INTO public.task_categories (id, name, icon) VALUES 
('cat_official', 'Official', 'verified'),
('cat_extra', 'Extra Tasks', 'stars'),
('cat_community', 'Community', 'groups'),
('cat_engagement', 'Engagement', 'explore')
ON CONFLICT (id) DO NOTHING;

-- Rewarded Ads
INSERT INTO public.rewarded_ads (id, name, type, category, reward_type, reward_amount, watch_time_sec, remaining_views) VALUES
('ad_monetag1', 'Click on the Ad after viewing', 'monetag', 'Official', 'SB', 50, 15, 1),
('ad_monetag2', 'Watch and click on ads', 'monetag', 'Official', 'USDT', 0.05, 30, 1),
('ad_giga', 'Watch the Giga AD', 'giga', 'Official', 'SB', 50, 45, 1),
('ad_video', 'View video, then tap the AD', 'video', 'Official', 'USDT', 0.10, 60, 1)
ON CONFLICT (id) DO NOTHING;

-- Tasks
INSERT INTO public.tasks (id, title, category_id, reward_type, reward_amount, description, link, status, badge, button_text, icon) VALUES 
('t_tg_join', 'Join Telegram channel', 'cat_community', 'SB', 500, 'Join our official community', 'https://t.me/taskcash_official', 'Active', 'Standard', 'Join', 'globe'),
('t_wa_join', 'Join WhatsApp group', 'cat_community', 'USDT', 0.2, 'Join WhatsApp for alerts', 'https://whatsapp.com/channel/0029Vb8KUjXEquiYaU8JqQ45', 'Active', 'Standard', 'Join', 'globe'),
('t_visit', 'Visit Website', 'cat_engagement', 'SB', 100, 'Open the partner page and interact with the content.', 'https://www.effectivecpmnetwork.com/h0cq93109?key=c4b5e80c407ee733eb7a534c655bf22b', 'Active', 'Standard', 'Explore', 'explore'),
('t_read', 'Explore Content', 'cat_engagement', 'SB', 150, 'Explore premium content.', 'https://link.gigapub.tech/l/cynz40gvg', 'Active', 'Standard', 'Explore', 'explore'),
('t_stay', 'Stay 30 Seconds', 'cat_engagement', 'SB', 200, 'Stay on the page for 30 seconds.', '#', 'Active', 'Standard', 'Start', 'explore'),
('t_partner', 'Partner Task', 'cat_engagement', 'USDT', 0.20, 'Complete the partner task.', '#', 'Active', 'Standard', 'Complete', 'explore')
ON CONFLICT (id) DO NOTHING;

-- Banks
INSERT INTO public.banks (id, name, code) VALUES
('bank_opay', 'OPAY (Popular)', '000000'),
('bank_palmpay', 'PalmPay (Popular)', '000000'),
('bank_first', 'First Bank', '000000'),
('bank_access', 'Access Bank', '000000'),
('bank_uba', 'UBA', '000000'),
('bank_gtb', 'GTBank', '000000'),
('bank_fcmb', 'FCMB', '000000'),
('bank_union', 'Union Bank', '000000')
ON CONFLICT (id) DO NOTHING;
