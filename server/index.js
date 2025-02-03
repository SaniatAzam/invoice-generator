const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const ItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const Item = mongoose.model("Item", ItemSchema, "Items");

const InvoicedItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  total: Number,
});

const InvoiceScehma = new mongoose.Schema({
  invoiceNo: String,
  customerName: String,
  dateOfSale: { type: Date, default: Date.now },
  items: [InvoicedItemSchema],
  discount: Number,
  netPrice: Number,
});

const Invoice = mongoose.model("Invoice", InvoiceScehma, "Invoices");

// Routes
app.post("/save-invoice", async (req, res) => {
  try {
    const { invoiceNo, customerName, dateOfSale, items, discount, netPrice } =
      req.body;

    const existingInvoice = await Invoice.findOne({ invoiceNo });
    if (existingInvoice) {
      return res.status(400).json({
        message:
          "Invoice number already exists. Please use a unique invoice number.",
      });
    }

    const newInvoice = new Invoice({
      invoiceNo,
      customerName,
      dateOfSale,
      items,
      discount,
      netPrice,
    });

    await newInvoice.save();
    res.json({ message: "Invoice saved successfully", newInvoice });
  } catch (error) {
    console.error("Error saving invoice:", error);
    res
      .status(500)
      .json({ message: "Failed to save invoice", error: error.message });
  }
});

app.put("/update-invoice/:invoiceNo", async (req, res) => {
  try {
    const { invoiceNo } = req.params;
    const { customerName, dateOfSale, items, discount, netPrice } = req.body;

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { invoiceNo },
      { customerName, dateOfSale, items, discount, netPrice },
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found!" });
    }

    res.json({ message: "Invoice updated successfully!", updatedInvoice });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res
      .status(500)
      .json({ message: "Failed to update invoice", error: error.message });
  }
});

app.delete("/delete-invoice/:invoiceNo", async (req, res) => {
  try {
    const { invoiceNo } = req.params;

    const existingInvoice = await Invoice.findOne({ invoiceNo });

    if (!existingInvoice) {
      return res.status(404).json({ message: "Invoice not found!" });
    }

    await Invoice.deleteOne({ invoiceNo });

    res.json({ message: `Invoice ${invoiceNo} deleted successfully!` });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res
      .status(500)
      .json({ message: "Failed to delete invoice", error: error.message });
  }
});

app.get("/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.listen(process.env.PORT, () =>
  console.log("Server running on port " + process.env.PORT)
);
