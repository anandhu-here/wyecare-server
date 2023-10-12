const { verifyToken, checkShiftAssign, upload } = require("../controller/util");
const { isAuth, isHome, isAdmin } = require("../middlewares/auth");
const shift = require("../models/shift");

module.exports = (app, db, io) =>{

app.post('/test/publish-shift', async (req, res) => {
  const { homeID, shiftDate, shiftType, availableSlots } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO shifts (home_id, shift_date, shift_type, available_slots) VALUES ($1, $2, $3, $4) RETURNING shift_id',
      [homeID, shiftDate, shiftType, availableSlots]
    );
    res.status(201).json({ shiftID: result.rows[0].shift_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

}