# Birthday Wish 1 New — Independent Website Template

An exact, independent recreation from scratch of the Cutiepage **Birthday Wish 1 New** (`cp-birthday-wish-v2`) interactive sticker-zine birthday template.

## Features & Screens

1. **Screen 1: Lock Screen (`LockScreen`)**
   - Retro mobile phone frame with dynamic notch island, live clock, and padlock.
   - Notifications: Birthday.app (*"Level up unlocked: +1 year of being iconic"*) and Messages (*"made you something. open it!"*).
   - Interactive slide-to-unlock knob with touch/drag physics.
   - Mascot sticker: Cat in party hat holding birthday cake.
   - Triggers unlock sound and begins background celebration music.

2. **Screen 2: Lights Gate (`LightsGate`)**
   - Dark room state with sleepy moon sticker and hanging pull cord.
   - Interactive pull-cord with spring rebound physics, switch sound, screen flash, and confetti burst.
   - Reveals the bright pastel party room with balloons, bunting, big tape letters spelling **FAVOURITE PERSON**, and tap-to-wiggle mascot cat sticker.

3. **Screen 3: Your Year, Wrapped (`StoryDeck`)**
   - 4 stacked stat cards with 3D depth, borders, and hard drop-shadows:
     - Card 1: 🎬 *Days you were the main character* — **365**
     - Card 2: 💅 *Your top mood this year* — **Iconic**
     - Card 3: ⏱️ *Minutes spent overthinking* — **0**
     - Card 4: 🍕 *Times you made everyone laugh* — **too many to count**
   - Tap top card or button to advance through the deck with card flip sound.

4. **Screen 4: Make a Wish (`HoldToWish`)**
   - Night sky ambiance with floating stars.
   - Interactive circular button with glowing aura and circular SVG progress ring.
   - Hold button for 1.6s to make a wish: synthesizer charge sound, particle effects, confirmation sound, and glassmorphic speech badge (*"Wish sent ✦ delivered to the universe. read ✓✓"*).

5. **Screen 5: Cake Ceremony (`CakeCeremony`)**
   - Step 1: Animated 3D layered birthday cake with lit candles ("2" and "1"). Tap each flame to extinguish with smoke puff and audio feedback.
   - Step 2: Swipe-down gesture (or "cut it for me" button) cuts the cake in half.
   - Step 3: Reveals cross-section strawberry cake layers, confetti celebration, and tablecloth note (*"baked with love (and zero calories)"*).

6. **Screen 6: Gift Box (`GiftBox`)**
   - 3D gift box with lid, ribbon bow, and progress dots.
   - Taps 1 & 2 wobble the box with shake sounds.
   - Tap 3 pops off the lid with confetti and slides out an embossed vintage ticket: *Admit One — One birthday dinner, my treat 🍝*.

7. **Screen 7: Photo Dump (`PhotoDump`)**
   - Newspaper scrapbook editorial collage with rotated frames and tape.
   - Tap any photo card to perform a 3D card flip revealing heartfelt handwritten notes on the back.
   - Pull-quote banner: *“You make every year better. Happy birthday!”*

8. **Screen 8: Letter (`Letter`)**
   - Cream stationery card with paper clip, spun daisy flower, and Caveat handwriting font.
   - Heartfelt message and bunny hugging heart sticker.

9. **Screen 9: Finale & Replay (`Finale`)**
   - Celebratory confetti explosion, floating balloons, banner badge, and sweet sign-off.
   - **Play it again ↺** button cleanly resets all interactive states and rewinds back to Screen 1.

10. **Audio & Sound Synthesizer**
    - High-fidelity Web Audio API procedural sound effects: `unlock`, `switch`, `popper`, `puff`, `cut`, `shake`, `charge`, `win`, `tick`, `tap`, `shutter`, and `horn`.
    - Background celebration music player (`music.mp3`) with floating play/pause/mute chip.

---

## Running the Project Locally

### Prerequisites
- Node.js (v16+) installed.

### Start the Local Server
```bash
cd birthday-wish-template
node dev-server.js
```
Open **`http://localhost:3000`** in any web browser (Chrome, Edge, Safari, Firefox).
