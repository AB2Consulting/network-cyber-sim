# JHS Football Offline Kiosk

An offline, zero-network digital signage application designed for Raspberry Pi 5.

---

## How to Add Your Pictures
1. Place your `.jpg` or `.png` pictures into the `images/` folder.
2. Run `update_images.py` from a terminal in the kiosk folder:
   ```bash
   cd /home/jhs/JHS_Football_Kiosk
   python3 update_images.py
   ```
3. This will update `config.js` with a list of all your images automatically.

---

## Fixing the `--no-decommit-pooled-pages` Error
This error comes from a **system-wide Chromium defaults file** on the Pi, not from this app.
To fix it, run this command in your terminal on the Pi:
```bash
sudo nano /etc/chromium-browser/default
```
Look for `--no-decommit-pooled-pages` and **delete that entire line**. Save with `Ctrl+X`, then `Y`, then `Enter`.

---

## Raspberry Pi 5 Setup (One-Time)

### Step 1 — Make the startup script executable
```bash
chmod +x /home/jhs/JHS_Football_Kiosk/start_kiosk.sh
```

### Step 2 — Configure Autostart (Using systemd)
Due to changes in recent Raspberry Pi OS updates, the most reliable way to start the kiosk is using a systemd user service.

1. Open your terminal and create a new service file:
   ```bash
   mkdir -p ~/.config/systemd/user
   nano ~/.config/systemd/user/kiosk.service
   ```

2. Paste the following into the file:
   ```ini
   [Unit]
   Description=JHS Football Kiosk
   After=graphical-session.target
   
   [Service]
   ExecStart=/bin/bash /home/jhs/JHS_Football_Kiosk/start_kiosk.sh
   Restart=always
   RestartSec=5
   
   [Install]
   WantedBy=graphical-session.target
   ```
   Save with `Ctrl+X`, then `Y`, then `Enter`.

3. Enable and start the service:
   ```bash
   systemctl --user daemon-reload
   systemctl --user enable kiosk.service
   systemctl --user start kiosk.service
   ```

### Step 3 — Disable Screen Sleep
```bash
sudo raspi-config
```
Go to `Display Options` → `Screen Blanking` → **Disable**.

### Step 4 — Reboot
```bash
sudo reboot
```

The Pi will boot, start a local web server, and open Chromium full-screen with your slideshow running automatically!

---

## Testing Without Rebooting
To manually test the kiosk at any time, open a terminal and run:
```bash
bash /home/jhs/JHS_Football_Kiosk/start_kiosk.sh
```
