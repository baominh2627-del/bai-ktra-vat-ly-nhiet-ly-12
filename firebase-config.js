import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 ĐIỀN CẤU HÌNH FIREBASE CỦA BẠN VÀO ĐÂY
// Lấy từ: Firebase Console → Project Settings → Your apps → Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Xuất các hàm để sử dụng ở nơi khác
export { db, collection, addDoc, serverTimestamp };

// ℹ️ HƯỚNG DẪN CẤU HÌNH FIREBASE:
// 1. Tạo dự án tại: https://console.firebase.google.com
// 2. Bật Firestore Database
// 3. Bật Authentication (tùy chọn)
// 4. Sao chép cấu hình từ Project Settings
// 5. Dán vào đây và thay thế các giá trị trên
//
// Các collection Firebase sẽ được tạo tự động:
// - exam_results: Lưu kết quả bài thi
// - exam_logs: Lưu log thoát khỏi trang
