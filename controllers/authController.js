import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

console.log(orderModel);
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    // Validations
    if (!name || !email || !password || !phone || !address || !answer) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User already registered, please login",
      });
    }

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // Save User
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error: error.message,
    });
  }
};

//POST LOGIN
// JWT को बिना सर्वर से हर बार कनेक्ट किए एक सुरक्षित और छोटे रूप में यूज़र की जानकारी देने के लिए डिज़ाइन किया गया है। पेलोड के अंदर यूज़र की ID, email, role, आदि को रखने से हमें बार-बार डेटाबेस में जाकर यूज़र की जानकारी प्राप्त करने की आवश्यकता नहीं होती। यह यूज़र को तुरंत ऑथेंटिकेट करने में मदद करता है।
// JWT को एक स्मार्ट टोकन के रूप में देखा जा सकता है, जिसमें यूज़र की जानकारी एन्कोड की जाती है और सर्वर को हर बार डेटाबेस में जाकर उसे एक्सेस करने की आवश्यकता नहीं होती। इससे सिस्टम की प्रदर्शन (performance) में सुधार होता है, खासकर जब सर्वर पर बहुत ज़्यादा लोड हो।
//hum  सर्वर के साथ हर बार कनेक्ट किए बिना यूज़र को पहचान सकें और उसे सही अनुमति दे सकें। यह सुरक्षा, प्रदर्शन, और कनेक्शन के समय को बेहतर बनाने में मदद करता है।

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if user exists in the database
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    // Compare provided password with stored hashed password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = await JWT.sign(
      { _id: user.id, email: user.email, role: user.role }, // Payload
      process.env.JWT_SECRET, // Secret key from environment
      { expiresIn: "7d" } // Token expiration time (7 days)
    );

    // Send response with user details and token
    res.status(200).send({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    // Handle server errors
    res.status(500).send({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
};

//forgotPasswordController

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    // Validations
    if (!email) {
      return res.status(400).send({ message: "Email is Required" });
    }

    if (!answer) {
      return res.status(400).send({ message: "Answer is Required" });
    }

    if (!newPassword) {
      return res.status(400).send({ message: "New Password is Required" });
    }

    // Check if user exists with given email and answer
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email or Answer",
      });
    }

    // Hash the new password
    const hashed = await hashPassword(newPassword);

    // Update password in the database
    await userModel.findByIdAndUpdate(user._id, { password: hashed });

    // Send success response
    return res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//test controller
export const testController = (req, res) => {
  res.send("protected route");
};

//update Profile Controller
export const updateProfileController = async (req, res) => {
  try {
    const { name, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ पासवर्ड वैधता चेक करें
    let hashedPassword = user.password;
    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }
      hashedPassword = await hashPassword(password);
    }

    // ✅ यूज़र अपडेट करें
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword, // ✅ अगर पासवर्ड अपडेट करना है तो नया पासवर्ड
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while updating profile",
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 }); // Sorting by newest orders first

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Error while fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error while getting orders",
      error: error.message,
    });
  }
};

// export const getOrdersController = async (req, res) => {
//   try {
//     const orders = await orderModel
//       .find({ buyer: req.user._id })
//       .populate("products.product", "name price") // ✅ अब product सही से populate होगा
//       .populate("buyer", "name")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       message: "Orders fetched successfully",
//       orders,
//     });
//   } catch (error) {
//     console.error("Error while fetching orders:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error while getting orders",
//       error: error.message,
//     });
//   }
// };




//All-orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 }); // Sorting by newest orders first

    res.status(200).json({
      success: true,
      message: "All-Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Error while fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error while getting orders",
      error: error.message,
    });
  }
};

// order Status Controller

// export const orderStatusController = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;
//     const orders = await orderModel.findByIdAndUpdate(
//       orderId,
//       { status },
//       { new: true }
//     );
//     res.status(orders);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error while updateing Order",
//       error,
//     });
//   }
// };
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // ऑर्डर अपडेट करें
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    // अगर ऑर्डर नहीं मिला
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // सफलतापूर्वक अपडेट होने पर प्रतिक्रिया भेजें
    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error while updating order",
      error: error.message,
    });
  }
};
