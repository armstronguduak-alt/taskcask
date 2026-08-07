-- Seed Tasks
INSERT INTO public.task_categories (id, name, icon) VALUES 
('cat_explore', 'Explore', 'explore'),
('cat_telegram', 'Telegram Tasks', 'send')
ON CONFLICT DO NOTHING;

INSERT INTO public.tasks (id, title, category_id, reward_type, reward_amount, description, link, badge, button_text, icon)
VALUES 
('task_cpm_network', 'Exclusive CPM Network Offer', 'cat_explore', 'SB', 500, 'Complete this exclusive offer to earn massive rewards!', 'https://www.effectivecpmnetwork.com/h0cq93109?key=c4b5e80c407ee733eb7a534c655bf22b', 'Sponsored', 'View Offer', 'campaign')
ON CONFLICT DO NOTHING;
