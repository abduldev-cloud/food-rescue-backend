import express from "express";
import db from "../db.js";

const router = express.Router();


router.get("/stats", (req, res) => {
  const stats = {};

  const queries = [
    { key: "totalDonors", sql: "SELECT COUNT(*) AS count FROM users WHERE role = 'donor'" },
    { key: "totalNgos", sql: "SELECT COUNT(*) AS count FROM users WHERE role = 'ngo'" },
    { key: "totalDonations", sql: "SELECT COUNT(*) AS count FROM donors" },
    { key: "totalFood", sql: "SELECT SUM(food_quantity) AS total FROM donors" },
  ];

  let done = 0;

  queries.forEach(q => {
    db.query(q.sql, (err, result) => {
      if (err) return res.status(500).json({ error: err });

      stats[q.key] = result[0].count || result[0].total || 0;

      done++;
      if (done === queries.length) {
        res.json(stats);
      }
    });
  });
});


router.get("/donors", (req, res) => {
  db.query(
    "SELECT id, name, email, phone FROM users WHERE role='donor' ORDER BY id DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});


router.get("/ngos", (req, res) => {
  db.query(
    "SELECT id, name, place AS location, phone_no AS contact FROM users WHERE role='ngo'",
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// router.get("/ngos", (req, res) => {
//   db.query(
//     "SELECT id, name, email, phone FROM users WHERE role='ngo'",
//     (err, results) => {
//       if (err) return res.status(500).json({ error: err });
//       res.json(results);
//     }
//   );
// });


router.get("/donations", (req, res) => {
  db.query("SELECT * FROM donors ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Donation chart by date on admin dashboard

router.get("/donation-trend", (req, res) => {
  const sql = `
    SELECT DATE(created_at) AS date, COUNT(*) AS donations
    FROM donors
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

export default router;
