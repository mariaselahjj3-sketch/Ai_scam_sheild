const { check } = require("./_check");
module.exports = async (req, res) => {
  const b = req.body || {};
  const inv = { sender: String(b.sender || ""), amount: Number(b.amount) || 0, message: String(b.message || "") };
  res.status(200).json(await check(inv));
};
