const supabase = require("../config/supabase");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Login required" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Login required" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  next();
}

module.exports = authMiddleware;

/*
EXPLANATION:
I created an authentication middleware to protect backend routes. 
The frontend sends a Supabase access token in the Authorization header 
using the Bearer scheme. My middleware extracts the token and verifies it 
using Supabase's getUser() method. If the token is invalid or expired, 
I return a 401 response. If it is valid, I attach the authenticated user to 
the request object as req.user and call next(), allowing the request to 
continue to the protected route.
*/
