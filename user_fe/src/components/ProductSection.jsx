import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { ethers, formatEther } from "ethers";
import { getBackendUrl } from "../utils/pricing";

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const loadDrugs = async () => {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/public/drugs`);
        if (!res.ok) {
          throw new Error("Failed to fetch drugs from backend");
        }
        const data = await res.json();
        const formatted = data
          .filter((item) => item.stage !== 4)
          .map((item) => {
            const description = `Batch: ${item.batch} | Owner: ${item.owner.slice(
              0,
              6
            )}...${item.owner.slice(-4)}`;
            const normalizedImage = item.image
              ? item.image.startsWith("http")
                ? item.image
                : `${backendUrl}${item.image}`
              : null;
            return {
              id: Number(item.id),
              name: item.name,
              batch: item.batch,
              price: Number(formatEther(item.price.toString())),
              stage: Number(item.stage),
              owner: item.owner,
              imageUrl: normalizedImage,
              description,
            };
          });
        setProducts(formatted);
      } catch (err) {
        console.error("Failed to load drugs:", err);
      }
    };

    loadDrugs();
    getWalletAccount();
  }, []);

  const getWalletAccount = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    }
  };

  const handleBuy = async (product) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: "0xaBeDEfE118d9016Ba5Ff206E5a7D64ef37128fAB", // ví admin
        value: ethers.parseEther(product.price.toString()),
      });

      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt);

      // ⏰ Format timestamp giờ Việt Nam
      const vnTime = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString();

      const backendUrl = getBackendUrl();
      console.log('📤 Sending purchase to backend:', `${backendUrl}/api/purchase`);
      const res = await fetch(`${backendUrl}/api/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: account,
          medicine: [{ name: product.name, qty: 1 }],
          price_eth: product.price,
          tx_hash: tx.hash,
          chain_id: 11155111,
          block_number: receipt.blockNumber,
          timestamp: vnTime, // ✅ thêm dòng này
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errorData.detail || `HTTP ${res.status}`);
      }

      const result = await res.json();
      console.log('✅ Purchase recorded:', result);
      alert("✅ Thanh toán thành công và đã lưu vào doanh thu!");
    } catch (err) {
      console.error("❌ Lỗi khi mua thuốc:", err);
      alert("Giao dịch thất bại.");
    }
  };

  return (
    <section className="py-12 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-10">
          All Medicines (Blockchain)
        </h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-600">No medicines found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
                <button
                  onClick={() => handleBuy(product)}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  Mua ngay ({product.price} ETH)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
