// index.ts

import "./style.css";

document.getElementById("tellStory")?.addEventListener("click", async () => {
  const prompt = (document.getElementById("prompt") as HTMLInputElement).value;
  console.log(prompt);
  const storyOutput = document.getElementById("storyOutput");

  if (prompt && storyOutput) {
    storyOutput.innerText = "Generating your poem...";

    try {
      const response = await fetch("http://localhost:3000/api/get-poem", {
        // Full URL with the port
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      storyOutput.innerText = data.content || "Sorry, no response generated.";
    } catch (error) {
      storyOutput.innerText = "Sorry, something went wrong. Please try again.";
      console.error("Error:", error);
    }
  }
});
