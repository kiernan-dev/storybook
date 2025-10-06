# StoryBook AI

Create personalized children's stories with AI-generated content and illustrations. Perfect for parents, teachers, and kids who love storytelling!

## What does it do?

- **Write stories instantly** - Just describe what you want and AI creates a complete story
- **Beautiful illustrations** - Generate custom images for each chapter  
- **Easy editing** - Modify stories to make them perfect
- **Save your favorites** - Keep all your stories organized
- **Works everywhere** - Use on your phone, tablet, or computer

## How to use it

1. **Tell us your idea** - "A brave cat saves the neighborhood" or "A magical adventure in space"
2. **Pick the style** - Adventure, Fantasy, Mystery, or other genres
3. **Choose the age group** - Stories adapt to your audience
4. **Watch the magic** - AI creates your story with multiple chapters
5. **Make it yours** - Edit text and generate new illustrations
6. **Save and share** - Keep your stories forever

## Running it yourself

Need Node.js and pnpm installed on your computer.

1. **Get the files**

   ```bash
   git clone <repository-url>
   cd StoryBook_AI
   ```

2. **Install everything**

   ```bash
   pnpm install
   ```

3. **Add your AI key**

   Create a file called `.env.local` and add:

   ```bash
   VITE_OPENROUTER_API_KEY=your_api_key_here
   ```

   Get your key from [OpenRouter](https://openrouter.ai/)

4. **Start the app**

   ```bash
   pnpm run dev
   ```

5. **Open your browser** to `http://localhost:5173`

## About the design

Features a fun Y2K-inspired theme with:

- **Dark mode** with colorful gradients
- **Light mode** for daytime reading  
- **Mobile-friendly** design that works on any device

Enjoy creating amazing stories! ✨
