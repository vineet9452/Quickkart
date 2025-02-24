import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  brainTreePaymentController,
  braintreeTokenController,
  createProductController,
  // createRazorpayOrder,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFilterController,
  productListController,
  productPhotoController,
  // razorpayPaymentController,
  relatedProductController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";
import formidable from "express-formidable";

const router = express.Router();

//routes
//create product
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

//update producct
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//get  product
router.get("/get-product", getProductController);

//single  product
router.get("/get-product/:slug", getSingleProductController);

//get photo
router.get("/product-photo/:pid", productPhotoController);

//delete product
router.delete("/delete-product/:pid", deleteProductController);

//filter product
router.post("/product-filters", productFilterController);

//product count(for load more..)
router.get("/product-count", productCountController);

//product per Page
router.get("/product-list/:page", productListController);

//search product
router.get("/search/:keyword", searchProductController);

//similar product
// router.get('/releted-product/:pid/:cid',realtedProductController)
router.get("/related-product/:pid/:cid", relatedProductController);

//Category wise product
router.get("/product-category/:slug", productCategoryController);

// //payments routes
//token
router.get("/braintree/token", braintreeTokenController);

//payments
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);

// router.post("/razorpay/order", createRazorpayOrder);

// 🆕 Razorpay Payment Verification (पेमेंट Success होने पर इसे कॉल करो)
// router.post("/razorpay/payment", requireSignIn, razorpayPaymentController);


export default router;
