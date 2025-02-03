import { useState, useEffect } from "react";
import { saveInvoice, getItems, updateInvoice, deleteInvoice } from "./api";
import { FaShoppingCart } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { IoMdAdd } from "react-icons/io";
import { MdOutlineSaveAlt } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";
import { MdDelete } from "react-icons/md";
import { IoPrint } from "react-icons/io5";
import { FaFileInvoice } from "react-icons/fa6";

const App = () => {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [dateOfSale, setDateOfSale] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [selectedItem, setSelectedItem] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [cart, setCart] = useState([]);
  const [storeItems, setStoreItems] = useState([]);

  useEffect(() => {
    async function fetchStoreItems() {
      const items = await getItems();
      setStoreItems(items);
    }
    fetchStoreItems();
  }, []);

  const handleItemChange = (event) => {
    const itemName = event.target.value;
    setSelectedItem(itemName);

    const selected = storeItems.find((item) => item.name === itemName);
    if (selected) {
      setPrice(selected.price);
    }
  };

  const handleAddItem = () => {
    if (!selectedItem || price <= 0 || quantity < 1) return;

    const newItem = {
      name: selectedItem,
      price: price,
      quantity: quantity,
      total: price * quantity,
    };

    setCart([...cart, newItem]);
    setSelectedItem("");
    setPrice(0);
    setQuantity(1);
  };

  const handleSaveInvoice = async () => {
    if (!invoiceNo || !customerName || !dateOfSale || cart.length === 0) {
      alert("Please fill out all required fields and add at least one item.");
      return;
    }

    const invoice = {
      invoiceNo,
      customerName,
      dateOfSale,
      items: cart,
      discount,
      netPrice: totalPrice - discount,
    };

    try {
      const response = await saveInvoice(invoice);
      console.log(response.message);
      alert("Invoice saved successfully!");

      setInvoiceNo("");
      setCustomerName("");
      setDateOfSale(new Date().toISOString().split("T")[0]);
      setCart([]);
      setDiscount(0);
    } catch (error) {
      console.error("Error saving invoice:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Failed to save invoice. Please try again.";

      alert(`Error: ${errorMessage}`);
    }
  };

  const handleUpdateInvoice = async () => {
    if (!invoiceNo || cart.length === 0) {
      alert(
        "Please select an invoice to update and ensure there are items in the cart."
      );
      return;
    }

    const updatedInvoice = {
      customerName,
      dateOfSale,
      items: cart,
      discount,
      netPrice: totalPrice - discount,
    };

    try {
      const response = await updateInvoice(invoiceNo, updatedInvoice);
      console.log(response.message);
      alert("Invoice updated successfully!");
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert(
        `Error: ${error.response?.data?.message || "Failed to update invoice"}`
      );
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceNo) {
      alert("Please enter an invoice number to delete.");
      return;
    }

    try {
      const response = await deleteInvoice(invoiceNo);
      console.log(response.message);
      alert(` ${response.message}`);

      setInvoiceNo("");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert(
        ` Error: ${error.response?.data?.message || "Failed to delete invoice"}`
      );
    }
  };

  const handlePrintInvoice = () => {
    handleSaveInvoice();
    const printContent = document.getElementById("invoice-section").innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();

    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.total, 0);
  const finalAmount = totalPrice - discount;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <div className="flex flex-row gap-5 items-center">
        <div className="flex-col">
          <h1 className="text-3xl font-bold text-blue-600">ABC SHOP</h1>
          <h2 className="text-xl font-semibold text-blue-400">
            1/2 Dhanmondi, Dhaka
          </h2>
        </div>
        <FaShop className="text-green-500 w-[65px] h-[65px]" />
      </div>

      {/* Invoice Form */}
      <div className="shadow rounded-lg flex flex-col w-[80%] mt-10 p-4 bg-white border border-gray-300">
        <div className="flex justify-between gap-5 mx-2 my-4 items-center">
          <label className="text-base font-semibold">Invoice No</label>
          <input
            className="border p-2 rounded w-[75%]"
            placeholder="Invoice No"
            onChange={(e) => setInvoiceNo(e.target.value)}
          />
        </div>
        <div className="flex justify-between gap-5 mx-2 my-4 items-center">
          <label className="text-base font-semibold">Customer Name</label>
          <input
            className="border p-2 rounded w-[75%]"
            placeholder="Customer Name"
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="flex justify-between gap-5 mx-2 my-4 items-center">
          <label className="text-base font-semibold">Date of Sale</label>
          <input
            type="date"
            className="border p-2 rounded w-[75%]"
            value={dateOfSale}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDateOfSale(e.target.value)}
          />
        </div>
      </div>

      {/* Item Selection Form */}
      <div className="items-center justify-center rounded-lg flex  w-[80%] mt-6 p-4 gap-4">
        <div className="flex justify-between gap-5 mx-2 my-4 items-center">
          <label className="text-base font-semibold">Item</label>
          <select
            className="border p-2 rounded w-[90%]"
            value={selectedItem}
            onChange={handleItemChange}
          >
            <option value="">Select Item</option>
            {storeItems.map((item, index) => (
              <option key={index} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between gap-5 mx-2 my-4 items-center w-[20%]">
          <label className="text-base font-semibold">Price</label>
          <input
            type="number"
            className="border p-2 rounded w-[75%]"
            value={price}
            readOnly
          />
        </div>

        <div className="flex justify-between gap-5 mx-2 my-4 items-center w-[20%]">
          <label className="text-base font-semibold">Quantity</label>
          <input
            type="number"
            className="border p-2 rounded w-[75%]"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-1 hover:cursor-pointer shadow-md"
          onClick={handleAddItem}
        >
          Add
          <IoMdAdd />
        </button>
      </div>

      <div className="mt-6 w-[80%] bg-white p-4 rounded shadow border border-gray-300">
        <h2 className="text-xl font-bold mb-2 flex gap-2 items-center">
          Cart <FaShoppingCart />
        </h2>
        {cart.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-2">Item</th>
                <th className="p-2">Price</th>
                <th className="p-2">Quantity</th>
                <th className=" p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr
                  key={index}
                  className={`text-center ${
                    index % 2 != 0 ? "bg-slate-100" : ""
                  }`}
                >
                  <td className=" p-2">{item.name}</td>
                  <td className=" p-2">{item.price}</td>
                  <td className=" p-2">{item.quantity}</td>
                  <td className="p-2">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No items added</p>
        )}

        {/* Discount & Final Price */}
        <div className="mt-6 w-[40%]   rounded float-right">
          <div className="flex justify-between gap-5 px-2 py-4 my-4 items-center text-green-700 p-3 w-full">
            <label className="text-base font-semibold">Discount</label>
            <input
              type="number"
              className="border p-2 rounded w-[75%] bg-green-100"
              value={discount}
              min="0"
              max={totalPrice}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>

          <h3 className="text-md font-bold px-2 my-4">
            Net Price: {finalAmount}
          </h3>
        </div>
      </div>
      <div className="flex justify-around w-[80%] my-4">
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center gap-1 hover:cursor-pointer shadow-md border border-gray-400"
          onClick={handleUpdateInvoice}
        >
          Update
          <RxUpdate />
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-1 hover:cursor-pointer shadow-md border border-gray-400"
          onClick={handleDeleteInvoice}
        >
          Delete
          <MdDelete />
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-1 hover:cursor-pointer shadow-md border border-gray-400"
          onClick={handleSaveInvoice}
        >
          Save
          <MdOutlineSaveAlt />
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-1 hover:cursor-pointer shadow-md border border-gray-400"
          onClick={handlePrintInvoice}
        >
          Print
          <IoPrint />
        </button>
      </div>

      <div
        id="invoice-section"
        className="mt-6 w-[80%] bg-white p-6 rounded-lg shadow-lg border border-gray-300 hidden"
      >
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-600 flex gap-2 items-center flex gap-2">
              <FaFileInvoice /> Invoice Details
            </h2>
            <p className="text-gray-600">
              Thank you for shopping with ABC SHOP
            </p>
          </div>
          <FaShop className="text-green-500 w-[50px] h-[50px]" />
        </div>

        {/* Invoice Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <p className="text-lg">
            <strong>Invoice No:</strong> {invoiceNo}
          </p>
          <p className="text-lg">
            <strong>Date of Sale:</strong> {dateOfSale}
          </p>
          <p className="text-lg">
            <strong>Customer Name:</strong> {customerName}
          </p>
        </div>

        {/* Cart Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-blue-100 text-gray-700">
                <th className="border p-3">Item</th>
                <th className="border p-3">Price</th>
                <th className="border p-3">Quantity</th>
                <th className="border p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr
                  key={index}
                  className={`text-center ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <td className="border p-3">{item.name}</td>
                  <td className="border p-3">${item.price}</td>
                  <td className="border p-3">{item.quantity}</td>
                  <td className="border p-3">${item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-end mt-6">
          <div className="flex justify-between w-[50%] bg-green-100 text-green-700 p-3 rounded">
            <span className="font-semibold">Discount:</span>
            <span>${discount}</span>
          </div>
          <div className="flex justify-between w-[50%] bg-gray-200 text-gray-800 p-3 rounded mt-2 font-bold">
            <span>Net Price:</span>
            <span>${totalPrice - discount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
