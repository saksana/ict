// import React from "react";

// // ໃຊ້ forwardRef ເພື່ອໃຫ້ react-to-print ສາມາດຈັບ Element ໄປພິມໄດ້
// const InvoiceReceipt = React.forwardRef(({ orderData, customer, cartItems }, ref) => {
//   const currentDate = new Date().toLocaleString("lo-LA", {
//     timeZone: "Asia/Vientiane",
//   });

//   return (
//     <div ref={ref} className="p-4 bg-white text-black font-lao text-xs max-w-[80mm] mx-auto">
//       {/* Header ຮ້ານ */}
//       <div className="text-center space-y-1 mb-4">
//         <h2 className="text-sm font-black uppercase">E-Commerce MVP Shop</h2>
//         <p className="text-[10px] text-gray-600">ໂທ: 020 XXXXXXXX</p>
//         <p className="text-[10px] text-gray-600">ຍິນດີຕ້ອນຮັບ / ຂໍຂອບໃຈທີ່ໃຊ້ບໍລິການ</p>
//         <div className="border-b border-dashed border-gray-400 my-2"></div>
//       </div>

//       {/* ຂໍ້ມູນບິນ */}
//       <div className="space-y-1 text-[11px] mb-3">
//         <p><span className="font-bold">ວັນທີ:</span> {currentDate}</p>
//         <p><span className="font-bold">ພະນັກງານຂາຍ:</span> Admin (ID: 1)</p>
//         <p>
//           <span className="font-bold">ລູກຄ້າ:</span>{" "}
//           {customer ? customer.customer_name : "ລູກຄ້າທົ່ວໄປ"}
//         </p>
//         {customer?.phone && <p><span className="font-bold">ເບີໂທ:</span> {customer.phone}</p>}
//         <div className="border-b border-dashed border-gray-400 my-2"></div>
//       </div>

//       {/* ລາຍການສິນຄ້າ */}
//       <table className="w-full text-left text-[11px] mb-3">
//         <thead>
//           <tr className="font-bold border-b border-gray-300">
//             <th className="pb-1">ລາຍການ</th>
//             <th className="text-center pb-1">ຈຳນວນ</th>
//             <th className="text-right pb-1">ລວມ</th>
//           </tr>
//         </thead>
//         <tbody>
//           {cartItems.map((item, index) => (
//             <tr key={index} className="border-b border-gray-100">
//               <td className="py-1.5 max-w-[120px] truncate">
//                 {item.product_name}
//                 <div className="text-[9px] text-gray-500">
//                   @{Number(item.unit_price).toLocaleString()}
//                 </div>
//               </td>
//               <td className="text-center py-1.5">{item.qty}</td>
//               <td className="text-right py-1.5">
//                 {Number(item.subtotal).toLocaleString()}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className="border-b border-dashed border-gray-400 my-2"></div>

//       {/* ສະຫຼຸບຍອດເງິນ */}
//       <div className="space-y-1.5 text-[11px] font-bold">
//         <div className="flex justify-between">
//           <span className="font-normal">ລວມເປັນເງິນ:</span>
//           <span>{Number(orderData.total_amount).toLocaleString()} ກີບ</span>
//         </div>
//         <div className="flex justify-between text-red-600">
//           <span className="font-normal">ສ່ວນຫຼຸດ:</span>
//           <span>-{Number(orderData.discount).toLocaleString()} ກີບ</span>
//         </div>
//         <div className="flex justify-between text-sm font-black border-t pt-1">
//           <span>ຍອດຊຳລະສຸດທິ:</span>
//           <span>{Number(orderData.net_amount).toLocaleString()} ກີບ</span>
//         </div>
        
//         <div className="border-b border-gray-200 my-1"></div>
        
//         <div className="flex justify-between font-normal text-gray-700">
//           <span>ປະເພດຊຳລະ:</span>
//           <span className="font-bold">
//             {orderData.payment_method === "cash" ? "ເງິນສົດ" : "QR Transfer"}
//           </span>
//         </div>
//         <div className="flex justify-between font-normal text-gray-700">
//           <span>ຮັບເງິນມາ:</span>
//           <span>{Number(orderData.amount_paid).toLocaleString()} ກີບ</span>
//         </div>
//         <div className="flex justify-between text-green-700 font-black">
//           <span>ເງິນທອນ:</span>
//           <span>{Number(orderData.change_amount).toLocaleString()} ກີບ</span>
//         </div>
//       </div>

//       {/* ທ້າຍບິນ */}
//       <div className="text-center space-y-1 mt-6 text-[10px] text-gray-500">
//         <div className="border-b border-dashed border-gray-400 my-2"></div>
//         <p>ກວດສອບສິນຄ້າກ່ອນອອກຈາກຮ້ານ</p>
//         <p>*** ບໍ່ຮັບຄືນສິນຄ້າ ***</p>
//       </div>
//     </div>
//   );
// });

// InvoiceReceipt.displayName = "InvoiceReceipt";
// export default InvoiceReceipt;