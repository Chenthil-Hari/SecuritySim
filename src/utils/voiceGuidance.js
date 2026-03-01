let currentUtterance = null;

export function speak(text, settings) {
    if (!settings?.voiceGuidance) return;
    if (!('speechSynthesis' in window)) return;

    stop();

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1;
    currentUtterance.volume = 0.8;

    window.speechSynthesis.speak(currentUtterance);
}

export function stop() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    currentUtterance = null;
}

export function speakScenario(scenario, settings) {
    if (!settings?.voiceGuidance) return;
    speak(`Scenario: ${scenario.title}. Category: ${scenario.category}. ${scenario.description}`, settings);
}

export function speakFeedback(feedback, settings) {
    if (!settings?.voiceGuidance) return;
    speak(feedback, settings);
}
