

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
            enum: ["one answer", "điền vào chỗ trống", "đúng/sai", "Multiple choices", "Number response", "Writing response"],
          },
          description: "Các loại câu hỏi sẽ xuất hiện trong bài quiz, ví dụ:  điền vào chỗ trống."
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
      required: ["topics", "questionTypes", "numberOfQuestions","difficulty"]
    }
  };

  export const describeWebsiteDeclaration = {
    name: "describeWebsite",
    description: "Cung cấp thông tin giới thiệu về trang web này cho người dùng",
    parameters: {
      type: "object",
      properties: {
        websiteType: {
          type: "string",
          description: "Loại trang web (ví dụ: giáo dục, thương mại điện tử, mạng xã hội, v.v.)"
        },
        mainFeatures: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Danh sách các tính năng chính của trang web"
        },
        targetAudience: {
          type: "string",
          description: "Đối tượng người dùng mà trang web hướng đến"
        },
        purpose: {
          type: "string",
          description: "Mục đích chính của trang web là gì"
        }
      },
      required: ["websiteType", "mainFeatures", "purpose"]
    }
  };