import { asyncHandler } from "../Utils/AsyncHandler.js";

// controller for register

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "SERVER CHECK !!",
  });
});

// exporting methods
export { registerUser };
