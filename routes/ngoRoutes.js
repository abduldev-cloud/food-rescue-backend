import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * GET /api/ngo/donations
 * Fetch all available food donations
 */
router.get("/donations", (req, res) => {
  const sql = `
    SELECT 
      id, donor_name, donor_phone, food_type, food_quantity, address, created_at
    FROM donors
    WHERE status = 'available'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching donations:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json(results);
  });
});


/**
 * PUT /api/ngo/claim/:id
 * Claim a donation by NGO
 */
router.put("/claim/:id", (req, res) => {
  const donationId = req.params.id;
  const { ngoName } = req.body;

  if (!ngoName) {
    return res.status(400).json({ message: "NGO name is required" });
  }

  const sql = `
    UPDATE donors 
    SET status = 'claimed', claimed_by = ? 
    WHERE id = ? AND status = 'active'
  `;

  db.query(sql, [ngoName, donationId], (err, result) => {
    if (err) {
      console.error("Error claiming donation:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation not available or not found" });
    }

    res.status(200).json({ message: "Donation claimed successfully!" });
  });
});

export default router;
