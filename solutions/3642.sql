SELECT
    b.book_id,
    b.title,
    b.author,
    b.genre,
    b.pages,
    MAX(r.session_rating) - MIN(r.session_rating) AS rating_spread,
    ROUND(AVG(r.session_rating <= 2 OR r.session_rating >= 4), 2) AS polarization_score
FROM books AS b
INNER JOIN reading_sessions AS r ON r.book_id = b.book_id
GROUP BY b.book_id
HAVING COUNT(*) >= 5
   AND MIN(r.session_rating) <= 2
   AND MAX(r.session_rating) >= 4
   AND AVG(r.session_rating <= 2 OR r.session_rating >= 4) >= 0.6
ORDER BY polarization_score DESC, b.title DESC;
