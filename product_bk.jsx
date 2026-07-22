import { useState, useEffect } from "react";

import * as productApi from "../api/productApi";

import * as categoryApi from "../api/categoryApi";

import { toast } from "react-toastify";



const ProductPage = () => {

const [products, setProducts] = useState([]);

const [categories, setCategories] = useState([]); // State ສໍາລັບເກັບລາຍຊື່ປະເພດສິນຄ້າ

const [isLoading, setIsLoading] = useState(false);

const [search, setSearch] = useState("");

const [isModalOpen, setIsModalOpen] = useState(false);

const [formData, setFormData] = useState({

barcode: "",

category_id: "",

brand_name: "",

product_name: "",

serial_number: "",

cost_price: "0",

sale_price: "0",

stock_qty: "0",

old_price: "0",

detail: "",

});

const [image, setImage] = useState(null);

const [imagePreview, setImagePreview] = useState(null);



// ດຶງຂໍ້ມູນສິນຄ້າ

const fetchProducts = async () => {

try {

const res = await productApi.getProducts(search);

setProducts(res.data);

} catch (err) {

toast.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນສິນຄ້າໄດ້");

}

};

const fetchCategories = async () => {

setIsLoading(true);

try {

// ປ່ຽນ URL ນີ້ເປັນ API ຕົວຈິງຂອງທ່ານ

const res = await categoryApi.getCategories();

setCategories(res.data);

} catch (error) {

console.error("Fetch error:", error);

} finally {

setIsLoading(false);

}

};



useEffect(() => {

fetchProducts();

fetchCategories();

}, [search]);



const handleSave = async (e) => {

e.preventDefault();

console.log("FormData:", formData);



const data = new FormData();

Object.keys(formData).forEach((key) => data.append(key, formData[key]));

if (image) data.append("image", image);



// try {

// await productApi.createProduct(data);

// toast.success("ບັນທຶກສິນຄ້າສຳເລັດ");

// setIsModalOpen(false);

// fetchProducts();

// } catch (err) {

// // ວິທີການດຶງ Error Message ໃຫ້ຖືກຕ້ອງ

// const errorMsg = err.response?.data?.message || "ຜິດພາດໃນການບັນທຶກ";



// toast.error(errorMsg);

// console.error(err);

// }

try {

if (editId) {

// ຖ້າມີ editId ໃຫ້ເອີ້ນ API Update

await productApi.updateProduct(editId, data);

toast.success("ແກ້ໄຂຂໍ້ມູນສຳເລັດ");

} else {

// ຖ້າບໍ່ມີໃຫ້ເອີ້ນ API Create

await productApi.createProduct(data);

toast.success("ບັນທຶກສິນຄ້າສຳເລັດ");

}

closeForm();

fetchProducts();

} catch (err) {

toast.error(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");

}

};



const [editId, setEditId] = useState(null); // ຖ້າເປັນ null ແປວ່າ "ເພີ່ມ", ຖ້າເປັນ ID ແປວ່າ "ແກ້ໄຂ"



// Function ເມື່ອກົດປຸ່ມ ແກ້ໄຂ

const handleEdit = (product) => {

setEditId(product.product_id);

setFormData({

barcode: product.barcode || "",

category_id: product.category_id || "",

brand_name: product.brand_name || "",

product_name: product.product_name || "",

serial_number: product.serial_number || "",

cost_price: product.cost_price || 0,

sale_price: product.sale_price || 0,

stock_qty: product.stock_qty || 0,

detail: product.detail || "",

});

// ສະແດງຮູບເກົ່າເປັນ Preview

setImagePreview(`http://localhost:3300/uploads/${product.image}`);

setIsModalOpen(true);

};



const handleImageChange = (e) => {

const file = e.target.files[0];

if (file) {

setImage(file);

// ສ້າງ URL ສໍາລັບຮູບຕົວຢ່າງ

const reader = new FileReader();

reader.onloadend = () => {

setImagePreview(reader.result);

};

reader.readAsDataURL(file);

} else {

setImage(null);

setImagePreview(null);

}

};



const closeForm = async () => {

setIsModalOpen(false);

setImagePreview(null);

};

return (

<div className="space-y-6 font-lao">

<div className="flex justify-between items-center">

<h2 className="text-2xl font-bold text-gray-800">ຈັດການສິນຄ້າ</h2>

<button

onClick={() => setIsModalOpen(true)}

className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg shadow-md transition"

>

<i className="fas fa-plus mr-1"></i>ເພີ່ມສິນຄ້າ

</button>

</div>



{/* Search Bar */}

<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">

<div className="relative max-w-md">

<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">

<i className="fas fa-search"></i>

</span>

<input

type="text"

placeholder="ຄົ້ນຫາສິນຄ້າ..."

className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"

onChange={(e) => setSearch(e.target.value)}

/>

</div>

</div>



{/* Table */}

<div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">

<table className="w-full text-left">

<thead className="bg-gray-50 border-b border-gray-100">

<tr>

<th className="p-4 font-semibold text-gray-600">ຮູບ</th>

<th className="p-4 font-semibold text-gray-600">ຊື່ສິນຄ້າ</th>

<th className="p-4 font-semibold text-gray-600">ລາຄາຂາຍ</th>

<th className="p-4 font-semibold text-gray-600">ຄົງເຫຼືອ</th>

<th className="p-4 font-semibold text-gray-600">ຈັດການ</th>

</tr>

</thead>

<tbody>

{products.map((product) => (

<tr

key={product.product_id}

className="border-b border-gray-50 hover:bg-gray-50 transition"

>

<td className="p-4">

<img

src={`http://localhost:3300/uploads/${product.image}`}

alt={product.product_name}

className="p-1 w-14 h-14 object-cover rounded-lg border"

onError={(e) =>

(e.target.src = "https://via.placeholder.com/50")

}

/>

</td>

<td className="p-4 font-medium">{product.product_name}</td>

<td className="p-4 text-orange-600 font-bold">

{Number(product.sale_price).toLocaleString()} ກີບ

</td>

<td className="p-4">

<span

className={`px-3 py-1 rounded-full text-xs ${product.stock_qty <= 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}

>

{product.stock_qty} ຊິ້ນ

</span>

</td>

<td className="p-4 space-x-2">

<button

onClick={() => handleEdit(product)}

className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition"

>

<i className="fas fa-edit"></i>

</button>

<button

onClick={() => {

if (window.confirm("ຢືນຢັນການລຶບ?"))

productApi

.deleteProduct(product.product_id)

.then(() => fetchProducts());

}}

className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"

>

<i className="fas fa-trash"></i>

</button>

</td>

</tr>

))}

</tbody>

</table>

</div>



{/* Modal (Simplfied Version) */}

{isModalOpen && (

<div className="fixed inset-0 z-50 flex items-center justify-center p-4">

{/* Overlay */}

<div

className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"

//onClick={() => setIsModalOpen(false)}

/>



{/* Modal Container */}

<div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

{/* Header (Fixed) */}

<div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">

<div>

<h3 className="text-xl font-bold text-gray-800">

{editId ? "ແກ້ໄຂຂໍ້ມູນສິນຄ້າ" : "ເພີ່ມສິນຄ້າໃໝ່"}

</h3>

</div>

<button

onClick={closeForm}

className="p-2 hover:bg-red-100 rounded-full transition-colors"

>

<svg

xmlns="http://www.w3.org/2000/svg"

width="24"

height="24"

viewBox="0 0 24 24"

fill="none"

stroke="currentColor"

strokeWidth="2"

strokeLinecap="round"

strokeLinejoin="round"

className="text-red-600"

>

<path d="M18 6 6 18" />

<path d="m6 6 12 12" />

</svg>

</button>

</div>



{/* Body (Scrollable) */}

<div className="p-8 overflow-y-auto custom-scrollbar">

<form

id="product-form"

onSubmit={handleSave}

className="space-y-6"

>

{/* Section: ຂໍ້ມູນຫຼັກ */}

<div className="space-y-4">

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

<div className="space-y-1.5">

<label className="text-sm font-semibold text-gray-700 ml-1">

ບາໂຄດ

</label>

<input

type="text"

value={formData.barcode}

placeholder="ບາໂຄດສິນຄ້າ..."

required

className="text-sm w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"

onChange={(e) =>

setFormData({ ...formData, barcode: e.target.value })

}

/>

</div>

<div className="space-y-1.5">

<label className="text-sm font-semibold text-gray-700 ml-1">

ປະເພດສິນຄ້າ

</label>

<div className="relative group">

<select

name="category_id" // 1. ຕ້ອງກຳນົດ name ໃຫ້ກົງກັບ State

value={formData.category_id} // 2. ໃຊ້ value ຜູກກັບ State (ສຳຄັນຫຼາຍສຳລັບຕອນ Edit)

onChange={(e) =>

setFormData({

...formData,

category_id: e.target.value,

})

}

defaultValue=""

required

className={`text-sm w-full p-3 pr-10 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none cursor-pointer`}

>

<option value="" disabled className="bg-gray-900">

{isLoading ? "ກຳລັງໂຫລດ..." : "-- ເລືອກປະເພດ --"}

</option>



{/* 2. Map ຂໍ້ມູນຈາກ State ມາເປັນ Options */}

{categories.map((cat, key) => (

<option key={key} value={cat.category_id}>

{cat.category_name}

</option>

))}

</select>

{/* ສັນຍາລັກ Dropdown (ລູກສອນ) */}

<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">

<svg

xmlns="http://www.w3.org/2000/svg"

width="18"

height="18"

viewBox="0 0 24 24"

fill="none"

stroke="currentColor"

strokeWidth="2.5"

strokeLinecap="round"

strokeLinejoin="round"

>

<path d="m6 9 6 6 6-6" />

</svg>

</div>

</div>

</div>

</div>



<div className="space-y-1.5">

<label className="text-sm font-semibold text-gray-700 ml-1">

ຊື່ສິນຄ້າ

</label>

<input

type="text"

value={formData.product_name}

placeholder="ຊື່ສິນຄ້າ..."

required

className="text-sm w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"

onChange={(e) =>

setFormData({

...formData,

product_name: e.target.value,

})

}

/>

</div>



<div className="space-y-1.5">

<label className="text-sm font-semibold text-gray-700 ml-1">

ແບຣນ (Brand)

</label>

<input

type="text"

value={formData.brand_name}

placeholder="ແບຣນສິນຄ້າ..."

className="text-sm w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"

onChange={(e) =>

setFormData({ ...formData, brand_name: e.target.value })

}

/>

</div>

</div>



<hr className="border-gray-100" />



{/* Section: ລາຄາ ແລະ SN */}

<div className="space-y-1.5">

<label className="text-sm font-semibold text-gray-700 ml-1">

S/N

</label>

<input

type="text"

value={formData.serial_number}

placeholder="Serial number..."

required

className="text-sm w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"

onChange={(e) =>

setFormData({

...formData,

serial_number: e.target.value,

})

}

/>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

<div className="space-y-1.5">

<label className="text-sm font-semibold text-gray-700 ml-1 text-orange-600">

ລາຄາທຶນ

</label>

<input

type="number"

value={formData.cost_price}

placeholder="0"

className="text-sm w-full p-3 bg-orange-50/50 border border-orange-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"

onChange={(e) =>

setFormData({ ...formData, cost_price: e.target.value })

}

/>

</div>

<div className="space-y-1.5">

<label className="text-sm font-semibold text-gray-700 ml-1 text-green-600">

ລາຄາຂາຍ

</label>

<input

type="number"

value={formData.sale_price}

placeholder="0"

className="text-sm w-full p-3 bg-green-50/50 border border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"

onChange={(e) =>

setFormData({ ...formData, sale_price: e.target.value })

}

/>

</div>

</div>



{/* ອັບໂຫລດຮູບ */}

<div className="space-y-1.5">

<label className="text-sm font-semibold text-gray-700 ml-1">

ຮູບພາບສິນຄ້າ

</label>

<div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-orange-400 transition-colors bg-gray-50/50 text-center cursor-pointer">

<input

type="file"

accept="image/*"

className="absolute inset-0 opacity-0 cursor-pointer"

onChange={handleImageChange} // ໃຊ້ handleImageChange

/>

<div className="flex flex-col items-center">

{imagePreview ? ( // ສະແດງຮູບຕົວຢ່າງຖ້າມີ

<img

src={imagePreview}

alt="Product Preview"

className="w-full max-h-30 object-contain mb-2 rounded-lg"

/>

) : (

// ສະແດງໄອຄອນຖ້າບໍ່ມີຮູບ

<>

<svg

className="w-10 h-10 text-gray-400 mb-2 group-hover:text-orange-500 transition-colors"

fill="none"

stroke="currentColor"

viewBox="0 0 24 24"

>

<path

strokeLinecap="round"

strokeLinejoin="round"

strokeWidth="2"

d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"

></path>

</svg>

<p className="text-sm text-gray-500">

ຄລິກເພື່ອເລືອກຮູບພາບ

</p>

</>

)}

</div>

</div>

</div>



<div className="space-y-1.5">

<label className="text-sm font-semibold text-gray-700 ml-1">

ລາຍລະອຽດ

</label>

<textarea

value={formData.detail}

rows="5"

className="text-sm w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"

placeholder="ລາຍລະອຽດສິນຄ້າ..."

onChange={(e) =>

setFormData({ ...formData, detail: e.target.value })

}

/>

{/* {formData.sale_price} */}

</div>

</form>

</div>



{/* Footer (Fixed) */}

<div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">

<button

type="button"

onClick={closeForm}

className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-all"

>

ຍົກເລີກ

</button>

<button

form="product-form"

type="submit"

className="px-10 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all"

>

ບັນທຶກ

</button>

</div>

</div>

</div>

)}

</div>

);

};



export default ProductPage;