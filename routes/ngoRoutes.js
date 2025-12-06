import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * GET /api/ngo/donations
 * Fetch all active food donations
 */
router.get("/donations", (req, res) => {
  const sql = `
    SELECT 
      id, donor_name, donor_phone, food_type, food_quantity, address, created_at
    FROM donors
    WHERE status = 'active'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching active donations:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json(results);
  });
});


router.put("/claim/:id", (req, res) => {
  const donationId = req.params.id;
  const { ngoName } = req.body; 

//   const sql = "UPDATE donors SET status = 'claimed', claimed_by = ? WHERE id = ?";
  const sql = "SELECT * FROM donors WHERE status = 'available' ORDER BY created_at DESC";


  db.query(sql, [ngoName, donationId], (err, result) => {
    if (err) {
      console.error("Error claiming donation:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.status(200).json({ message: "Donation claimed successfully!" });
  });
});


export default router;
