import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

export const seedDemo = async (req, res) => {
  try {
    // Remove all existing data (optional, for a clean slate)
    await Movie.deleteMany({});
    await Show.deleteMany({});

    // Demo movie
    const movie = await Movie.create({
      _id: "tt1234567",
      title: "Demo Movie",
      overview: "This is a demo movie for seeding.",
      poster_path: "/demo.jpg",
      backdrop_path: "/demo-bg.jpg",
      release_date: "2025-01-01",
      original_language: "en",
      tagline: "A demo tagline",
      genres: [{ id: 1, name: "Action" }],
      casts: [{ name: "Demo Actor", profile_path: "/demo-actor.jpg" }],
      vote_average: 8.5,
      runtime: 120,
    });

    // Demo show
    await Show.create({
      movie: movie._id,
      showDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      showPrice: 10,
      occupiedSeats: {},
    });

    res.json({ success: true, message: "Demo data seeded!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}; 