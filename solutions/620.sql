SELECT *
FROM Cinema
WHERE id % 2 = 1
  AND HEX(description) <> '626F72696E67'
ORDER BY rating DESC;
