# My Craft — 2D Sandbox Game in p5.js

**My Craft** is a custom 2D Minecraft-like game made with [p5.js](https://p5js.org/).

The project is primarily inspired by **Minecraft** and **The Blockheads**, a 2D side-scrolling sandbox game developed by Majic Jungle Software. The Blockheads combines exploration, mining, crafting, building and survival in procedurally generated worlds.

My Craft takes the core idea of a block-based sandbox and adapts it into a simpler, custom implementation focused on understanding and learning how to perform procedural world generation and block interaction in Javascript.

## HOW TO PLAY
Click [here](https://codemgl.github.io/minecraft-clone-p5js) to test the latest version

## Inspiration

My Craft is inspired by **Minecraft** and **The Blockheads**, particularly their block-based worlds, exploration, mining and building mechanics.

While Minecraft is a 3D game, My Craft adapts these concepts to a custom 2D side-scrolling environment inspired by The Blockheads.

> My Craft is a fan-made programming project and is not affiliated with Mojang, Microsoft, or Majic Jungle Software.

## Technical highlights

* Procedural terrain generation
* Collision detection and bounding boxes
* Block interaction and durability
* Dynamic world drawing (chunks)
* Efficient rendering of the visible world
* Side-scrolling gameplay
* Modular JavaScript architecture
* Custom game mechanics implemented from scratch with p5.js


## Technology

* **JavaScript**
* **p5.js**
* HTML5 Canvas
* CSS

## Project history

The first versions of the project were created using the **p5.js Web Editor** from January 2023 to mid-March 2023.

The latest version from that period can be tested here:

[Play the 2023 version](https://editor.p5js.org/MarcoGaLo/full/N3ZoZR6uM)

In August 2026, the project was moved to a local development environment and its codebase was reorganised for further development.

## Running the project

### Option 1 — VS Code + Live Server

This is the recommended method for the current project.

1. Clone or download the repository.
2. Open the project folder in **VS Code**.
3. Install the **Live Server** extension if necessary.
4. Open `index.html`.
5. Right-click the file and select **Open with Live Server**.
6. The game will open in your browser.

### Option 2 — Node.js

If Node.js is installed, the project can also be served using a simple local HTTP server.

For example, from the project directory:

```bash
npx serve .
```

Then open the local address provided by the server in your browser.

Node.js is only needed here to provide the local development server; it is not the game runtime. The game itself runs in the browser using JavaScript and p5.js.

## Controls

| Action       | Control             |
| ------------ | ------------------- |
| Move left    | `A`                 |
| Move right   | `D`                 |
| Jump         | `W` / `Space`       |
| Break block  | Left mouse button   |
| Place block  | Right mouse button  |
| Select block | Number keys         |



## License

This is an independent fan-made project created for learning and experimentation.

Minecraft and The Blockheads, along with their respective names, assets and trademarks, belong to their respective owners. No original assets from those games are intended to be redistributed as part of this project.
