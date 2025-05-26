function canUsePowerUp(userPoints, cost) {
    return userPoints >= cost;
}

function applyPowerUp(type, question, userPoints) {
    switch (type) {
        case "5050":
            // Loại bỏ 2 đáp án sai
            // ... logic ...
            break;
        case "skip":
            // ... logic ...
            break;
        case "extraTime":
            // ... logic ...
            break;
        default:
            throw new Error("Unknown power up");
    }
    // Trừ điểm
    // return { newQuestion, newUserPoints }
}

module.exports = { canUsePowerUp, applyPowerUp };