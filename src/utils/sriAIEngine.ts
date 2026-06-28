const sriPersonality = {
  greeting: [
    "Hey! I'm Sri, your AI teammate. What's on your mind?",
    "What can I help you with today?",
    "Ready to work through some code with you!",
    "Let's build something awesome together.",
  ],
  thinking: [
    "Let me analyze this for you...",
    "Checking the situation...",
    "I'm looking into that...",
    "Investigating the issue...",
  ],
};

export function generateThinkingMessage() {
  const messages = sriPersonality.thinking;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getSriGreeting() {
  const greetings = sriPersonality.greeting;
  return greetings[Math.floor(Math.random() * greetings.length)];
}
