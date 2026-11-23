# 🎨 Visual Design Guide - Stage Grid

## Color Palette & Button Styles

### Primary Colors

```
┌─ PLAYBACK ────────────────────┐
│                                │
│  ▶️  ▶️  ▶️                     │
│ [Play]  [Play]  [Play]        │
│ Background: #2ecc71            │
│ Gradient: #2ecc71 → #27ae60   │
│ Shadow: rgba(46, 204, 113, 0.3)│
│                                │
└────────────────────────────────┘

┌─ STOP ─────────────────────────┐
│                                │
│  ⏹️  ⏹️  ⏹️                     │
│ [Stop]  [Stop]  [Stop]        │
│ Background: #e74c3c            │
│ Gradient: #e74c3c → #c0392b   │
│ Shadow: rgba(231, 76, 60, 0.3) │
│                                │
└────────────────────────────────┘

┌─ NAVIGATION ───────────────────┐
│                                │
│  ⏮️  ⏮️  ⏭️  ⏭️               │
│ [Prev] [Prev] [Next] [Next]   │
│ Background: #3498db            │
│ Gradient: #3498db → #2980b9   │
│ Shadow: rgba(52, 152, 219, 0.3)│
│                                │
└────────────────────────────────┘

┌─ LOOPS ────────────────────────┐
│                                │
│  📍  📍  🔁  🔁               │
│ [Loop][Loop][Repeat][Repeat]  │
│ Background: #9c27b0            │
│ Gradient: #9c27b0 → #7b1fa2   │
│ Shadow: rgba(156, 39, 176, 0.3)│
│                                │
└────────────────────────────────┘

┌─ AUDIO ────────────────────────┐
│                                │
│  🔊  🔊  🔇  🔇               │
│ [Fade][Fade][Fade][Fade]      │
│ Background: #f39c12            │
│ Gradient: #f39c12 → #d68910   │
│ Shadow: rgba(243, 156, 18, 0.3)│
│                                │
└────────────────────────────────┘

┌─ ✨ INFINITY LOOP ✨ ───────────┐
│                                │
│        ∞                        │
│   LOOP INFINITO                │
│                                │
│ Background: #ffc107            │
│ Gradient: #ffc107 → #ff9800   │
│ Border: 3px white              │
│ Glow Animation: Pulsing        │
│ Height: 140px (LARGER!)        │
│                                │
└────────────────────────────────┘
```

---

## Layout Sections

### **Desktop View (1024px+)**

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  ✅ Connected to iPad • 192.168.1.100:5004           ║
║                                                        ║
║  🎵 Amazing Grace              02:34 / 05:00           ║
║                     📍 Verso                            ║
║                                                        ║
║  ┌─ REPRODUÇÃO BÁSICA ────────────────────────────────┐║
║  │  ▶️ Play   ⏸️ Pause   ⏹️ Stop                      ││
║  │                                                     ││
║  │  ⏮️ Previous        ⏭️ Next                        ││
║  └─────────────────────────────────────────────────────┘║
║                                                        ║
║  ┌─ LOOPS E REPETIÇÃO ───────────────────────────────┐║
║  │  📍 Loop Section   🔁 Repeat                      ││
║  └─────────────────────────────────────────────────────┘║
║                                                        ║
║  ┌─ BONUS: INFINITY LOOP ────────────────────────────┐║
║  │                                                   ││
║  │                      ∞                            ││
║  │              LOOP INFINITO ✨                     ││
║  │                                                   ││
║  └─────────────────────────────────────────────────────┘║
║                                                        ║
║  ┌─ PADS ─────────────────────────────────────────────┐║
║  │  [1]  [2✓] [3]  [4]                               ││
║  │  [5]  [6✓] [7]  [8]                               ││
║  └─────────────────────────────────────────────────────┘║
║                                                        ║
║  ┌─ VOLUME E ÁUDIO ──────────────────────────────────┐║
║  │  🔊 Fade In        🔇 Fade Out                   ││
║  └─────────────────────────────────────────────────────┘║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

### **Mobile Landscape (480px - 768px)**

```
╔════════════════════════════════════════╗
║                                        ║
║ ✅ Connected to iPad • 192.168...     ║
║                                        ║
║ 🎵 Amazing Grace  02:34 / 05:00       ║
║            📍 Verso                    ║
║                                        ║
║ ▶️ Play   ⏸️ Pause   ⏹️ Stop         ║
║ ⏮️ Prev                 ⏭️ Next       ║
║                                        ║
║ 📍 Loop Section   🔁 Repeat           ║
║                                        ║
║           ∞ LOOP INFINITO ✨          ║
║                                        ║
║ [1] [2✓] [3] [4] [5] [6✓] [7] [8]  ║
║                                        ║
║ 🔊 Fade In          🔇 Fade Out       ║
║                                        ║
╚════════════════════════════════════════╝
```

---

### **Mobile Portrait (< 480px)**

```
╔════════════════════╗
║                    ║
║✅ Connected to iPad║
║                    ║
║ 🎵 Amazing Grace   ║
║ 02:34 / 05:00     ║
║ 📍 Verso           ║
║                    ║
║ ▶️ Play  ⏸️ Pause  ║
║      ⏹️ Stop      ║
║ ⏮️ Prev  ⏭️ Next   ║
║                    ║
║ 📍 Loop Section    ║
║ 🔁 Repeat          ║
║                    ║
║ ∞ LOOP INFINITO ✨ ║
║                    ║
║ [1] [2] [3] [4]   ║
║ [5] [6] [7] [8]   ║
║                    ║
║ 🔊 Fade In         ║
║ 🔇 Fade Out        ║
║                    ║
╚════════════════════╝
```

---

## Button Sizes & Spacing

### Standard Button
```
┌────────────────────┐
│                    │
│       ▶️            │  36px icon
│    Play            │  12px label
│                    │
│  100px × 100px     │
│  12px padding      │
│  16px min-height   │
│                    │
└────────────────────┘
```

### Infinity Loop Button
```
┌──────────────────────────┐
│                          │
│          ∞               │  56px icon
│   LOOP INFINITO ✨       │  16px label
│                          │
│    140px height          │
│    100% width            │
│    24px padding          │
│    Animation: Glow       │
│    Border: 3px white     │
│                          │
└──────────────────────────┘
```

### Pad Button (4-Grid Mobile)
```
┌──────────┐
│    1     │  90px × 90px
│          │  20px font
│          │  Toggle colors
└──────────┘

[1]  [2✓] [3]  [4]      ← 4 colunas mobile
[5]  [6✓] [7]  [8]

12px gap entre pads
```

---

## State Indicators

### Pad States

#### OFF (Inactive)
```
┌──────────┐
│    1     │
│          │  Background: #546e7a → #37474f
│          │  Color: #eceff1
│          │  Border: #90a4ae
│          │  No shadow
└──────────┘
```

#### ON (Active)
```
┌──────────┐
│    2 ✓   │
│          │  Background: #00c853 → #00a040
│          │  Color: #ffffff
│          │  Border: #69f0ae
│  Glow 🌟 │  Shadow: 0 0 16px rgba(0,200,83,0.6)
│          │  Checkmark: Animated pop-in
└──────────┘
```

---

## Connection Status

### Connected (Green)
```
┌─────────────────────────────────────┐
│ ● Connected to iPad • 192.168.1.100 │
│   (pulsing dot)                     │
│   Background: rgba(76, 175, 80, 0.15)
│   Border: 2px solid #4caf50        │
│   Color: #4caf50                   │
│   Font: 600 / 14px                 │
└─────────────────────────────────────┘
```

### Disconnected (Red) - não implementado ainda
```
┌─────────────────────────────────────┐
│ ● Disconnected • Tap to Connect    │
│   (pulsing dot)                     │
│   Background: rgba(231, 76, 60, 0.15)
│   Border: 2px solid #e74c3c        │
│   Color: #e74c3c                   │
│   Font: 600 / 14px                 │
└─────────────────────────────────────┘
```

---

## Hover & Active States

### Desktop Hover
```
Button Position: translateY(-2px)
Shadow: Increased by 50%
Brightness: Slightly lighter gradient
```

### Mobile/Touch Active
```
Button Scale: 0.95 (press down)
Duration: 100ms
No hover effect (touch devices)
```

---

## Animations

### 1️⃣ Infinity Loop Glow
```css
animation: infinity-glow 2s ease-in-out infinite;

0%:    box-shadow: 0 0 24px rgba(255, 193, 7, 0.4)
50%:   box-shadow: 0 0 32px rgba(255, 193, 7, 0.6)  ← Peak
100%:  box-shadow: 0 0 24px rgba(255, 193, 7, 0.4)
```

### 2️⃣ Pad Checkmark Pop
```css
animation: check-pop 0.4s ease;

0%:    transform: scale(0)   opacity: 0
50%:   transform: scale(1.2)  opacity: 1
100%:  transform: scale(1)    opacity: 1
```

### 3️⃣ Status Dot Pulse
```css
animation: pulse 1.5s infinite;

0%:    opacity: 1
50%:   opacity: 0.5
100%:  opacity: 1
```

### 4️⃣ Shimmer (Infinity Button Hover)
```css
animation: shimmer 2s infinite;

Gradient de luz movendo da esquerda para direita
Cria efeito de "brilho"
```

---

## Accessibility

✅ **High Contrast**
- Text: #fff on #0a0e27 (20:1 ratio)
- Buttons: Clear color differentiation
- Icons: 36px - 56px (legível)

✅ **Touch Targets**
- Minimum 100px × 100px
- 12px gap entre botões (evita mis-clicks)
- 10px padding para conforto

✅ **Responsive**
- Adapta a qualquer tamanho
- Landscape e portrait
- Sem scroll horizontal (100% width sections)

✅ **No Animation Seizure Risk**
- Animações < 3Hz
- Apenas glow (não flash)
- Respeita `prefers-reduced-motion`

---

## Browser Support

✅ CSS Features Used:
- `grid` / `flex` - Modern layout
- `gradient` - Smooth colors
- `box-shadow` - Depth
- `animation` - Smooth motion
- `transform` - Performance (GPU)
- `aspect-ratio` - Square pads
- `backdrop-filter` - Glass effect

✅ Suportado em:
- iOS 15+
- Android 11+
- Chrome/Edge 90+
- Firefox 88+

---

## Dark Mode

🌙 **Full Dark Mode** (Padrão)
- Implementado desde o início
- Sem light mode
- Otimizado para palco/ensaio (ambiente escuro)

---

## Print Friendly

📄 Possui media queries para print, embora não seja necessário

---

**Design completo e pronto para produção! 🚀**
