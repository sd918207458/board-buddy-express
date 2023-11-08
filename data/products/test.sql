-- 
SELECT *
FROM product
WHERE (name LIKE '%e%')
    AND (brand_id IN (1, 2, 4))
    AND (cat_id IN (4, 5, 6, 10, 11, 12))
    AND CONCAT(",", color, ",") REGEXP ",(1|3),"
    AND CONCAT(",", size, ",") REGEXP ",(2|3),"
    AND CONCAT(",", tag, ",") REGEXP ",(1|2|4),"
    AND (
        price BETWEEN 1500 AND 10000
    )
ORDER BY id ASC;
-- LIMIT 10 OFFSET 0;
-- find_in_set
SELECT *
FROM product
WHERE (name LIKE '%e%')
    AND (brand_id IN (1, 2, 4))
    AND (cat_id IN (4, 5, 6, 10, 11, 12))
    AND (
        FIND_IN_SET(1, color)
        OR FIND_IN_SET(3, color)
    )
    AND (
        FIND_IN_SET(2, size)
        OR FIND_IN_SET(3, size)
    )
    AND (
        FIND_IN_SET(1, tag)
        OR FIND_IN_SET(2, tag)
        OR FIND_IN_SET(4, tag)
    )
    AND (
        price BETWEEN 1500 AND 10000
    )
ORDER BY id ASC;
-- LIMIT 10 OFFSET 0;