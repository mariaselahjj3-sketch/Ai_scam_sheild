const RULES = [
  [/gift ?card|bitcoin|crypto|wire transfer|western union/i, 35, "Asks for an unusual payment method"],
  [/urgent|immediately|within 24 ?h|final notice|act now|suspend/i, 25, "Uses urgent or threatening language"],
  [/verify your account|password|otp|login/i, 30, "Asks for account details"],
  [/bit\.ly|tinyurl|http:\/\//i, 20, "Contains a suspicious link"],
  [/refund|overpa(id|yment)|lottery|prize|inheritance/i, 25, "Mentions refund or prize bait"]
];
const label = s => (s < 35 ? "Safe" : s < 70 ? "Suspicious" : "Danger");
