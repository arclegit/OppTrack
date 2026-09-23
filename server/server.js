import app from "./app.js";


// Hosting platforms provide PORT automatically.
// 5000 is used when running locally.
const PORT = process.env.PORT || 5000;


app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `OppTrack API running on port ${PORT}`
  );
});
