# 🛍️ Store Page - Implementation Plan

## 🎯 **Overview**
The Store page will be an engaging marketplace where students can spend their earned PyCoins on various items, upgrades, and special features using gamification principles including a gacha system.

## 📋 **Feature Checklist**

### **Store Categories**
- [ ] **Power-Ups & Hints**
  - [ ] Hint packages (5, 10, 25 hints)
  - [ ] Code auto-completion boost (24h)
  - [ ] XP multipliers (2x for 1h, 3h, 24h)
  - [ ] Skip quiz question tokens
  - [ ] Extra time for quizzes
  - [ ] Error highlighter for code editor
  - [ ] Solution peek (show 50% of solution)

- [ ] **Cosmetic Items**
  - [ ] Profile themes/skins
  - [ ] Custom avatars
  - [ ] Profile badges/frames
  - [ ] Code editor themes
  - [ ] Animated backgrounds
  - [ ] Special effects for achievements
  - [ ] Custom fonts for code editor
  - [ ] Profile banners

- [ ] **Gacha System** ⭐
  - [ ] Mystery boxes (Common, Rare, Legendary)
  - [ ] Seasonal gacha events
  - [ ] Limited-time exclusive items
  - [ ] Pity system (guaranteed rare after X pulls)
  - [ ] Collection albums
  - [ ] Trading card system

- [ ] **Learning Enhancers**
  - [ ] Premium lesson access
  - [ ] Early access to new content
  - [ ] Exclusive challenges
  - [ ] Personal AI tutor sessions
  - [ ] Code review credits
  - [ ] Priority support queue

- [ ] **Social Items**
  - [ ] Custom emojis for forums
  - [ ] Name color changes
  - [ ] Special titles
  - [ ] Showcase slots for code
  - [ ] Friend slot expansions
  - [ ] Custom message signatures

### **Store Features**
- [ ] Shopping cart system
- [ ] Wishlist functionality
- [ ] Daily deals section
- [ ] Limited-time offers
- [ ] Bundle packages
- [ ] PyCoins balance display
- [ ] Purchase history
- [ ] Refund system (limited)
- [ ] Gift items to friends
- [ ] Preview before purchase

### **Gacha Mechanics**
- [ ] Single pull option
- [ ] 10-pull with bonus
- [ ] Rarity system (1★ to 5★)
- [ ] Drop rate disclosure
- [ ] Collection progress
- [ ] Duplicate conversion system
- [ ] Event banners
- [ ] Spark system (choose item after X pulls)

## 🎨 **Design Specifications**

### **Layout Structure**
```
┌─────────────────────────────────────────┐
│     PyCoins Balance: 💰 1,250          │
├─────────────────────────────────────────┤
│  Featured  │  Gacha  │  Items  │ Deals │
├─────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │                 │ │                 │ │
│ │  Featured Item  │ │  Special Offer  │ │
│ │    Animation    │ │   Countdown     │ │
│ │                 │ │                 │ │
│ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────┤
│         Category Grid Items             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │Item│ │Item│ │Item│ │Item│ │Item│  │
│  └────┘ └────┘ └────┘ └────┘ └────┘  │
└─────────────────────────────────────────┘
```

### **Gacha Animation UI**
```
┌─────────────────────────────────────────┐
│          LEGENDARY PULL!                │
│     ✨ Particle Effects ✨              │
│         ┌─────────┐                     │
│         │   5★    │                     │
│         │  ITEM   │                     │
│         └─────────┘                     │
│    "Exclusive Code Theme Unlocked!"     │
│        [Share] [Continue]               │
└─────────────────────────────────────────┘
```

## 💻 **Technical Implementation**

### **Routes**
```python
# routes/store_routes.py
@app.route('/store')
@login_required
def store():
    return render_template('store.html')

@app.route('/api/store/items')
def get_store_items():
    # Return available items
    pass

@app.route('/api/store/purchase', methods=['POST'])
def purchase_item():
    # Process purchase
    pass

@app.route('/api/store/gacha/pull', methods=['POST'])
def gacha_pull():
    # Process gacha pull
    pass
```

### **Firebase Collections**
```javascript
// store_items collection
{
  id: "hint_pack_small",
  name: "Hint Pack (5)",
  description: "5 hints to help with challenges",
  category: "power_ups",
  price: 100,
  icon: "lightbulb",
  type: "consumable",
  quantity: 5,
  active: true,
  featured: false
}

// gacha_items collection
{
  id: "neon_theme",
  name: "Neon Code Theme",
  rarity: 5, // 1-5 stars
  category: "themes",
  drop_rate: 0.02, // 2%
  banner: "winter_2025",
  exclusive: true,
  preview_url: "..."
}

// user_inventory collection
{
  user_id: "firebase_uid",
  items: [
    {
      item_id: "hint_pack_small",
      quantity: 3,
      acquired_date: timestamp
    }
  ],
  gacha_collection: [
    {
      item_id: "neon_theme",
      obtained_date: timestamp,
      duplicates: 0
    }
  ],
  purchase_history: []
}
```

### **Gacha System Logic**
```javascript
// static/js/components/gacha.js
class GachaSystem {
    constructor() {
        this.rates = {
            5: 0.02,  // 2% for 5-star
            4: 0.08,  // 8% for 4-star
            3: 0.20,  // 20% for 3-star
            2: 0.30,  // 30% for 2-star
            1: 0.40   // 40% for 1-star
        };
        this.pityCounter = 0;
        this.guaranteedAt = 90;
    }

    performPull(type = 'single') {
        const pulls = type === 'single' ? 1 : 10;
        const results = [];
        
        for (let i = 0; i < pulls; i++) {
            results.push(this.calculateDrop());
        }
        
        return results;
    }

    calculateDrop() {
        // Implement weighted random with pity system
        this.pityCounter++;
        
        if (this.pityCounter >= this.guaranteedAt) {
            this.pityCounter = 0;
            return this.getGuaranteedRare();
        }
        
        return this.weightedRandom();
    }

    showPullAnimation(items) {
        // Epic animation sequence
    }
}
```

### **Store Items Data**
```javascript
const STORE_ITEMS = {
    hints: [
        {
            id: 'hint_5',
            name: 'Starter Hint Pack',
            hints: 5,
            price: 100,
            icon: '💡'
        },
        {
            id: 'hint_25',
            name: 'Pro Hint Bundle',
            hints: 25,
            price: 400,
            icon: '💡',
            badge: 'BEST VALUE'
        }
    ],
    
    multipliers: [
        {
            id: 'xp_2x_1h',
            name: 'XP Boost (1 Hour)',
            multiplier: 2,
            duration: 3600,
            price: 150,
            icon: '⚡'
        }
    ],
    
    themes: [
        {
            id: 'theme_cyberpunk',
            name: 'Cyberpunk Profile',
            price: 500,
            preview: '/static/previews/cyberpunk.png',
            rarity: 'epic'
        }
    ]
};
```

## 💰 **Pricing Strategy**

### **PyCoins Economy**
- Daily login: 10-50 coins
- Lesson completion: 20-50 coins
- Quiz perfect score: 100 coins
- Daily challenge: 50-100 coins
- Achievements: 50-500 coins

### **Item Pricing**
- **Common items**: 50-200 coins
- **Rare items**: 300-800 coins
- **Epic items**: 1000-2500 coins
- **Legendary items**: 3000-5000 coins
- **Single gacha pull**: 150 coins
- **10-pull gacha**: 1300 coins (save 200)

## 🎮 **Gacha Events**

### **Event Types**
1. **Seasonal Banners** (Summer, Winter, etc.)
2. **Holiday Specials** (Halloween, Christmas)
3. **Milestone Celebrations** (Platform anniversary)
4. **Collaboration Events** (Partner content)

### **Event Features**
- Limited-time exclusive items
- Increased drop rates
- Event currency system
- Milestone rewards
- Community goals

## 🔗 **Integration Points**
- [ ] PyCoins balance from user data
- [ ] Achievement system for purchases
- [ ] Analytics for popular items
- [ ] A/B testing for pricing
- [ ] Social sharing for rare pulls
- [ ] Trading system (future)

## 📱 **Mobile Optimization**
- [ ] Touch-friendly item cards
- [ ] Swipe navigation
- [ ] Optimized gacha animations
- [ ] Quick purchase buttons
- [ ] Mobile payment integration

## ⚠️ **Ethical Considerations**
- [ ] Clear odds disclosure
- [ ] Spending limits option
- [ ] Parental controls
- [ ] No pay-to-win mechanics
- [ ] Fair progression without purchases
- [ ] Time-based rewards to prevent addiction

## 🚀 **Implementation Priority**
1. **Phase 1**: Basic store with hint purchases
2. **Phase 2**: Cosmetic items and themes
3. **Phase 3**: Gacha system implementation
4. **Phase 4**: Events and special features