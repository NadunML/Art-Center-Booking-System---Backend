
const express = require("express");

const router = express.Router();

router.use((req, res) => {
  res.status(501).json({
    success: false,
    message:
      "Booking API is not enabled yet. University SSO authentication and secure PDF uploads must be configured first.",
  });
});

module.exports = router;
