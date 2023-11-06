-- 
SELECT *
FROM product
WHERE (name LIKE '%e%')
    AND (brand_id IN (1, 2))
    AND (cat_id IN (4, 5, 6, 7, 8))
    AND CONCAT(",", color, ",") REGEXP ",(1|2),"
    AND CONCAT(",", size, ",") REGEXP ",(1|2),"
    AND CONCAT(",", tag, ",") REGEXP ",(3|4),"
    AND (
        price BETWEEN 1500 AND 10000
    )
ORDER BY id asc
LIMIT 10 OFFSET 0;

-- find_in_set
SELECT *
FROM product
WHERE (name LIKE '%e%')
    AND (brand_id IN (1,2))
    AND (cat_id IN (4, 5, 6, 7, 8))
    AND (
        FIND_IN_SET(1, color)
        OR FIND_IN_SET(2, color)
    )
    AND (
        FIND_IN_SET(3, tag)
        OR FIND_IN_SET(4, tag)
    )
    AND (
        FIND_IN_SET(1, size)
        OR FIND_IN_SET(2, size)
    )
    AND (
        price BETWEEN 1500 AND 10000
    )
ORDER BY id asc
LIMIT 10 OFFSET 0;