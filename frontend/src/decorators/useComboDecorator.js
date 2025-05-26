import { useState } from "react";

export function useComboDecorator() {
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);

    const answer = (isCorrect) => {
        if (isCorrect) {
            setCombo((c) => {
                const newCombo = c + 1;
                setMaxCombo((m) => Math.max(m, newCombo));
                return newCombo;
            });
        } else {
            setCombo(0);
        }
    };

    const comboBonus = combo > 0 && combo % 3 === 0 ? 10 : 0;

    return { combo, maxCombo, comboBonus, answer };
}