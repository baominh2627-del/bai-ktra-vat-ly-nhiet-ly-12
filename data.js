export const examData = [
  {
    id: "q1",
    type: 1,
    question:
      "Một động cơ nhiệt nhận từ nguồn nóng nhiệt lượng $Q_1$ và thải ra nguồn lạnh nhiệt lượng $Q_2$. Hiệu suất của đồng cơ được tính bởi công thức (Câu 7 - Mã A05-2k9)",
    options: [
      "A. $H = \\frac{Q_1}{Q_1+Q_2} . 100\\%$",
      "B. $H = \\frac{Q_2}{Q_1} . 100\\%$",
      "C. $H = \\frac{Q_1-Q_2}{Q_1} . 100\\%$",
      "D. $H = \\frac{Q_1}{Q_2} . 100\\%$",
    ],
    correctAnswer: 2,
    explanation:
      "Dựa theo công thức tính hiệu suất động cơ nhiệt: H = A/Q1 = (Q1-Q2)/Q1 * 100%. Đáp án C.",
  },
  {
    id: "q2",
    type: 1,
    question:
      "Trường hợp nội năng của vật bị biến đổi không phải do truyền nhiệt là: (Câu 14 - Mã A05-2k9)",
    options: [
      "A. Gió mùa đông bắc tràn về làm cho không khí lạnh đi.",
      "B. Cho cơm nóng vào bát thi bát cũng thấy nóng.",
      "C. Chậu nước để ngoài nắng một lúc nóng lên.",
      "D. Khi trời lạnh, ta xoa hai bàn tay vào nhau cho ấm lên.",
    ],
    correctAnswer: 3,
    explanation:
      "Xoa hai bàn tay vào nhau là hình thức thực hiện công, không phải truyền nhiệt. Đáp án D.",
  },
  {
    id: "q3",
    type: 2,
    question:
      "Một nhóm học sinh dự định sử dụng bình nhiệt lượng kế để xác định nhiệt nóng chảy riêng của nước đá theo công thức $\\lambda=\\frac{P\\Delta t}{\\Delta m}$. (Phần II - Câu 3 - Mã A05-2k9) <br><br> <div class='image-placeholder'>[Hình vẽ Bình Nhiệt Lượng Kế Phần II Câu 3 - Bạn tự cắt ảnh từ đề A05-2k9.pdf và chèn thẻ &lt;img&gt; vào đây]</div> Nhận định tính Đúng/Sai của các mệnh đề sau:",
    statements: [
      {
        text: "a) Khoảng thời gian cấp điện $\\Delta t$ càng lớn thì nhiệt lượng do dây sợi đốt tỏa ra càng lớn.",
        correct: true,
      },
      {
        text: "b) Nhiệt lượng tổng cộng mà nước đá nhận vào trong thời gian cấp điện $\\Delta t$ là $P\\Delta t$.",
        correct: false,
      },
      {
        text: "c) Nhiệt nóng chảy riêng của nước đá tính được trong hai giai đoạn khác nhau do chưa tính đến phần nhiệt lượng mà nước đá nhận từ môi trường bên ngoài.",
        correct: true,
      },
      {
        text: "d) Kết quả thí nghiệm đã chứng minh được giả thuyết của nhóm học sinh.",
        correct: false,
      },
    ],
    explanation:
      "Mệnh đề (b) sai vì nước đá còn nhận nhiệt từ môi trường. Mệnh đề (d) sai vì kết quả 2 giai đoạn khác nhau chứng tỏ có sự ảnh hưởng của môi trường.",
  },
  {
    id: "q4",
    type: 2,
    question:
      "Một nhóm học sinh dự định làm thí nghiệm để xác định nhiệt nóng chảy riêng của nước đá bằng bộ dụng cụ gồm: phễu chứa nước đá (1); dây điện trở (2); cốc (3); và cân điện tử (4) như hình bên. (Phần II - Câu 4 - Mã A05-2k9) <br><br> <div class='image-placeholder'>[Hình vẽ Bộ thí nghiệm Phần II Câu 4 - Bạn tự cắt ảnh từ đề A05-2k9.pdf và chèn thẻ &lt;img&gt; vào đây]</div> Nhận định Đúng/Sai:",
    statements: [
      {
        text: "a) Ở giai đoạn 1, nước đá nóng chảy do nhận nhiệt từ dây sợi đốt.",
        correct: false,
      },
      {
        text: "b) Ở giai đoạn 2, nhiệt lượng mà nước đá nhận vào lớn hơn $Pt_2$.",
        correct: true,
      },
      {
        text: "c) Nhiệt nóng chảy riêng của nước đá đo được (gián tiếp) là $\\frac{P t_1 t_2}{m_2 t_1 - m_1 t_2}$",
        correct: true,
      },
      {
        text: "d) Nếu $t_1 = t_2 = t$ thì nhiệt lượng mà nước đá nhận từ môi trường trong mỗi giai đoạn là $\\frac{Pm_2 t}{m_2-m_1}$",
        correct: false,
      },
    ],
    explanation:
      "(a) Sai vì giai đoạn 1 chưa cấp điện. (b) Đúng vì ngoài dây điện trở còn nhận nhiệt môi trường. (c) Đúng theo thiết lập phương trình bù trừ nhiệt.",
  },
  {
    id: "q5",
    type: 3,
    question:
      "Ba cốc chứa nước có nhiệt độ lần lượt là $10^{\\circ}C$; $30^{\\circ}C$; $45^{\\circ}C$. (Phần III - Câu 6 - Mã A05-2k9) <br><br> <div class='image-placeholder'>[Hình vẽ 3 Cốc Nước Phần III Câu 6 - Bạn tự cắt ảnh từ đề A05-2k9.pdf và chèn thẻ &lt;img&gt; vào đây]</div> Nếu rót một nửa lượng nước trong cốc 1 và một nửa lượng nước trong cốc 2 vào cốc 3 thì nhiệt độ cân bằng là bao nhiêu độ C? Bỏ qua nhiệt dung của cốc.",
    correctAnswer: "24",
    explanation:
      "Sử dụng phương trình cân bằng nhiệt và khối lượng nước rút ra từ các dữ kiện nhiệt độ 15 độ C và 35 độ C ở câu hỏi. Kết quả là 24 độ C.",
  },
];
