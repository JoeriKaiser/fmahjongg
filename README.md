# Mahjong Solitaire App

This is an open source mahjong solitaire game app built using the following technologies:

> [!WARNING]
> This app is under development and not functional yet.

## Tech Stack

- **Language**: TypeScript, Rust
- **Frontend Framework**: React, Tauri
- **UI Library**: shadcn/ui, Radix UI, Lucide, Tailwind CSS
- **3D Rendering**: Three.js (React Three Fiber, Drei)
- **State Management**: Zustand
- **Bundler**: Vite
- **Packaging**: Tauri
- **Runtime**: Bun
- **Builds** (WIP): Windows, MacOS, Linux

## Features

- Interactive mahjong solitaire game board
- Responsive and accessible UI
- Animated 3D game elements
- Persistent game state
- Desktop application

## Roadmap
### v1
 - [ ] Release
 - [ ] Country / Region style leaderboards
 - [ ] Customizable Layout style
 - [ ] Customizable Tile style

### v2

 - [ ] Splitscreen 1v1 mode online (This requires user auth management)
 - [ ] Achievements and progression system
 - [ ] Mobile app version
 - [ ] Customizable game rules and settings
 - [ ] Tutorial or in-game tips for new players
 - [ ] Accessibility features (color blind mode)
 - [ ] Analytics and performance monitoring

## Getting Started for development

1. Clone the repository:

   ```
   git clone https://github.com/JoeriKaiser/fmahjongg.git
   ```

2. Install dependencies:

   ```
   cd fmahjongg
   bun install
   ```

3. Run the development server:

   ```
   bun tauri dev
   ```

   This will start the Vite development server and open the desktop app.

## Contributing

If you'd like to contribute to the project, please follow these steps:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them
4. Push your branch to your forked repository
5. Open a pull request against the main repository

## License

This project is licensed under the [MIT License](LICENSE).