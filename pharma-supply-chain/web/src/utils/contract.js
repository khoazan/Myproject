import { ethers } from "ethers";
import contractABI from "./PharmaSupply.json"; // dùng ABI thật

// 💡 Địa chỉ contract thật của bạn (đã deploy)
const CONTRACT_ADDRESS = "0x83255DDCb49D43A9Ba560231e77ce785dD3D5fB4";

export function getProvider() {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  } else {
    throw new Error("⚠️ Không tìm thấy MetaMask hoặc provider Ethereum nào.");
  }
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("⚠️ Vui lòng cài MetaMask.");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider;
}

export function getContract(signerOrProvider) {
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI.abi,
    signerOrProvider
  );
}
