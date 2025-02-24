import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// // Protected route middleware
export const requireSignIn = async (req, res, next) => {
  try {
    // Authorization हेडर से Bearer token प्राप्त करें
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token को अलग करें

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Access Denied! No token provided",
      });
    }

    // Token को verify करें
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Decoded user data को request object में स्टोर करें

    next(); // आगे बढ़ाएं
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};




// //admin access
// export const isAdmin = (req, res, next) => {
//   try {
//     if (!req.user) {
//       return res.status(401).send({
//         success: false,
//         message: "Unauthorized Access - No user found",
//       });
//     }
//     if (req.user.role !== 1) {
//       return res.status(403).send({
//         success: false,
//         message: "Access denied. Admins only!",
//       });
//     }

//     next(); // आगे बढ़ाएँ अगर यूज़र एडमिन है
//   } catch (error) {
//     console.error("Admin Access Error:", error);
//     res.status(500).send({
//       success: false,
//       message: "Error in admin middleware",
//       error,
//     });
//   }
// };


// // Admin access middleware
// export const isAdmin = (req, res, next) => {
//   try {
//     if (!req.user) {
//       return res.status(401).send({
//         success: false,
//         message: "Unauthorized Access - No user found",
//       });
//     }
//     if (req.user.role !== 1) {
//       return res.status(403).send({
//         success: false,
//         message: "Access denied. Admins only!",
//       });
//     }

//     next(); // Admin के रूप में proceed करें
//   } catch (error) {
//     console.error("Admin Access Error:", error);
//     res.status(500).send({
//       success: false,
//       message: "Error in admin middleware",
//       error,
//     });
//   }
// };

// import JWT from "jsonwebtoken";
// import userModel from "../models/userModel.js";

// //Protected Routes token base
// export const requireSignIn = async (req, res, next) => {
//   try {
//     const decode = JWT.verify(
//       req.headers.authorization,
//       process.env.JWT_SECRET
//     );
//     req.user = decode;
//     next();
//   } catch (error) {
//     console.log(error);
//   }
// };

// //admin acceess
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",
    });
  }
};
