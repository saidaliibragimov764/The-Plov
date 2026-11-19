# The Plov

React va Vite yordamida tayyorlangan mobil veb-ilova prototipi. Interfeys o‘zbek, rus va ingliz tillarida ishlaydi; til tanlovi brauzerda saqlanadi.

## Ishga tushirish

```bash
npm install
npm run dev
npm run build
npm test
```

Vercel uchun `dist` build papkasi. Yetkazib berish lokatsiyasi Telegram bot chatida qo‘lda yuboriladi: mini ilovadagi tugma `@Theplov1_bot` chatini ochadi, foydalanuvchi Telegram’da 📎 yoki + tugmasi orqali Location tanlaydi. Lokatsiya mini ilovaga qaytarilmaydi yoki brauzerda saqlanmaydi.

## Buyurtmalar va backend

Loyihada hozircha backend, admin panel, kuryer interfeysi va haqiqiy to'lov mavjud emas. `VITE_ORDERS_API_URL` belgilanmagan bo'lsa, buyurtmalar faqat foydalanuvchi brauzerida namuna sifatida saqlanadi, hech kimga yuborilmaydi. Manzil mini ilovada olinmaydi: mijoz lokatsiyani `@Theplov1_bot` chatiga o'zi yuboradi. Bot va buyurtma backendini bog'lash ushbu prototipda hali amalga oshirilmagan.

Backend yaratilgach `VITE_ORDERS_API_URL` ni bir xil origin ostidagi buyurtma endpointiga, masalan `/api/orders` ga sozlab, qayta build qiling. Frontend POST JSON yuboradi: `id`, `createdAt`, `items` (id, name, qty, price, variant), `paymentMethod`, `baristaNote`, `subtotal`, `deliveryFee` va `total`; lokatsiya bu payloadga kiritilmaydi. Botdan olingan Telegram lokatsiyasini buyurtmaga ishonchli bog'lash uchun backend/bot integratsiyasi alohida kerak. Endpoint muvaffaqiyatda JSON `{ "id": "server-buyurtma-id" }` va 2xx qaytarishi kerak; xatoda savatcha saqlanadi. Backend narxlarni qayta hisoblash, ma'lumotlarni tekshirish, takroriy yuborishni bartaraf etish, maxfiy ma'lumotlarni himoyalash va autentifikatsiya/avtorizatsiya uchun mas'ul. To'lov integratsiyasi alohida kerak.

`src/DeliveryMap.jsx`, `src/addressSearch.js` va `src/OrderLocation.jsx` xarita bilan ishlash uchun qolgan qayta foydalaniladigan modullardir; hozirgi mini ilova ekranlarida ular ishlatilmaydi. Buyurtmalar tarixida lokatsiya xaritasi ko'rsatilmaydi.
