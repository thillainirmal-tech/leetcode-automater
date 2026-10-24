async function getLeetCodeTokens() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: "leetcode.com" });
    const session = cookies.find(c => c.name === "LEETCODE_SESSION");
    const csrftoken = cookies.find(c => c.name === "csrftoken");

    const tokenBox = document.getElementById("token");
    const status = document.getElementById("status");
    const copyBtn = document.getElementById("copy");

    if (session && csrftoken) {
      const encode = (str) => {
        const lenStr = str.length.toString().padStart(4, '0');
        return lenStr + str;
      };

      const combinedToken = encode(session.value) + encode(csrftoken.value);

      const formatted = `
        <div><span class="label">Merge Token:</span> ${combinedToken}</div>
      `;
      tokenBox.innerHTML = formatted;

      copyBtn.onclick = () => {
        navigator.clipboard.writeText(combinedToken);
        status.textContent = "✅ Merge token copied!";
        setTimeout(() => status.textContent = "", 2000);
      };
    } else {
      tokenBox.textContent = "⚠️ Please log in to leetcode.com first.";
      copyBtn.disabled = true;
    }
  } catch (err) {
    console.error("Error fetching cookies:", err);
    document.getElementById("token").textContent = "Error fetching tokens.";
  }
}

getLeetCodeTokens();
