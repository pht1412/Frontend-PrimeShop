import React, { useState, useEffect } from "react";
import "../assets/css/qa.css";

interface QAItem {
  question: string;
  answer: string;
}

const QAPage = () => {
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    // 👉 Sau này gọi API từ Spring Boot
    // const fetchQAData = async () => {
    //   try {
    //     const response = await fetch("http://localhost:8080/api/qa");
    //     const data = await response.json();
    //     setQuestions(data);
    //   } catch (error) {
    //     console.error("Lỗi khi lấy dữ liệu QA:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchQAData();

    // 👉 Hiện tại dùng dữ liệu tĩnh để test
    const mockQuestions = [
      {
        question: "Làm thế nào để đặt hàng trên PrimeShop?",
        answer:
          "Bạn chỉ cần chọn sản phẩm, nhấn vào nút 'Mua' hoặc 'Thêm vào giỏ hàng', sau đó truy cập trang giỏ hàng để tiến hành thanh toán.",
      },
      {
        question: "PrimeShop có giao hàng toàn quốc không?",
        answer:
          "Dạ có ạ! PrimeShop hỗ trợ giao hàng toàn quốc, kể cả các tỉnh thành xa, qua các đối tác vận chuyển uy tín như Giao Hàng Nhanh, Viettel Post,...",
      },
      {
        question: "Thời gian giao hàng là bao lâu?",
        answer:
          "Thông thường đơn hàng sẽ đến tay bạn trong vòng 2 - 5 ngày làm việc tuỳ vào khu vực và hình thức vận chuyển bạn chọn.",
      },
      {
        question: "Tôi có thể đổi/trả hàng không?",
        answer:
          "Bạn được quyền đổi/trả hàng trong vòng 7 ngày nếu sản phẩm bị lỗi do nhà sản xuất hoặc không đúng mô tả. Vui lòng giữ nguyên tem/nhãn và hộp.",
      },
      {
        question: "Tôi có thể nhập hàng số lượng lớn để kinh doanh không?",
        answer:
          "Dĩ nhiên là được rồi ạ! PrimeShop hỗ trợ nhập hàng sỉ, đại lý. Bạn có thể liên hệ trực tiếp với chúng tôi qua mục 'Liên hệ' để được hỗ trợ báo giá sỉ tốt nhất.",
      },
    ];
    setQuestions(mockQuestions);
    setLoading(false);
  }, []);

  const toggleExpand = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  if (loading) return <div className="qa-container">Đang tải...</div>;
  if (questions.length === 0) return <div className="qa-container">Không có câu hỏi nào</div>;

  return (
    <div className="qa-container">
      <h1 className="qa-title">❓ Câu hỏi thường gặp (FAQ)</h1>
      <p className="qa-intro">
        Dưới đây là những câu hỏi phổ biến mà khách hàng thường quan tâm khi đặt hàng trên PrimeShop. Nếu bạn có thêm thắc mắc, đừng ngần ngại liên hệ với chúng tôi nhé!
      </p>

      <div className="qa-list">
        {questions.map((item, index) => (
          <div key={item.question} className="qa-item">
            <h3 className="qa-question" onClick={() => toggleExpand(index)}>
              📌 {item.question}
              <span className="qa-toggle-icon">{expanded === index ? "−" : "+"}</span>
            </h3>
            <div className={`qa-answer ${expanded === index ? "expanded" : "collapsed"}`}>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QAPage;