# Hayvan Sesleri

React Native Expo, TypeScript, Firebase ve Zustand ile hazırlanmış hayvan sesleri öğrenme oyunu.

## Kurulum

```bash
npm install
npm run start
```

Firebase bağlantısı için `.env.example` dosyasını `.env` olarak kopyalayıp değerleri doldurun.

Firestore koleksiyonu: `animals`

```ts
{
  name: "Kedi",
  emoji: "🐱",
  soundUrl: "https://...",
  category: "evcil",
  difficulty: "easy",
  isActive: true
}
```
