// Type 1: Trắc nghiệm 1 đáp án (Radio)
// Type 2: Đúng/Sai 4 mệnh đề
// Type 3: Trả lời ngắn (Text)

export const examData = [
  {
    id: "q1",
    type: 1,
    question:
      "Câu 7: Một động cơ nhiệt nhận từ nguồn nóng nhiệt lượng $Q_1$ và thải ra nguồn lạnh nhiệt lượng $Q_2$. Hiệu suất của động cơ được tính bởi công thức",
    options: [
      "A. $H = \\frac{Q_1}{Q_1+Q_2} . 100\\%$",
      "B. $H = \\frac{Q_2}{Q_1} . 100\\%$",
      "C. $H = \\frac{Q_1-Q_2}{Q_1} . 100\\%$",
      "D. $H = \\frac{Q_1-Q_2}{Q_2} . 100\\%$",
    ],
    correctAnswer: 2, // Index 2 tương ứng với C
    explanation:
      "Hiệu suất động cơ nhiệt: $H = \\frac{A}{Q_1} = \\frac{Q_1 - Q_2}{Q_1} \\times 100\\%$.",
  },
  {
    id: "q2",
    type: 1,
    question:
      "Câu 14 (Trích ảnh): Khi một chất lỏng đang sôi ở áp suất chuẩn, nếu ta tiếp tục cung cấp thêm nhiệt lượng thì:",
    options: [
      "A. Nhiệt độ của chất lỏng tiếp tục tăng lên.",
      "B. Nhiệt độ của chất lỏng không đổi.",
      "C. Nhiệt độ của chất lỏng giảm xuống do sự bay hơi mang theo nhiệt.",
      "D. Các phân tử chất lỏng sẽ chuyển động chậm lại.",
    ],
    correctAnswer: 1, // Index 1 tương ứng với B
    explanation:
      "Trong quá trình sôi, nhiệt lượng cung cấp chỉ dùng để chuyển thể từ lỏng sang khí nên nhiệt độ hệ được giữ nguyên không đổi.",
  },
  {
    id: "q3",
    type: 1,
    question:
      "Câu 16 (Trích ảnh): Bình nhiệt lượng kế có lớp không khí giữa hai thành bình. Tác dụng chính của lớp không khí là:",
    options: [
      "A. làm nhiệt độ của chất lỏng trong bình luôn tăng.",
      "B. hạn chế sự truyền nhiệt bằng dẫn nhiệt qua thành bình.",
      "C. làm nội năng của chất lỏng không đổi trong mọi điều kiện.",
      "D. ngăn hoàn toàn sự truyền năng lượng bằng bức xạ.",
    ],
    correctAnswer: 1, // Index 1 tương ứng với B
    explanation:
      "Không khí dẫn nhiệt kém, do đó lớp không khí giúp hạn chế sự hao phí nhiệt qua hiện tượng dẫn nhiệt truyền ra môi trường bên ngoài.",
  },
  {
    id: "q4",
    type: 2,
    question:
      "Nguyên lý 1 Nhiệt động lực học: Xét biểu thức $\\Delta U = A + Q$. Nhận định tính Đúng/Sai của các mệnh đề sau:",
    statements: [
      {
        text: "a) $\\Delta U$ là độ biến thiên nội năng của vật.",
        correct: true,
      },
      {
        text: "b) $Q > 0$ nghĩa là hệ truyền nhiệt cho môi trường.",
        correct: false,
      },
      {
        text: "c) $A > 0$ nghĩa là hệ nhận công từ môi trường.",
        correct: true,
      },
      { text: "d) Đối với hệ cô lập, $\\Delta U = 0$.", correct: true },
    ],
    explanation:
      "Q > 0 là hệ nhận nhiệt lượng (Mệnh đề b sai). Hệ cô lập không trao đổi nhiệt và công nên $\\Delta U = 0$.",
  },
  {
    id: "q5",
    type: 3,
    question:
      "Một hệ nhiệt động nhận nhiệt lượng $150\\text{ J}$ và thực hiện công $40\\text{ J}$ lên môi trường. Tính độ biến thiên nội năng của hệ (J).",
    correctAnswer: "110",
    explanation:
      "Hệ nhận nhiệt ($Q = +150\\text{ J}$), thực hiện công ($A = -40\\text{ J}$). Theo nguyên lý 1 NĐLH: $\\Delta U = A + Q = -40 + 150 = 110\\text{ J}$.",
  },
];
