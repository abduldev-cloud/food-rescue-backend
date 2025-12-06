import bcrypt from "bcryptjs";
import db from "../db.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone_no, place, role } = req.body;

    const cleanRole = role?.trim().toLowerCase();
    if (!name || !email || !password || !phone_no || !place || !cleanRole) {
      return res.status(400).json({ message: "All fields are required" });
    }


    const allowedRoles = ["admin", "donor", "ngo"];
    if (!allowedRoles.includes(cleanRole)) {
      return res.status(400).json({ message: "Invalid role option" });
    }

    const [existing] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .promise()
      .query(
        "INSERT INTO users (name, email, password, phone_no, place, role) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phone_no, place, cleanRole]
      );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const [userRows] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (userRows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userRows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_no: user.phone_no,
        place: user.place,
        role: user.role, 
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};