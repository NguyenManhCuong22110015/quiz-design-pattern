export async function setQuiz(topics, questionTypes, numberOfQuestions, difficulty) {
    console.log("💡 Topics:", topics);
    console.log("🎨Question Types:", questionTypes);
    console.log("Number Of Questions:", numberOfQuestions);
    
    return {
        topics,
        questionTypes,
        numberOfQuestions,
        difficulty
    };
}
export async function describeWebsiteInfo(websiteType, mainFeatures, targetAudience, purpose) {
    console.log("🌐 Website Type:", websiteType);
    console.log("✨ Main Features:", mainFeatures);
    console.log("👥 Target Audience:", targetAudience);
    console.log("🎯 Purpose:", purpose);
    
    // Tạo mô tả trang web dựa trên các tham số
    const description = `
# ${websiteType} Website

**Mục đích:** ${purpose}

**Đối tượng:** ${targetAudience || "Tất cả người dùng"}

**Các tính năng chính:**
${mainFeatures.map(feature => `- ${feature}`).join('\n')}

Trang web này được thiết kế để mang lại trải nghiệm tốt nhất cho người dùng, với giao diện thân thiện và các tính năng hữu ích.
`;
    
    return description;
}
