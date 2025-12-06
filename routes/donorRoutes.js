import express from "express";
import db from "../db.js";

const router = express.Router();


router.post("/add", (req, res) => {
  const { donorName, donorPhone, foodType, foodQuantity, address } = req.body;

  if (!donorName || !donorPhone || !foodType || !foodQuantity || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO donors (donor_name, donor_phone, food_type, food_quantity, address, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `;

  db.query(sql, [donorName, donorPhone, foodType, foodQuantity, address], (err, result) => {
    if (err) {
      console.error("Error adding donor:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "Donation added successfully!" });
  });
});

router.get("/list", (req, res) => {
  const sql = `
    SELECT 
      id, donor_name, donor_phone,address,claimed_by, created_at, claimed_at
    FROM donors
    WHERE status = 'active' OR status = 'claimed'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching donors:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});


router.put("/claim/:id", (req, res) => {
  const donationId = req.params.id;
  const { ngoName } = req.body;

  if (!ngoName) {
    return res.status(400).json({ message: "NGO name is required" });
  }

  const sql = `
    UPDATE donors 
    SET claimed_by = ?, claimed_at = NOW() 
    WHERE id = ? AND claimed_by IS NULL
  `;

  db.query(sql, [ngoName, donationId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Already claimed" });
    }

    res.json({ message: "Donation successfully claimed!" });
  });
});



export default router;
