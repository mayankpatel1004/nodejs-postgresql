SELECT 
                  i.item_id,
                  i.item_title,
                  i.item_alias,
                  STRING_AGG(isect.section_title, ',') as section_details,
                  i.item_parent,
                  i.item_type,
                  i.item_sections_id,
                  i.item_description,
                  i.attachment1,
                  i.item_shortdescription,
                  i.user_id,
                  i.published_at,
                  i.published_end_at,
                  i.meta_title,
                  i.meta_description,
                  i.display_order,
                  CASE WHEN i.display_status = 'Y' THEN 'Yes' ELSE 'No' END AS display_status,
                  CASE WHEN i.deleted_status = 'Y' THEN 'Yes' ELSE 'No' END AS deleted_status,
                  TO_CHAR(i.created_at, 'DD/MM/YY') AS created_at,
                  TO_CHAR(i.updated_at, 'DD/MM/YY') AS updated_at 
              FROM items i
              LEFT JOIN item_section isect ON isect.item_section_id = ANY(
                SELECT unnest(string_to_array(REPLACE(REPLACE(i.item_sections_id, '[', ''), ']', ''), ','))::int
              )
              WHERE 1=1  AND i.item_type IN ('default') AND i.deleted_status = 'N' 
              GROUP BY i.item_id
              ORDER BY item_id DESC  LIMIT 20 OFFSET 0

----------------------------------------

SELECT 
                  i.item_id,
                  i.item_title,
                  i.item_alias,
                  STRING_AGG(isect.section_title, ',') as section_details,
                  i.item_parent,
                  i.item_type,
                  i.item_sections_id,
                  i.item_description,
                  i.attachment1,
                  i.item_shortdescription,
                  i.user_id,
                  i.published_at,
                  i.published_end_at,
                  i.meta_title,
                  i.meta_description,
                  i.display_order,
                  CASE WHEN i.display_status = 'Y' THEN 'Yes' ELSE 'No' END AS display_status,
                  CASE WHEN i.deleted_status = 'Y' THEN 'Yes' ELSE 'No' END AS deleted_status,
                  TO_CHAR(i.created_at, 'DD/MM/YY') AS created_at,
                  TO_CHAR(i.updated_at, 'DD/MM/YY') AS updated_at 
              FROM items i
              LEFT JOIN item_section isect ON isect.item_section_id = ANY(
                SELECT unnest(string_to_array(REPLACE(REPLACE(i.item_sections_id, '[', ''), ']', ''), ','))::int
              )
              WHERE 1=1  AND i.item_type IN ('default') AND i.deleted_status = 'N' 
              GROUP BY i.item_id
              ORDER BY item_id DESC

----------------------------------------

