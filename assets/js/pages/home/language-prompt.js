const PROMPT_KEY = 'lang-suggest-seen-v2';

const STRINGS = {
  pl: { question: 'Wykryto polskie ustawienia. Przełączyć na polski?', yes: 'Tak', no: 'Nie' },
  nl: { question: 'Nederlandse instellingen gedetecteerd. Overschakelen naar Nederlands?', yes: 'Ja', no: 'Nee' },
  en: { question: 'Detected your locale. Switch language?', yes: 'Yes', no: 'No thanks' }
};

function createPrompt({ targetLang, onAccept, onDismiss }) {
  const strings = STRINGS[targetLang] || STRINGS.en;

  const box = document.createElement('div');
  box.style.cssText =
    'position:fixed;right:20px;top:100px;z-index:2147483647;background:rgba(10,16,22,0.92);backdrop-filter:blur(10px);color:#e9f7ff;' +
    'border:1px solid rgba(96,165,250,0.3);padding:16px 20px;border-radius:16px;display:flex;gap:12px;align-items:center;' +
    'box-shadow:0 12px 32px rgba(0,0,0,0.5);max-width:min(90vw,420px);font-size:0.95rem;opacity:0;transform:translateY(-8px);' +
    'transition:all 0.3s cubic-bezier(0.4,0,0.2,1)';

  const icon = document.createElement('span');
  icon.textContent = '🌐';
  icon.style.cssText = 'font-size:1.4rem;opacity:0.95';
  box.appendChild(icon);

  const message = document.createElement('span');
  message.textContent = strings.question;
  message.style.cssText = 'font-weight:600;letter-spacing:0.3px;flex:1';
  box.appendChild(message);

  const yes = document.createElement('button');
  yes.textContent = strings.yes;
  yes.style.cssText =
    'background:#60a5fa;color:#000;border:0;border-radius:10px;padding:8px 14px;font-weight:700;cursor:pointer;' +
    'transition:all 0.2s;font-size:0.9rem';
  yes.addEventListener('mouseenter', () => {
    yes.style.background = '#3b82f6';
  });
  yes.addEventListener('mouseleave', () => {
    yes.style.background = '#60a5fa';
  });
  box.appendChild(yes);

  const no = document.createElement('button');
  no.textContent = strings.no;
  no.style.cssText =
    'background:transparent;color:#e9f7ff;border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:8px 14px;' +
    'font-weight:600;cursor:pointer;transition:all 0.2s;font-size:0.9rem';
  no.addEventListener('mouseenter', () => {
    no.style.background = 'rgba(255,255,255,0.1)';
    no.style.borderColor = 'rgba(255,255,255,0.3)';
  });
  no.addEventListener('mouseleave', () => {
    no.style.background = 'transparent';
    no.style.borderColor = 'rgba(255,255,255,0.2)';
  });
  box.appendChild(no);

  document.body.appendChild(box);
  requestAnimationFrame(() => {
    box.style.opacity = '1';
    box.style.transform = 'translateY(0)';
  });

  const hide = () => {
    box.style.opacity = '0';
    box.style.transform = 'translateY(-8px)';
    setTimeout(() => box.remove(), 300);
  };

  let timeout = setTimeout(hide, 8000);

  const clearHide = () => {
    if (!timeout) return;
    clearTimeout(timeout);
    timeout = null;
  };

  const restartHide = () => {
    if (timeout) return;
    timeout = setTimeout(hide, 3000);
  };

  box.addEventListener('mouseenter', clearHide);
  box.addEventListener('mouseleave', restartHide);

  yes.addEventListener('click', () => {
    onAccept(targetLang);
    hide();
  });
  no.addEventListener('click', () => {
    onDismiss?.();
    hide();
  });
}

function detectNavigatorLanguage() {
  const pref =
    (Array.isArray(navigator.languages) && navigator.languages[0]) ||
    navigator.language ||
    navigator.userLanguage ||
    '';
  if (/^pl/i.test(pref)) return 'pl';
  if (/^nl/i.test(pref)) return 'nl';
  if (/^en/i.test(pref)) return 'en';
  return '';
}

export function initLanguagePrompt({ getCurrentLanguage, setLanguage }) {
  const forcePrompt = /[?&]forceLangPrompt=1/i.test(location.search);
  if (!forcePrompt && localStorage.getItem(PROMPT_KEY) === '1') return;

  const targetLang = detectNavigatorLanguage();
  if (!targetLang || targetLang === getCurrentLanguage()) return;

  const show = () => {
    const accept = (lang) => {
      setLanguage(lang);
      localStorage.setItem(PROMPT_KEY, '1');
    };

    createPrompt({
      targetLang,
      onAccept: (lang) => {
        accept(lang);
      },
      onDismiss: () => {
        localStorage.setItem(PROMPT_KEY, '1');
      }
    });
  };

  setTimeout(show, 1000);
}
