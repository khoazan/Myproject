import React from "react";
import { Link } from "react-router-dom";

export default function MedicineCard({ m, onNextStage, showNextStage = true, onEdit, onDelete }) {
  // Đổi label stage cuối thành "Sold out" cho dễ hiểu với admin
  const stages = ["Manufactured", "Distributed", "InPharmacy", "Sold", "Sold out"];

  const stageColors = [
    "bg-blue-100 text-blue-700",
    "bg-yellow-100 text-yellow-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
    "bg-red-100 text-red-700",
  ];

  const getImageSrc = () => {
    if (m.image) {
      const img = String(m.image);
      if (img.startsWith("http") || img.startsWith("blob:") || img.startsWith("data:")) {
        return img; // dùng trực tiếp link tuyệt đối hoặc blob/data url
      }
      return `http://127.0.0.1:8000${img}`; // đường dẫn tương đối từ backend
    }
    return `https://source.unsplash.com/400x250/?medicine,${m.name}`;
  };
  const fallbackImg = "https://placehold.co/400x250?text=No+Image";

  const isSoldOut = m.stage === 4;

  return (
    <div
      className={`rounded-2xl bg-white shadow-lg p-5 transition-all duration-200 ease-out flex flex-col justify-between min-h-[300px] ${
        isSoldOut ? "opacity-75 cursor-not-allowed" : "hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
      }`}
      onClick={() => {
        if (!isSoldOut && onEdit) onEdit(m);
      }}
    >
      {/* 🖼️ Ảnh thuốc (fallback nếu không có) */}
      <div className="relative mb-3">
        <img
          src={getImageSrc()}
          alt={m.name}
          className="w-full h-40 object-cover rounded-xl"
          onError={(e) => {
            e.currentTarget.src = fallbackImg;
            e.currentTarget.onerror = null;
          }}
        />
        {isSoldOut && (
          <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-1 truncate">
            {m.name}
          </h2>
          <p className="text-sm text-gray-500">Batch: {m.batch}</p>
          <p className="text-sm text-gray-500 break-words max-w-[30rem]">
            Owner: {m.owner}
          </p>
        </div>

        <div className="flex-shrink-0 text-right">
          <div
            className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${
              stageColors[m.stage]
            }`}
          >
            {stages[m.stage] ?? "Unknown"}
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 my-4"></div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">ID: {m.id}</span>

        {!isSoldOut && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(m);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg transition"
            >
              Sửa thuốc
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(m);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm rounded-lg transition"
            >
              Sold out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
