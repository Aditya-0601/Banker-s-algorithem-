# 🏦 Banker's Algorithm Simulator

A modern, highly interactive visual simulator for the **Banker's Deadlock Avoidance Algorithm** using React, Tailwind CSS, and `@xyflow/react`.

Built to help students and developers actually *visualize* the mathematical OS execution graph in real-time, this tool ditches static tables in favor of a step-driven, animated environment prioritizing deep educational flow.

## ✨ Features

- **Step-Driven Graph Visualizer**: Fully interactive Node Graph that only highlights the *active* Need/Allocations in order to drastically reduce visual clutter. 
- **Granular Execution Engine**: Breaking down the algorithm into microscopic steps (`EVALUATING`, `EXECUTING`, `WAITING`, `RELEASING`) so users truly understand the process.
- **Process Flow Checklist**: The right-hand panel locks onto the active process and provides a unified, linear checklist confirming the exact math verifying `Need(i) ≤ Work` bounds.
- **Animated Safe Sequence**: Instantly generates an animated `Safe State / Deadlock` sequence tracker that slides completed processes dynamically into view.
- **State-of-the-art UI/UX**: Crafted entirely with a pristine, deep slate-dark aesthetic. Features glassmorphism, responsive high-contrast node status glows, and customized `input` stepper UI.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Node Graph Engine**: [@xyflow/react](https://reactflow.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Getting Started

To run this application locally on your machine, ensure you have [Node.js](https://nodejs.org/) installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/bankers-algorithm-simulator.git
   cd bankers-algorithm-simulator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`. 

## 🎮 How to Use

1. **Initial Setup**: Use the Left Panel to enter the number of Processes and Resources.
2. **Matrix Input**: Manually fill out the `Allocation`, `Max`, and initial `Available` (Work) matrices. Alternatively, click **Use Example / Generate Random** to auto-fill them. 
3. **Execute Simulation**: Click **Run Simulation**. 
4. **Playback Controls**: The visual UI will seamlessly load over the Center Panel. Use the **Timeline Scrubber** at the bottom to single-step forward and back through the granular computation steps, or toggle **Auto-Play**!

## 🚦 Color Context Map

| Status Glow | State Definition |
|-------------|------------------|
| **Yellow**  | ⏳ Evaluating or Actively Executing resources |
| **Green**   | ✅ Safe / Process completed rendering resources |
| **Red**     | 🛑 Blocked (Waiting) due to `Need > Work`, or DEADLOCK |
| **Slate**   | 🌑 Idle processes not currently checked |

---

> *Designed to transform matrix math into pure visual intuition.*
