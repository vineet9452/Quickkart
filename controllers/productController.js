import slugify from "slugify";
import productModel from "../models/productModel.js";
import fs from "fs";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});
console.log("Merchant ID:", process.env.BRAINTREE_MERCHANT_ID);
console.log("Public Key:", process.env.BRAINTREE_PUBLIC_KEY);
console.log("Private Key:", process.env.BRAINTREE_PRIVATE_KEY);

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // ✅ Validation
    if (!name) return res.status(400).send({ error: "Name is Required" });
    if (!description)
      return res.status(400).send({ error: "Description is Required" });
    if (!price) return res.status(400).send({ error: "Price is Required" });
    if (!category)
      return res.status(400).send({ error: "Category is Required" });
    if (!quantity)
      return res.status(400).send({ error: "Quantity is Required" });
    if (photo && photo.size > 1000000) {
      return res.status(400).send({ error: "Photo should be less than 1MB" });
    }

    // ✅ Slug को unique बनाने के लिए generate करें
    let slug = slugify(name, { lower: true, strict: true });

    // ✅ Check if slug already exists
    let existingProduct = await productModel.findOne({ slug });
    if (existingProduct) {
      // अगर slug पहले से मौजूद है, तो एक नया slug बनाने के लिए एक unique identifier जोड़ें
      slug = `${slug}-${Date.now()}`;
    }

    // ✅ नया प्रोडक्ट बनाना
    const product = new productModel({
      name,
      slug,
      description,
      price,
      category,
      quantity,
      shipping,
    });

    // ✅ फोटो को MongoDB में स्टोर करना
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    console.log("Create Product Error:", error);
    res
      .status(500)
      .send({ success: false, message: "Error in creating product", error });
  }
};

// Get all Products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category") // Populate category details from Category model
      .select("-photo") // Exclude 'photo' field from the response
      .limit(10) // You can change the number of products per page here
      .sort({ createdAt: -1 }); // Sort by creation date, latest first

    res.status(200).send({
      success: true,
      totalCount: products.length,
      message: "All Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching products",
      error: error.message,
    });
  }
};

//get Single Product

export const getSingleProductController = async (req, res) => {
  try {
    // Find product by slug and populate category
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo") // Exclude photo field
      .populate("category"); // Populate category field with related data

    // If product not found
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // If product is found, send the response
    res.status(200).send({
      success: true,
      message: "Single product fetched successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching product",
      error: error.message,
    });
  }
};

// get photo

export const productPhotoController = async (req, res) => {
  try {
    // Find the product by its ID
    const product = await productModel.findById(req.params.pid).select("photo");
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    if (product.photo && product.photo.data) {
      res.set("Content-Type", product.photo.contentType); // Set the correct content type
      return res.status(200).send(product.photo.data); // Send the photo data
    }

    // If the product does not have a photo, return a message
    return res.status(404).send({
      success: false,
      message: "Photo not found for this product",
    });
  } catch (error) {
    // Handle errors and send a response
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in fetching product photo",
      error: error.message,
    });
  }
};

//delete Product Controller

export const deleteProductController = async (req, res) => {
  try {
    // Find product by ID and delete
    const product = await productModel.findByIdAndDelete(req.params.pid);

    // If product not found, return 404
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // If product deleted successfully, send success message
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    // Handle any errors and send error response
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting product",
      error: error.message,
    });
  }
};

//update Product Controller

export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // ✅ Validation
    if (!name) return res.status(400).send({ error: "Name is Required" });
    if (!description)
      return res.status(400).send({ error: "Description is Required" });
    if (!price) return res.status(400).send({ error: "Price is Required" });
    if (!category)
      return res.status(400).send({ error: "Category is Required" });
    if (!quantity)
      return res.status(400).send({ error: "Quantity is Required" });
    if (photo && photo.size > 1000000) {
      return res.status(400).send({ error: "Photo should be less than 1MB" });
    }

    // ✅ प्रोडक्ट को अपडेट करें
    const product = await productModel.findByIdAndUpdate(
      req.params.pid,
      {
        ...req.fields,
        slug: name ? slugify(name) : undefined, // Name होने पर ही slug अपडेट करें
      },
      { new: true, runValidators: true } // `runValidators` सुनिश्चित करता है कि स्कीमा वैलिडेशन हो
    );

    // यदि प्रोडक्ट नहीं मिला
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ फोटो को MongoDB में स्टोर करना
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
      await product.save(); // फोटो अपडेट करने के बाद सेव करें
    }

    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in updating product",
      error: error.message,
    });
  }
};

//productFilterController

export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length > 0) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while Filtering Products",
      error,
    });
  }
};

// productCountController
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.countDocuments(); // सटीक कुल उत्पादों की संख्या
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in fetching product count",
      error,
      success: false,
    });
  }
};

// product List Controller
export const productListController = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? req.params.page : 1;

    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    const totalProducts = await productModel.countDocuments(); // कुल उत्पादों की संख्या

    res.status(200).send({
      success: true,
      products,
      total: totalProducts, // कुल उत्पादों की संख्या भी भेजें
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in pagination",
      error,
      success: false,
    });
  }
};

export const searchProductController = async (req, res) => {
  try {
    console.log("Incoming request params:", req.params); // 🐞 Debugging

    const { keyword } = req.params;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required",
      });
    }

    // MongoDB Query
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");

    console.log("Search results:", results); // 🐞 Debugging

    res.status(200).json(results);
  } catch (error) {
    console.error("Search API Error:", error); // 🐞 Debugging
    res.status(500).send({
      success: false,
      message: "Internal Server Error in Search API",
      error: error.message,
    });
  }
};

//related Product Controller

export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;

    // प्रोडक्ट खोजें, जो उसी कैटेगरी के हों लेकिन `pid` से अलग हों
    const products = await productModel
      .find({ category: cid, _id: { $ne: pid } })
      .select("-photo")
      .limit(3)
      .populate("category");

    // Response भेजें
    res.status(200).send({
      success: true,
      // count: products.length,
      message: "Related products fetched successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while getting related products",
      error,
    });
  }
};

//product Category Controller
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while Getting products",
      error,
    });
  }
};

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
