# Skill: frontend-design

## Note
This skill governs builder aesthetics and implementation quality. 

For this project, the builder must:

1. Commit to a clear aesthetic direction BEFORE writing code: clean, minimal, clinical. White backgrounds. High contrast. Color only for meaning, never decoration. Think: what a nurse would trust on hour 10 of a 12-hour shift.

2. Implement exclusively against `.interface-design/system.md`. No ad-hoc styling decisions.

3. Use semantic tokens by name, not by value. Never hardcode hex, px, or arbitrary Tailwind values in components.

4. Make intentional choices on typography, motion, and spatial composition. This is a professional clinical tool — every element should earn its presence.

5. Never add a component not in the system without flagging it first.

## Clinical UI Principles for This Project

- **Information density:** nurses need to scan fast. Prioritize scannability over visual elegance.
- **Status clarity:** flag states must be immediately distinguishable — never rely on color alone. Use icon + color + label.
- **Interaction confidence:** buttons and controls must look obviously interactive. No ambiguity about what is clickable.
- **Loading states:** every async action (n8n calls can take 3-8 seconds) needs a clear loading indicator. Nurses need to know the system is working.
- **Error states:** if n8n times out or Supabase fails, the UI must communicate this clearly with a recovery path.
- **Whitespace:** generous. Clinical environments are visually noisy. The interface should feel calm.
