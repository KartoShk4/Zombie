document.addEventListener("DOMContentLoaded", () => {
    const effectsSlider = document.getElementById("effects-slider");
    const muteBtn = document.getElementById("mute-btn");

    // Инициализация значений
    effectsSlider.value = effectsVolume * 100;

    // Эффекты
    effectsSlider.addEventListener("input", () => {
        const v = effectsSlider.value / 100;
        setEffectsVolume(v);

        if (!soundEnabled) {
            unmuteSound();
            muteBtn.textContent = "🔇 Выключить звук";
        }
    });

    // Mute
    muteBtn.addEventListener("click", () => {
        if (soundEnabled) {
            muteSound();
            muteBtn.textContent = "🔊 Включить звук";
        } else {
            unmuteSound();
            muteBtn.textContent = "🔇 Выключить звук";
        }
    });
});
