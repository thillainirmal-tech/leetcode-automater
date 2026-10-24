SELECT customer_id
FROM customer_transactions
GROUP BY customer_id
HAVING COUNT(*) >= 3
   AND AVG(transaction_type = 0x726566756E64) < 0.2
   AND TIMESTAMPDIFF(DAY, MIN(transaction_date), MAX(transaction_date)) >= 30
ORDER BY customer_id;
