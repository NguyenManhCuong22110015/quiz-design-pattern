function applyConfidenceScore(baseScore, multiplier, isCorrect) {
    if (![1, 2, 3].includes(multiplier)) throw new Error("Invalid multiplier");
    return isCorrect ? baseScore * multiplier : 0;
}

module.exports = { applyConfidenceScore };