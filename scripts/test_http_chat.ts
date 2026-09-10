async function testHttpChat() {
  console.log("Testing POST to http://localhost:3000/api/ai/chat ...");
  try {
    const res = await fetch("http://localhost:3000/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            parts: [
              {
                text: "Show me vibrant jewel-toned silks for Navratri and Durga Puja celebrations",
              },
            ],
          },
        ],
      }),
    });

    console.log("HTTP Status:", res.status);
    const data = await res.json();
    console.log("Response Message:", data.message);
    console.log("Products Count:", data.products?.length);
    console.log("Product IDs:", data.products);
  } catch (err: any) {
    console.error("HTTP Fetch Error:", err.message);
  }
}

testHttpChat();
