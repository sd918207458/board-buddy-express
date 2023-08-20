-- uid為使用者id變數，會員登入後可以得到，需要代入查詢
SET @uid = 1;
--
-- TEST
SELECT p.*,
    f.id AS favorite_id
FROM product AS p
    LEFT JOIN favorite AS f ON f.pid = p.id
    AND f.uid = @uid
ORDER BY p.id ASC;
--
-- TEST
SELECT p.*, IF(f.id, 'true', 'false') AS is_favorite
    FROM product AS p
    LEFT JOIN favorite AS f ON f.pid = p.id
    AND f.uid = @uid
    ORDER BY p.id ASC;
--
-- 只有會員有加入到我的最愛的商品清單
SELECT p.*
FROM product AS p
    INNER JOIN favorite AS f ON f.pid = p.id
    AND f.uid = @uid
ORDER BY p.id ASC;
--
-- uid為使用者id變數，會員登入後可以得到，需要代入查詢
SET @uid = 1;
SET @pid = 5;
-- 
INSERT INTO favorite (uid, pid)
VALUES (@uid, @pid)

--
-- uid為使用者id變數，會員登入後可以得到，需要代入查詢
SET @uid = 1;
SET @pid = 5;
DELETE FROM favorite
WHERE pid=@pid AND uid=@uid;