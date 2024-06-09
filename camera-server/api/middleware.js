const TokenService = require("./models/token");

const allowAuthenticatedUser = async (req, res, next) => {
  // Extract the token from the authorization header
  let tokenId = req.get("authorization");

  // Remove any 'Bearer ' prefix if it exists
  if (tokenId && tokenId.startsWith("Bearer ")) {
    tokenId = tokenId.slice(7, tokenId.length);
  }


  if (!tokenId) {
    console.log("No token id found");
    return errorHandle(res, "Token missing", 401);
  }

  try {
    const tokenService = new TokenService(req.app);
    const result = await tokenService.load(tokenId);
    if (!result) {
      console.log("Token verify error");
      return errorHandle(res, "Access denied", 401);
    }
    console.log("Token verified successfully");
    req.ctx = { token: result };
    next();
  } catch (err) {
    console.log("Token verify error:", err);
    return errorHandle(res, "Access denied", 401);
  }
};

const errorHandle = (res, errorMessage, code = 500) => {
  return res.status(code).json({ error: { message: errorMessage } });
};

const responseHandle = (res, data, code = 200) => {
  return res.status(code).json(data);
};

module.exports = {
  allowAuthenticatedUser,
  errorHandle,
  responseHandle,
};
