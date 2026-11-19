import React from 'react';
import {MapPin, Send} from 'lucide-react';
import {translate as L} from './i18n';

const TELEGRAM_BOT_URL = 'https://t.me/Theplov1_bot';

export default function TelegramLocation({lang = 'uz'}) {
  const t = (uz, ru) => L(lang, uz, ru);
  const openChat = event => {
    const telegram = window.Telegram?.WebApp;
    if (typeof telegram?.openTelegramLink === 'function') {
      event.preventDefault();
      telegram.openTelegramLink(TELEGRAM_BOT_URL);
    }
  };

  return <section className="location-card telegram-location-card">
    <div className="location-heading">
      <div className="location-heading-icon"><MapPin size={19} /></div>
      <div>
        <b>{t('Telegram chatda manzil yuboring', 'Отправьте адрес в чате Telegram')}</b>
        <small>{t('Manzil mini ilovada saqlanmaydi.', 'Адрес не сохраняется в мини-приложении.')}</small>
      </div>
    </div>
    <p className="telegram-location-instructions">{t('Chat ochilgach, 📎 yoki + tugmasini bosing va Location / Joylashuvni tanlang.', 'Открыв чат, нажмите 📎 или + и выберите Location / Геопозиция.')}</p>
    <a className="primary full telegram-location-button" href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer" onClick={openChat}>
      <Send size={18} /> {t('Telegram chatni ochish', 'Открыть чат Telegram')}
    </a>
    <p className="telegram-location-note">{t('Lokatsiyani Telegram chatiga o‘zingiz yuborasiz; mini ilova uni olmaydi.', 'Вы отправляете геопозицию в чат Telegram самостоятельно; мини-приложение её не получает.')}</p>
  </section>;
}
