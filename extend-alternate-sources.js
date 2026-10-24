const fs = require("fs");
const path = require("path");

const additions = [
  [1393, "Capital Gain/Loss", "Database", "capital-gainloss", "pythondata", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/1300-1399/1393.Capital%20Gain%20Loss/Solution.py"],
  [3374, "First Letter Capitalization II", "Database", "first-letter-capitalization-ii", "pythondata", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3300-3399/3374.First%20Letter%20Capitalization%20II/Solution.py"],
  [3521, "Find Product Recommendation Pairs", "Database", "find-product-recommendation-pairs", "pythondata", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3500-3599/3521.Find%20Product%20Recommendation%20Pairs/Solution.py"],
  [3695, "Maximize Alternating Sum Using Swaps", "Array", "maximize-alternating-sum-using-swaps", "java", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3600-3699/3695.Maximize%20Alternating%20Sum%20Using%20Swaps/Solution.java"],
  [602, "Friend Requests II: Who Has the Most Friends", "Database", "friend-requests-ii-who-has-the-most-friends", "mysql", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/0600-0699/0602.Friend%20Requests%20II%20Who%20Has%20the%20Most%20Friends/Solution.sql"],
  [3475, "DNA Pattern Recognition", "Database", "dna-pattern-recognition", "mysql", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3400-3499/3475.DNA%20Pattern%20Recognition/Solution.sql"],
  [3497, "Analyze Subscription Conversion", "Database", "analyze-subscription-conversion", "mysql", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3400-3499/3497.Analyze%20Subscription%20Conversion/Solution.sql"],
  [3705, "Find Golden Hour Customers", "Unknown", "find-golden-hour-customers", "python3", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3700-3799/3705.Find%20Golden%20Hour%20Customers/Solution.py"],
  [3716, "Find Churn Risk Customers", "Unknown", "find-churn-risk-customers", "python3", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3700-3799/3716.Find%20Churn%20Risk%20Customers/Solution.py"],
  [3720, "Lexicographically Smallest Permutation Greater Than Target", "Hash Table", "lexicographically-smallest-permutation-greater-than-target", "python3", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3700-3799/3720.Lexicographically%20Smallest%20Permutation%20Greater%20Than%20Target/Solution.py"],
  [3764, "Most Common Course Pairs", "Unknown", "most-common-course-pairs", "python3", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3700-3799/3764.Most%20Common%20Course%20Pairs/Solution.py"],
  [3793, "Find Users with High Token Usage", "Unknown", "find-users-with-high-token-usage", "python3", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3700-3799/3793.Find%20Users%20with%20High%20Token%20Usage/Solution.py"],
  [3808, "Find Emotionally Consistent Users", "Unknown", "find-emotionally-consistent-users", "python3", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3800-3899/3808.Find%20Emotionally%20Consistent%20Users/Solution.py"],
  [3832, "Find Users with Persistent Behavior Patterns", "Unknown", "find-users-with-persistent-behavior-patterns", "python3", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3800-3899/3832.Find%20Users%20with%20Persistent%20Behavior%20Patterns/Solution.py"],
  [3934, "Smallest Unique Subarray", "Array", "smallest-unique-subarray", "python3", "https://raw.githubusercontent.com/doocs/leetcode/main/solution/3900-3999/3934.Smallest%20Unique%20Subarray/Solution.py"],
];

const dataPath = path.join(__dirname, "merged_output.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const ids = new Set(data.map((problem) => problem.id));
for (const [id, title, topic, slug, language, url] of additions) {
  if (ids.has(id)) continue;
  data.push({
    id,
    title,
    topic,
    is_paid: false,
    leetcode_url: `https://leetcode.com/problems/${slug}/`,
    walkcc_url: url,
    submission_lang: language,
  });
}
data.sort((a, b) => a.id - b.id);
fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Dataset now contains ${data.length} problems.`);
