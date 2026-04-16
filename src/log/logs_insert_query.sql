INSERT INTO items (item_title, item_parent, item_sections_id, item_description, item_shortdescription, meta_title, meta_description, display_status, display_order, item_type, published_at, published_end_at, created_at, user_id, controller, action, item_alias, attachment1) VALUES ('Demo4', '0', '3,4', 'Demo4', 'Demo4', 'Demo4', 'Demo4', 'Y', '5', 'default', '2026-04-16 00:00:00', '2031-04-16 00:00:00', '2026-04-16 08:50:31', '1', '', '', 'demo4', 'attachment1-1776329445403.png') RETURNING item_id

----------------------------------------

UPDATE items SET item_title = 'Demo4 update', item_parent = '0', item_sections_id = '4', item_description = 'Demo4', item_shortdescription = 'Demo4', meta_title = 'Demo4', meta_description = 'Demo4', display_status = 'Y', display_order = '5', item_type = 'default', published_at = '2026-04-16 00:00:00', published_end_at = '2031-04-16 00:00:00', user_id = '1', controller = '', action = '' WHERE item_id = '11'

----------------------------------------

