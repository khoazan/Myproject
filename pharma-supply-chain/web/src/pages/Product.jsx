import React, { useEffect, useState } from "react";
import MedicineCard from "../components/MedicineCard";
import { connectWallet, getContract } from "../utils/contract";
import { ethers } from "ethers";

const BACKEND_BASE_URL = "http://127.0.0.1:8000";
const AUTH_TOKEN_KEY = "authToken";
const resolveImageUrl = (image) => {
  if (!image) return null;
  const img = String(image);
  if (img.startsWith("http") || img.startsWith("blob:") || img.startsWith("data:")) {
    return img;
  }
  return `${BACKEND_BASE_URL}${img}`;
};

export default function Product() {
  const [account, setAccount] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editTarget, setEditTarget] = useState(null); // {id,name,batch,price}
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setAccount(window.ethereum.selectedAddress);
    }
    fetchMedicines();
  }, []);
  async function onNextStage(id, newStage) {
    try {
      const provider = await connectWallet();
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const to = await signer.getAddress();

      // ⚙️ Gửi giao dịch lên blockchain qua MetaMask
      const tx = await contract.transferDrug(id, newStage, to);
      alert("⏳ Gửi giao dịch lên blockchain...");
      await tx.wait();

      alert("✅ Chuyển stage thành công!");
      await fetchMedicines(); // reload danh sách
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi chuyển stage: " + (err.message || err));
    }
  }

  async function tryUpdateBackend(id, payload) {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await fetch(`${BACKEND_BASE_URL}/drugs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (_) {
      // bỏ qua nếu backend chưa hỗ trợ
    }
  }

  async function tryDeleteBackend(id) {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      await fetch(`${BACKEND_BASE_URL}/drugs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) {}
  }

  async function uploadDrugImage(drugId, file) {
    if (!file) return null;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      alert("Vui lòng đăng nhập để tải ảnh lên.");
      return null;
    }
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BACKEND_BASE_URL}/drugs/${drugId}/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Tải ảnh thất bại");
    }
    return res.json();
  }

  async function fetchMedicines() {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/public/drugs`);
      if (!res.ok) {
        throw new Error("Không thể lấy danh sách thuốc từ backend");
      }
      const data = await res.json();
      const formatted = data
        .filter((m) => m.stage !== 4)
        .map((m) => ({
          ...m,
          price: ethers.utils.formatEther(m.price.toString()),
        }));
      setMedicines(formatted);
      return formatted;
    } catch (err) {
      console.error("❌ Lỗi khi lấy thuốc:", err);
      alert("❌ Lỗi khi lấy thuốc: " + (err.message || err));
      setMedicines([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMedicine(e) {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const batch = e.target.batch.value.trim();
    const priceStr = e.target.price.value.trim();
    const imageFile = e.target.image?.files?.[0] || null;
    if (!name || !batch || !priceStr) return alert("Nhập đủ thông tin");

    try {
      const provider = await connectWallet();
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const priceWei = ethers.utils.parseEther(priceStr);

      const tx = await contract.addDrug(name, batch, priceWei);
      alert("Đang gửi giao dịch...");
      await tx.wait();

      await fetch(`${BACKEND_BASE_URL}/drugs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({ name, batch, price: parseFloat(priceStr) }),
      });

      alert("✅ Thêm thuốc thành công!");
      e.target.reset();
      setPreviewUrl(null);

      const list = await fetchMedicines();
      if (imageFile && list.length) {
        const newestId = Math.max(...list.map((m) => m.id));
        try {
          await uploadDrugImage(newestId, imageFile);
          await fetchMedicines();
        } catch (imgErr) {
          console.error(imgErr);
          alert("Ảnh chưa được lưu: " + imgErr.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert("❌ " + err.message);
    }
  }

  function openEdit(m) {
    setEditTarget({ id: m.id, name: m.name, batch: m.batch, price: m.price });
    setEditPreviewUrl(resolveImageUrl(m.image));
  }

  async function saveEdit(e) {
    e.preventDefault();
    const form = e.target;
    const id = editTarget.id;
    const name = form.name.value.trim();
    const batch = form.batch.value.trim();
    const price = form.price.value.trim();
    const imageFile = form.image?.files?.[0] || null;

    try {
      // 👉 Gọi blockchain để update thuốc
      const provider = await connectWallet();
      const signer = provider.getSigner();
      const contract = getContract(signer);

      const priceWei = ethers.utils.parseEther(price);
      const tx = await contract.updateDrug(id, name, batch, priceWei);
      alert("⏳ Gửi giao dịch lên blockchain...");
      await tx.wait();
      alert("✅ Cập nhật thuốc trên blockchain thành công!");

      // 👉 Cập nhật backend (nếu có)
      await tryUpdateBackend(id, { name, batch, price: parseFloat(price) });

      // 👉 Cập nhật giao diện
      setMedicines((prev) =>
        prev.map((x) => (x.id === id ? { ...x, name, batch, price } : x))
      );
      setEditTarget(null);

      if (imageFile) {
        try {
          await uploadDrugImage(id, imageFile);
          await fetchMedicines();
        } catch (imgErr) {
          console.error(imgErr);
          alert("Ảnh chưa được lưu: " + imgErr.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật thuốc: " + (err.message || err));
    }
  }

  async function handleDelete(m) {
    if (!confirm(`Xóa thuốc "${m.name}"? (Sẽ chuyển sang trạng thái Cancelled)`)) return;
    try {
      const provider = await connectWallet();
      const signer = provider.getSigner();
      const contract = getContract(signer);
      
      const tx = await contract.removeDrug(m.id);
      alert("⏳ Đang gửi giao dịch lên blockchain...");
      await tx.wait();
      alert("✅ Đã xóa thuốc (chuyển sang Cancelled)!");
      
      // Remove from UI
      setMedicines((prev) => prev.filter((x) => x.id !== m.id));
      
      // Also try backend if available
      await tryDeleteBackend(m.id);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa thuốc: " + (err.message || err));
    }
  }

  const filteredMedicines = medicines.filter((m) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(searchLower) ||
      m.batch.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 text-gray-900">
      <main className="w-full py-10 px-6">
        <form
          onSubmit={handleAddMedicine}
          className="bg-white p-6 rounded-2xl mb-6 max-w-2xl mx-auto shadow-lg border border-blue-200"
        >
          <h2 className="text-xl font-bold mb-4">Thêm thuốc mới</h2>
          <input
            name="name"
            placeholder="Tên thuốc"
            className="w-full mb-3 px-3 py-2 rounded text-black"
          />
          <input
            name="batch"
            placeholder="Batch"
            className="w-full mb-3 px-3 py-2 rounded text-black"
          />
          <input
            name="price"
            placeholder="Giá (ETH)"
            className="w-full mb-3 px-3 py-2 rounded text-black"
          />
          <div className="mb-4">
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreviewUrl(f ? URL.createObjectURL(f) : null);
              }}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                className="mt-3 h-24 w-24 object-cover rounded-lg border border-white/10"
              />
            )}
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg"
          >
            Thêm
          </button>
        </form>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm thuốc theo tên hoặc batch (lô)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg text-gray-900 bg-white border border-blue-200 w-full"
          />
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              Đang tìm: "{searchTerm}" - Tìm thấy {filteredMedicines.length} thuốc
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Đang tải...</div>
        ) : filteredMedicines.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map((m) => (
              <MedicineCard
                key={m.id}
                m={m}
                onNextStage={onNextStage}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">Không có thuốc nào.</div>
        )}
        {/* Edit modal */}
        {editTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white text-slate-900 p-6">
              <h3 className="text-lg font-semibold mb-4">Sửa thuốc</h3>
              <form onSubmit={saveEdit} className="space-y-3">
                <input
                  name="name"
                  defaultValue={editTarget.name}
                  placeholder="Tên thuốc"
                  className="w-full px-3 py-2 rounded border"
                />
                <input
                  name="batch"
                  defaultValue={editTarget.batch}
                  placeholder="Batch"
                  className="w-full px-3 py-2 rounded border"
                />
                <input
                  name="price"
                  defaultValue={editTarget.price}
                  placeholder="Giá (ETH)"
                  className="w-full px-3 py-2 rounded border"
                />
                <div>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setEditPreviewUrl(f ? URL.createObjectURL(f) : null);
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                  />
                  {editPreviewUrl && (
                    <img
                      src={editPreviewUrl}
                      alt="preview"
                      className="mt-3 h-24 w-24 object-cover rounded border"
                    />
                  )}
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditTarget(null)}
                    className="px-4 py-2 rounded bg-slate-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-indigo-600 text-white"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
