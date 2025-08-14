# 🔑 API Keys Setup Guide for Shark 2.0

## 🎯 Quick Setup Steps

### 1. Create Environment File
Create a file named `.env.local` in your project root and add your API keys.

### 2. Get Your API Keys

#### 🤖 **OpenAI (Recommended)**
- **Website:** https://platform.openai.com/api-keys
- **Models:** GPT-4, GPT-3.5-turbo, GPT-4-vision
- **Cost:** Pay-per-use (most reliable)
- **Free Tier:** $5 credit for new accounts

**Steps:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key and add to `.env.local`:
   \`\`\`
   OPENAI_API_KEY=sk-your-key-here
   \`\`\`

#### ⚡ **Groq (Fast & Free)**
- **Website:** https://console.groq.com/keys
- **Models:** Llama 3, Mixtral, Gemma
- **Cost:** Free tier available (very fast)
- **Best for:** Quick responses

**Steps:**
1. Go to https://console.groq.com/keys
2. Sign up with Google/GitHub
3. Click "Create API Key"
4. Copy the key and add to `.env.local`:
   \`\`\`
   GROQ_API_KEY=gsk_your-key-here
   \`\`\`

#### 🚀 **xAI (Latest Grok)**
- **Website:** https://console.x.ai/
- **Models:** Grok-beta, Grok-vision
- **Cost:** Pay-per-use
- **Best for:** Latest AI technology

**Steps:**
1. Go to https://console.x.ai/
2. Sign up or log in
3. Navigate to API Keys
4. Create new key
5. Copy the key and add to `.env.local`:
   \`\`\`
   XAI_API_KEY=xai-your-key-here
   \`\`\`

## 🎯 Recommended Setup

### **Option 1: Full Setup (Best Experience)**
\`\`\`env
OPENAI_API_KEY=sk-your-openai-key
GROQ_API_KEY=gsk_your-groq-key
XAI_API_KEY=xai-your-xai-key
\`\`\`

### **Option 2: Budget Setup (Free/Low Cost)**
\`\`\`env
GROQ_API_KEY=gsk_your-groq-key
OPENAI_API_KEY=sk-your-openai-key
\`\`\`

### **Option 3: Premium Setup (Best Quality)**
\`\`\`env
OPENAI_API_KEY=sk-your-openai-key
XAI_API_KEY=xai-your-xai-key
\`\`\`

## 🧪 Testing Your Setup

1. **Start your app:** `npm run dev`
2. **Click the 🧪 test button** in Shark 2.0
3. **Check the results:**
   - ✅ Working = API key is valid
   - 🔑 No API Key = Key not configured
   - ❌ Error = Invalid key or quota exceeded

## 💡 Pro Tips

### **Cost Management**
- **Groq:** Start here - it's free and fast
- **OpenAI:** Best quality, monitor usage at https://platform.openai.com/usage
- **xAI:** Latest models, check pricing

### **Security**
- Never commit `.env.local` to git (it's in .gitignore)
- Regenerate keys if accidentally exposed
- Use environment variables in production

### **Troubleshooting**
- **"No API Key" error:** Check `.env.local` file name and location
- **"Invalid API Key":** Verify key is copied correctly
- **"Quota exceeded":** Check your billing/usage limits
- **Restart required:** Always restart dev server after adding keys

## 🚀 Production Deployment

### **Vercel**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each key:
   - `OPENAI_API_KEY`
   - `GROQ_API_KEY`
   - `XAI_API_KEY`

### **Other Platforms**
- **Netlify:** Site settings → Environment variables
- **Railway:** Variables tab
- **Heroku:** Config Vars in settings

## 🎯 API Limits & Pricing

### **OpenAI**
- **GPT-4:** ~$0.03 per 1K tokens
- **GPT-3.5:** ~$0.002 per 1K tokens
- **Vision:** ~$0.01 per image

### **Groq**
- **Free Tier:** 14,400 requests/day
- **Very Fast:** Optimized inference

### **xAI**
- **Grok:** Latest pricing on console.x.ai
- **New Models:** Cutting-edge AI

## ✅ Final Checklist

- [ ] Created `.env.local` file
- [ ] Added at least one API key
- [ ] Restarted development server
- [ ] Tested with 🧪 button
- [ ] Verified chat functionality
- [ ] Tested voice features
- [ ] Tried image analysis (OpenAI key required)

**Your Shark 2.0 is now fully powered! 🦈🚀**
