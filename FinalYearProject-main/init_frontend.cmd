@echo off
call npx -y create-vite@latest frontend --template react
cd frontend
call npm install
call npm install framer-motion recharts lucide-react axios clsx tailwind-merge
call npm install -D tailwindcss postcss autoprefixer
call npx -y tailwindcss init -p
