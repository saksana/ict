const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken'); // Import JWT

// ຟັງຊັນສຳລັບ Register
exports.register = async (req, res) => {
  try {
    const { fullname, username, password, role } = req.body;

    // 1. ກວດສອບວ່າປ້ອນຂໍ້ມູນມາຄົບຫຼືບໍ່
    if (!fullname || !username || !password) {
      return res
        .status(400)
        .json({
          message: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ (Fullname, Username, Password)!",
        });
    }

    // 2. ກວດສອບຄວາມຍາວຂອງ Username (ຕົວຢ່າງ: ຕ້ອງມີຢ່າງໜ້ອຍ 4 ຕົວອັກສອນ)
    if (username.length < 4) {
      return res
        .status(400)
        .json({ message: "Username ຕ້ອງມີຢ່າງໜ້ອຍ 4 ຕົວອັກສອນ!" });
    }

    // 3. ກວດສອບຄວາມປອດໄພຂອງ Password (ຕົວຢ່າງ: ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ)
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          message: "Password ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນເພື່ອຄວາມປອດໄພ!",
        });
    }

    // 4. ກວດສອບວ່າ Username ນີ້ມີຢູ່ໃນລະບົບແລ້ວຫຼືບໍ່ (Manual Check)
    const [existingUser] = await db.query(
      "SELECT username FROM tb_user WHERE username = ?",
      [username],
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "Username ນີ້ຖືກໃຊ້ໄປແລ້ວ, ກະລຸນາໃຊ້ຊື່ໃໝ່!" });
    }

    // 2. Hash Password ເພື່ອຄວາມປອດໄພ
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. ບັນທຶກລົງຖານຂໍ້ມູນ
    const sql =
      "INSERT INTO tb_user (fullname, username, password, role) VALUES (?, ?, ?, ?)";
    await db.query(sql, [fullname, username, hashedPassword, role || "Sale"]);

    res.status(201).json({ message: "✅ ລົງທະບຽນສຳເລັດແລ້ວ!" });
  } catch (err) {
    // ກວດສອບຖ້າ Username ຊໍ້າກັນ (Duplicate Entry)
    if (err.errno === 1062) {
      return res.status(400).json({ message: "Username ນີ້ຖືກໃຊ້ແລ້ວ!" });
    }
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// --- ຟັງຊັນ Login ---
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. ກວດສອບຂໍ້ມູນເບື້ອງຕົ້ນ [cite: 37]
        if (!username || !password) {
            return res.status(400).json({ message: "ກະລຸນາປ້ອນ Username ແລະ Password!" });
        }

        // 2. ຄົ້ນຫາ User ໃນຖານຂໍ້ມູນ [cite: 31, 33]
        const [users] = await db.query("SELECT * FROM tb_user WHERE username = ?", [username]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: "ບໍ່ພົບຊື່ຜູ້ໃຊ້ນີ້ໃນລະບົບ!" });
        }

        const user = users[0];

        // 3. ກວດສອບ Password ໂດຍໃຊ້ bcrypt [cite: 1, 30]
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ!" });
        }

        // 4. ສ້າງ JWT Token [cite: 7, 33]
        const token = jwt.sign(
            { id: user.user_id, username: user.username, role: user.role },
            process.env.JWT_SECRET, // ໃຊ້ Key ຈາກ .env 
            { expiresIn: '4h' } // Token ມີອາຍຸ 4 ມື້
        );

        // 5. ສົ່ງຂໍ້ມູນກັບໄປ (ຍົກເວັ້ນ Password)
        res.json({
            message: "✅ ເຂົ້າສູ່ລະບົບສຳເລັດ!",
            token: token,
            user: {
                id: user.user_id,
                fullname: user.fullname,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Login Error:", err); // Error Logging [cite: 39]
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};