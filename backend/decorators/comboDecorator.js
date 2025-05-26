function calculateComboBonus(comboCount) {
    return comboCount > 0 && comboCount % 3 === 0 ? 10 : 0;
}

module.exports = { calculateComboBonus };