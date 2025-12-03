import { ethers } from "ethers";
import abi from "./abi.json";

// 💡 Địa chỉ contract thật của bạn (đã deploy)
const CONTRACT_ADDRESS = "0x83255DDCb49D43A9Ba560231e77ce785dD3D5fB4";

export function getProvider() {
  if (!window.ethereum) {
    throw new Error("⚠️ Không tìm thấy MetaMask hoặc provider Ethereum nào.");
  }
  return new ethers.providers.Web3Provider(window.ethereum);
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("⚠️ Vui lòng cài MetaMask.");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider;
}

export function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signerOrProvider);
}
