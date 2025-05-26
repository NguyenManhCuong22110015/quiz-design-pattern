

export const createQuizFunctionDeclaration = {
  name: "createQuiz",
  description: "Tạo bài quiz dựa trên các chủ đề và loại câu hỏi mà người dùng cung cấp",
  parameters: {
    type: "object",
    properties: {
      topics: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Danh sách các chủ đề mà bài quiz sẽ tập trung vào, ví dụ: Toán học, Lịch sử, Khoa học."
      },
      questionTypes: {
        type: "array",
        items: {
          type: "string",
          enum: ["SINGLE_ANSWER", "FILL_BLANK", "TRUE_FALSE", "MULTIPLE_ANSWER"],
        },
        description: "Các loại câu hỏi sẽ xuất hiện trong bài quiz, ví dụ: .SINGLE_ANSWER, FILL_BLANK, TRUE_FALSE, MULTIPLE_ANSWER"
      },
      numberOfQuestions: {
        type: "integer",
        description: "Số lượng câu hỏi trong bài quiz.",
        minimum: 1
      },
      difficulty: {
        type: "string",
        description: "Độ khó của bài thi (dễ/trung bình/khó/rất khó).",
      },
    },
    required: ["topics", "questionTypes", "numberOfQuestions", "difficulty"]
  }
};

export const describeWebsiteDeclaration = {
  name: "describeWebsite",
description: "Hàm này được sử dụng để trả về đoạn giới thiệu về trang web hiện tại nhằm giúp người dùng hiểu được trang web có mục đích gì, hoạt động như thế nào và mang lại lợi ích gì. Nội dung đầu ra của hàm này thường là một đoạn văn ngắn mô tả tổng quan trang web, nêu rõ các chức năng chính, đối tượng sử dụng và lý do trang web này hữu ích. Hãy sử dụng hàm này trong các tình huống khi người dùng thể hiện nhu cầu muốn hiểu về nội dung, chức năng, hoặc mục tiêu của trang web – kể cả khi câu hỏi không khớp hoàn toàn với các mẫu cụ thể. Ví dụ, nếu người dùng thể hiện sự tò mò, yêu cầu mô tả, tìm hiểu trang web là gì, hoạt động ra sao, có thể làm gì trên đây, hoặc các yêu cầu chung chung về trang web, thì nên gọi hàm này để trả về thông tin giới thiệu mặc định. Hàm này không phụ thuộc vào từ khóa chính xác, mà dựa trên mục đích chung là cung cấp phần mô tả tổng quan cho người dùng mới hoặc người chưa hiểu rõ trang web.Chỉ gọi hàm này nếu người dùng yêu cầu rõ ràng về việc giới thiệu trang web, ví dụ: trang web này là gì, hoạt động ra sao, mục đích của trang web, v.v. KHÔNG gọi hàm này nếu người dùng chỉ hỏi gợi ý, đề xuất, hoặc từ khóa như 'recommend', 'suggest' mà không nói rõ về trang web."
  ,parameters: {
    type: "object",
    properties: {
      websiteType: {
        type: "string",
        description: "Loại trang web, ví dụ: giáo dục, thương mại điện tử, mạng xã hội, v.v. Nếu không rõ, có thể để trống hoặc ghi 'không xác định'.",
        default: "không xác định"
      },
      mainFeatures: {
        type: "array",
        items: {
          type: "string",
          description: "Tên tính năng cụ thể, ví dụ: đăng ký, giỏ hàng, chat trực tiếp, v.v."
        },
        description: "Danh sách các tính năng chính của trang web, có thể để trống nếu chưa rõ.",
        default: []
      },
      targetAudience: {
        type: "string",
        description: "Đối tượng người dùng chính mà trang web hướng đến, ví dụ: học sinh, người mua hàng, người làm việc tự do. Nếu không xác định, có thể để trống.",
        default: "không xác định"
      },
      purpose: {
        type: "string",
        description: "Mục đích chính của trang web, ví dụ: cung cấp thông tin, bán hàng, kết nối cộng đồng. Nếu không rõ, có thể ghi 'chưa xác định'.",
        default: "chưa xác định"
      }
    },
    // Bỏ required để linh hoạt hơn khi nhập thiếu dữ liệu
    // hoặc chỉ giữ những trường quan trọng nhất:
    required: ["purpose"]
  }
};


export const introduceWebsiteDeclaration = {
  name: "introduceWebsite",
  description: `Hàm này được gọi khi người dùng gửi các tin nhắn có tính chất chào hỏi, mở đầu cuộc trò chuyện. Mục tiêu của hàm là cung cấp một đoạn giới thiệu thân thiện, ngắn gọn và dễ hiểu về vai trò của trợ lý AI và chức năng của trang web.

Các tình huống nên gọi hàm này bao gồm:
- Người dùng chào hỏi như: "Hello", "Hi", "Chào bạn", "Hey", "Có ai ở đây không?", "Tôi cần giúp đỡ".
- Người dùng thể hiện sự tò mò: "Bạn là ai?", "Trang web này dùng để làm gì?", "Ở đây làm được gì?", "Bạn có thể giúp gì cho tôi?".
- Người dùng không rõ cách sử dụng: "Tôi nên bắt đầu từ đâu?", "Có thể giải thích trang web này không?", "Tôi muốn tìm hiểu".
- Người dùng gửi tin nhắn không rõ yêu cầu như: "?", "Haha", "Bắt đầu thế nào nhỉ?", v.v...

Nội dung phản hồi nên:
- Giới thiệu trợ lý AI là gì và có thể giúp gì.
- Nêu mục tiêu của trang web: hỗ trợ tạo quiz, luyện tập, học tập theo chủ đề.
- Hướng dẫn bước tiếp theo: hỏi người dùng muốn học gì, hoặc chọn chủ đề.

Ví dụ đoạn phản hồi từ hàm:
"Xin chào! 👋 Tôi là trợ lý AI tại trang web này. Tôi có thể giúp bạn tạo các bài quiz, luyện tập kiến thức theo chủ đề, hoặc hỗ trợ học tập hiệu quả hơn. Hãy cho tôi biết bạn muốn bắt đầu với chủ đề nào, hoặc tôi có thể gợi ý nếu bạn chưa rõ nhé!"`
};


